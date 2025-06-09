const { google } = require('googleapis');
const config = require('../src/config/config');

async function checkStreamStatus() {
    console.log('🔍 Checking YouTube Live Stream Status...\n');

    const oauth2Client = new google.auth.OAuth2(
        config.youtube.oauth.clientId,
        config.youtube.oauth.clientSecret,
        config.youtube.oauth.redirectUri
    );

    // Set credentials
    oauth2Client.setCredentials({
        access_token: config.youtube.tokens.accessToken,
        refresh_token: config.youtube.tokens.refreshToken
    });

    const youtube = google.youtube({
        version: 'v3',
        auth: oauth2Client
    });

    try {
        // Check all live broadcasts
        console.log('📡 Fetching all live broadcasts...');
        const allBroadcasts = await youtube.liveBroadcasts.list({
            part: 'snippet,status,contentDetails',
            mine: true,
            maxResults: 50
        });

        console.log(`Found ${allBroadcasts.data.items?.length || 0} total broadcasts:\n`);

        if (allBroadcasts.data.items && allBroadcasts.data.items.length > 0) {
            allBroadcasts.data.items.forEach((broadcast, index) => {
                console.log(`${index + 1}. ${broadcast.snippet.title}`);
                console.log(`   Status: ${broadcast.status.lifeCycleStatus}`);
                console.log(`   Privacy: ${broadcast.status.privacyStatus}`);
                console.log(`   Live Chat ID: ${broadcast.snippet.liveChatId || 'None'}`);
                console.log(`   Scheduled: ${broadcast.snippet.scheduledStartTime || 'Not scheduled'}`);
                console.log(`   Started: ${broadcast.snippet.actualStartTime || 'Not started'}`);
                console.log('');
            });

            // Check for live broadcasts specifically
            const liveStreams = allBroadcasts.data.items.filter(item => 
                item.status.lifeCycleStatus === 'live' || 
                item.status.lifeCycleStatus === 'testing'
            );

            console.log(`\n🔴 Active live streams: ${liveStreams.length}`);
            
            if (liveStreams.length > 0) {
                liveStreams.forEach((stream, index) => {
                    console.log(`${index + 1}. ${stream.snippet.title}`);
                    console.log(`   Live Chat ID: ${stream.snippet.liveChatId || '❌ No chat'}`);
                    console.log(`   Chat enabled: ${stream.snippet.liveChatId ? '✅ Yes' : '❌ No'}`);
                });
            }

            // Check for streams without chat
            const streamsWithoutChat = liveStreams.filter(item => !item.snippet.liveChatId);
            if (streamsWithoutChat.length > 0) {
                console.log('\n⚠️  Live streams without chat:');
                streamsWithoutChat.forEach((stream, index) => {
                    console.log(`${index + 1}. ${stream.snippet.title}`);
                    console.log('   💡 Enable chat in YouTube Studio');
                });
            }

        } else {
            console.log('❌ No broadcasts found. Please:');
            console.log('1. Start a live stream on YouTube');
            console.log('2. Enable live chat in YouTube Studio');
            console.log('3. Wait a few minutes for API sync');
        }

        // Check channel info
        console.log('\n📺 Channel Information:');
        const channelInfo = await youtube.channels.list({
            part: 'snippet,status',
            mine: true
        });

        if (channelInfo.data.items && channelInfo.data.items.length > 0) {
            const channel = channelInfo.data.items[0];
            console.log(`Channel: ${channel.snippet.title}`);
            console.log(`Channel ID: ${channel.id}`);
            console.log(`Config Channel ID: ${config.youtube.channelId}`);
            console.log(`Match: ${channel.id === config.youtube.channelId ? '✅' : '❌'}`);
        }

    } catch (error) {
        console.error('❌ Error checking stream status:', error.message);
        
        if (error.code === 401) {
            console.log('\n🔑 Authentication issue. Try:');
            console.log('npm run authenticate');
        }
    }
}

checkStreamStatus().catch(console.error);
