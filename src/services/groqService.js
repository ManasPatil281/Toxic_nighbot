const Groq = require('groq-sdk');
const config = require('../config/config');
const logger = require('../utils/logger');

class GroqService {
    constructor() {
        this.groq = new Groq({
            apiKey: config.groq.apiKey,
        });
    }

    async analyzeToxicity(messages) {
        const prompt = this.buildToxicityPrompt(messages);
        
        try {
            const response = await this.groq.chat.completions.create({
                messages: [{
                    role: 'user',
                    content: prompt
                }],
                model: config.groq.model,
                temperature: 0.1,
                max_tokens: 1000,
            });

            return this.parseToxicityResponse(response.choices[0].message.content);
        } catch (error) {
            logger.error('Error analyzing toxicity with Groq:', error);
            return [];
        }
    }

    parseToxicityResponse(response) {
        try {
            // Log first 200 chars only to avoid spam
            logger.info(`Raw Groq response (first 200 chars): ${response.substring(0, 200)}...`);
            
            if (!response || response.trim().length === 0) {
                logger.warn('Empty response from Groq');
                return [];
            }
            
            // Clean the response text
            let cleanedResponse = response.trim();
            
            // Remove any markdown code blocks
            cleanedResponse = cleanedResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '');
            
            // Remove any text before the first [ and after the last ]
            const startIndex = cleanedResponse.indexOf('[');
            const lastIndex = cleanedResponse.lastIndexOf(']');
            
            if (startIndex === -1 || lastIndex === -1 || startIndex >= lastIndex) {
                logger.error('No valid JSON array found in Groq response');
                logger.error(`Response content: ${cleanedResponse}`);
                return [];
            }
            
            let jsonString = cleanedResponse.substring(startIndex, lastIndex + 1);
            
            // More aggressive JSON cleaning
            jsonString = jsonString
                // Remove any text outside the JSON
                .replace(/^[^[]*/, '')
                .replace(/[^\]]*$/, '')
                // Fix common JSON issues
                .replace(/,\s*}/g, '}')
                .replace(/,\s*]/g, ']')
                // Fix unquoted keys
                .replace(/(\w+):\s*(?!["\d\[\{])/g, '"$1": "')
                .replace(/:\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*([,\]}])/g, ': "$1"$2')
                // Fix single quotes
                .replace(/'/g, '"')
                // Remove trailing commas
                .replace(/,(\s*[}\]])/g, '$1')
                // Fix missing quotes around string values
                .replace(/:\s*([a-zA-Z_][^",\]\}]*)\s*([,\]\}])/g, ': "$1"$2');
            
            logger.info(`Cleaned JSON: ${jsonString}`);
            
            let results;
            try {
                results = JSON.parse(jsonString);
            } catch (parseError) {
                logger.error(`JSON parse failed: ${parseError.message}`);
                logger.error(`Failed JSON: ${jsonString}`);
                
                // Try manual parsing as last resort
                return this.manualParseResponse(cleanedResponse);
            }
            
            if (!Array.isArray(results)) {
                logger.error('Groq response is not an array');
                logger.error(`Response type: ${typeof results}`);
                logger.error(`Response content: ${JSON.stringify(results)}`);
                return [];
            }
            
            return results.map((result, index) => {
                const messageIndex = Math.max(0, (result.messageIndex || index + 1) - 1);
                const toxicityScore = Math.min(10, Math.max(0, parseInt(result.toxicityScore) || 0));
                const category = String(result.category || 'unknown');
                const reasoning = String(result.reasoning || 'No reason provided');
                const action = this.validateAction(String(result.action || 'none'));
                
                return {
                    messageIndex,
                    toxicityScore,
                    category,
                    reasoning,
                    action
                };
            });
            
        } catch (error) {
            logger.error('Error parsing Groq response:', error.message);
            logger.error(`Raw response length: ${response?.length || 0}`);
            return [];
        }
    }

    manualParseResponse(response) {
        try {
            logger.info('Attempting manual parsing of Groq response');
            
            // Look for patterns like "messageIndex": 1, "toxicityScore": 5, etc.
            const messagePattern = /"messageIndex":\s*(\d+)/g;
            const scorePattern = /"toxicityScore":\s*(\d+)/g;
            const actionPattern = /"action":\s*"([^"]+)"/g;
            const categoryPattern = /"category":\s*"([^"]+)"/g;
            const reasoningPattern = /"reasoning":\s*"([^"]+)"/g;
            
            const results = [];
            let messageMatch, scoreMatch, actionMatch, categoryMatch, reasoningMatch;
            let index = 0;
            
            // Reset regex lastIndex
            [messagePattern, scorePattern, actionPattern, categoryPattern, reasoningPattern].forEach(regex => {
                regex.lastIndex = 0;
            });
            
            while ((messageMatch = messagePattern.exec(response)) !== null && index < 10) {
                scorePattern.lastIndex = messageMatch.index;
                actionPattern.lastIndex = messageMatch.index;
                categoryPattern.lastIndex = messageMatch.index;
                reasoningPattern.lastIndex = messageMatch.index;
                
                scoreMatch = scorePattern.exec(response);
                actionMatch = actionPattern.exec(response);
                categoryMatch = categoryPattern.exec(response);
                reasoningMatch = reasoningPattern.exec(response);
                
                if (scoreMatch && actionMatch) {
                    results.push({
                        messageIndex: parseInt(messageMatch[1]) - 1,
                        toxicityScore: Math.min(10, Math.max(0, parseInt(scoreMatch[1]))),
                        category: categoryMatch ? categoryMatch[1] : 'unknown',
                        reasoning: reasoningMatch ? reasoningMatch[1] : 'Manual parsing',
                        action: this.validateAction(actionMatch[1])
                    });
                }
                
                index++;
            }
            
            logger.info(`Manual parsing extracted ${results.length} results`);
            return results;
            
        } catch (error) {
            logger.error('Manual parsing also failed:', error.message);
            return [];
        }
    }

    validateAction(action) {
        if (!action || typeof action !== 'string') return 'none';
        
        const cleanAction = action.toLowerCase().trim();
        const validActions = ['none', 'warn', 'delete', 'timeout', 'ban'];
        
        if (validActions.includes(cleanAction)) {
            return cleanAction;
        }
        
        // Map common variations
        const actionMap = {
            'warning': 'warn',
            'remove': 'delete',
            'kick': 'timeout',
            'block': 'ban',
            'ignore': 'none',
            'no_action': 'none',
            'no action': 'none'
        };
        
        return actionMap[cleanAction] || 'none';
    }

    buildToxicityPrompt(messages) {
        const messageList = messages.map((msg, index) => 
            `${index + 1}. [${msg.author.name}]: ${msg.message.replace(/"/g, "'")}`
        ).join('\n');

        return `You are a content moderation AI. Analyze these YouTube chat messages for toxicity.

TOXICITY SCALE (0-10):
0-2: Clean/Positive → none
3-4: Mild toxicity → warn  
5-6: Moderate toxicity → delete
7-8: High toxicity → timeout
9-10: Extreme toxicity → ban

MESSAGES:
${messageList}

Respond with ONLY valid JSON array (no markdown, no extra text):
[{"messageIndex":1,"toxicityScore":5,"category":"harassment","reasoning":"brief reason","action":"delete"}]

Valid actions: none, warn, delete, timeout, ban
Return valid JSON only.`;
    }
}

module.exports = GroqService;
