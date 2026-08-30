import ofetch from '@/utils/ofetch';
import { config } from '@/config';

let cachedToken: string | null = null;
let tokenExpiry = 0;

/**
 * Fetch an App Access Token from Twitch using client credentials flow.
 * Token is cached and refreshed automatically when expired.
 */
export async function getAccessToken(): Promise<string> {
    const now = Date.now();

    if (cachedToken && now < tokenExpiry) {
        return cachedToken;
    }

    const clientId = config.twitch?.clientId;
    const clientSecret = config.twitch?.clientSecret;

    if (!clientId || !clientSecret) {
        throw new Error('Twitch Client ID and Client Secret are required. Set TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET environment variables.');
    }

    const data = await ofetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'client_credentials',
        }),
    });

    cachedToken = data.access_token;
    // Expire 60 seconds before actual expiry for safety
    tokenExpiry = now + (data.expires_in - 60) * 1000;

    return cachedToken!;
}

/**
 * Return headers required for all Twitch Helix API calls.
 */
export async function getTwitchHeaders(): Promise<Record<string, string>> {
    const clientId = config.twitch?.clientId;
    const token = await getAccessToken();

    return {
        'Client-ID': clientId!,
        Authorization: `Bearer ${token}`,
    };
}

/**
 * Resolve a Twitch login name to a numeric user ID.
 */
export async function getUserId(login: string): Promise<{ id: string; display_name: string; profile_image_url: string }> {
    const headers = await getTwitchHeaders();

    const data = await ofetch(`https://api.twitch.tv/helix/users?login=${encodeURIComponent(login)}`, { headers });

    if (!data.data || data.data.length === 0) {
        throw new Error(`Twitch user not found: ${login}`);
    }

    return data.data[0];
}
