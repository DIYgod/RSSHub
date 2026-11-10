import type { CookieJar } from 'tough-cookie';

// Workers' native fetch does not manage cookies or restrict sensitive redirect headers.
export default async function cookieFetch(url: string, jar: CookieJar | undefined, requestHeaders?: HeadersInit): Promise<Response> {
    const origin = new URL(url).origin;
    for (let redirects = 0; redirects <= 10; redirects++) {
        const headers = new Headers(requestHeaders);
        const cookie = jar?.getCookieStringSync(url);
        if (cookie) {
            headers.set('cookie', cookie);
        }
        // eslint-disable-next-line no-await-in-loop
        const response = await fetch(url, { headers, redirect: 'manual' });
        for (const value of response.headers.getSetCookie()) {
            jar?.setCookieSync(value, url, { ignoreError: true });
        }
        const location = response.headers.get('location');
        if (![301, 302, 303, 307, 308].includes(response.status) || !location) {
            return response;
        }
        // eslint-disable-next-line no-await-in-loop
        await response.body?.cancel();
        const next = new URL(location, url);
        if (next.origin !== origin) {
            throw new Error('Twitter request redirected outside its original origin');
        }
        url = next.href;
    }
    throw new Error('Twitter request exceeded the redirect limit');
}
