const Anthropic = require('@anthropic-ai/sdk');
const config = require('../config/config');
const logger = require('../utils/logger');

class ClaudeService {
    constructor() {
        this.anthropic = new Anthropic({
            apiKey: config.claude.apiKey,
        });
    }

    async analyzeToxicity(messages) {
        const prompt = this.buildToxicityPrompt(messages);
        
        try {
            const response = await this.anthropic.messages.create({
                model: config.claude.model,
                max_tokens: 1000,
                messages: [{
                    role: 'user',
                    content: prompt
                }]
            });

            return this.parseToxicityResponse(response.content[0].text);
        } catch (error) {
            logger.error('Error analyzing toxicity:', error);
            return [];
        }
    }

    buildToxicityPrompt(messages) {
        const messageList = messages.map((msg, index) => 
            `${index + 1}. [${msg.author.name}]: ${msg.message}`
        ).join('\n');

        return `You are a content moderation AI for a YouTube live chat. Analyze the following messages for toxicity and provide a toxicity score and reasoning for each message.

TOXICITY SCALE:
0-2: Clean/Positive (no action needed)
3-4: Mild toxicity (warning appropriate)
5-6: Moderate toxicity (timeout/delete message)
7-8: High toxicity (temporary ban)
9-10: Extreme toxicity (permanent ban)

CONSIDER AS TOXIC:
- Hate speech, slurs, discrimination
- Harassment, bullying, personal attacks
- Spam, excessive caps, repetitive content
- Sexual content, inappropriate language
- Threats, violence, harmful content
- Trolling, inflammatory behavior

MESSAGES TO ANALYZE:
${messageList}

Respond with ONLY a JSON array in this exact format:
[
  {
    "messageIndex": 1,
    "toxicityScore": 0-10,
    "category": "hate_speech|harassment|spam|sexual|threats|trolling|clean",
    "reasoning": "brief explanation",
    "action": "none|warn|delete|timeout|ban"
  }
]

Be strict but fair. Consider context and intent. Return valid JSON only.`;
    }

    parseToxicityResponse(response) {
        try {
            // Extract JSON from response (in case there's extra text)
            const jsonMatch = response.match(/\[[\s\S]*\]/);
            if (!jsonMatch) {
                logger.error('No JSON found in Claude response');
                return [];
            }

            const results = JSON.parse(jsonMatch[0]);
            return results.map(result => ({
                messageIndex: result.messageIndex - 1, // Convert to 0-based index
                toxicityScore: result.toxicityScore,
                category: result.category,
                reasoning: result.reasoning,
                action: result.action
            }));
        } catch (error) {
            logger.error('Error parsing Claude response:', error);
            return [];
        }
    }
}

module.exports = ClaudeService;
