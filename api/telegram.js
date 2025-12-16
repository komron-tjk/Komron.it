export default async function handler(request, response) {
    // CORS configuration to allow requests from your site
    response.setHeader('Access-Control-Allow-Credentials', true)
    response.setHeader('Access-Control-Allow-Origin', '*')
    response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
    response.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    )

    // Handle OPTIONS request for CORS preflight
    if (request.method === 'OPTIONS') {
        response.status(200).end()
        return
    }

    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    const { text } = request.body;

    if (!text) {
        return response.status(400).json({ error: 'Text is required' });
    }

    // Get secrets from Environment Variables
    const BOT_TOKEN = process.env.BOT_TOKEN;
    const CHAT_ID = process.env.CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) {
        return response.status(500).json({ error: 'Server misconfiguration: Missing secrets' });
    }

    try {
        const telegramResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: text,
                parse_mode: 'HTML'
            })
        });

        const data = await telegramResponse.json();

        if (!telegramResponse.ok) {
            throw new Error(data.description || 'Telegram API Error');
        }

        return response.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error sending message:', error);
        return response.status(500).json({ error: error.message });
    }
}
