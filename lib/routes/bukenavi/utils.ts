import { config } from '@/config';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import ofetch from '@/utils/ofetch';

const HOST = 'https://bukenavi.jp';
const SESSION_KEY = 'bukenavi:session';
/** The site keeps a session far longer than this; a fresh login costs two requests, a stale one costs a feed. */
const SESSION_TTL = 3600;

/** Laravel form: `_token` on the login page, then POST email + password to `/kanto/login`. */
const TOKEN = /name="_token"[^>]*value="([^"]+)"/;

const cookiesFrom = (headers: Headers, into: Map<string, string>): Map<string, string> => {
    const lines = headers.getSetCookie?.() ?? [];
    for (const line of lines) {
        const [pair] = line.split(';', 1);
        const eq = pair.indexOf('=');
        if (eq > 0) {
            into.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim());
        }
    }
    return into;
};

const serialise = (jar: Map<string, string>): string => [...jar].map(([k, v]) => `${k}=${v}`).join('; ');

/**
 * Signs in and returns the cookie header, or null when it did not take.
 *
 * The POST answers 404 — the site redirects to whatever `transitions` holds and that is empty here — but it
 * still sets the session, so the status is deliberately ignored and success is judged by the session cookie.
 */
const login = async (email: string, password: string): Promise<string | null> => {
    const jar = new Map<string, string>();
    const page = await ofetch.raw(`${HOST}/kanto/user/login`, { responseType: 'text' });
    cookiesFrom(page.headers, jar);
    const token = TOKEN.exec(page._data ?? '')?.[1];
    if (token === undefined) {
        logger.warn('bukenavi: the login page carried no _token; the form has probably changed');
        return null;
    }

    const body = new URLSearchParams({ _token: token, email, password, auto: '1', transitions: '' });
    const res = await ofetch.raw(`${HOST}/kanto/login`, {
        method: 'POST',
        body,
        headers: { Cookie: serialise(jar), Referer: `${HOST}/kanto/user/login`, 'Content-Type': 'application/x-www-form-urlencoded' },
        redirect: 'manual',
        ignoreResponseError: true,
        responseType: 'text',
    });
    cookiesFrom(res.headers, jar);
    if (!jar.has('bukenavi_session')) {
        logger.warn('bukenavi: sign-in did not return a session cookie; check BUKENAVI_EMAIL / BUKENAVI_PASSWORD');
        return null;
    }
    return serialise(jar);
};

/**
 * The cookie header for a signed-in session, or null when no credentials are configured or sign-in failed.
 *
 * Signing in is optional on purpose. 住所 down to the 番地, 物件名, 保証金・敷金, 礼金, 償却, 共益費, 造作譲渡金額,
 * 契約年数 and 座席 are 会員限定; without credentials the routes stay guests and simply leave those `null`,
 * which is what an upstream user with no account gets.
 */
export const memberCookie = async (): Promise<string | null> => {
    const { email, password } = config.bukenavi ?? {};
    if (!email || !password) {
        return null;
    }
    const cached = await cache.get(SESSION_KEY);
    if (cached) {
        return cached;
    }
    const cookie = await login(email, password);
    if (cookie !== null) {
        cache.set(SESSION_KEY, cookie, SESSION_TTL);
    }
    return cookie;
};

/** Drops the cached session so the next call signs in again. */
export const forgetSession = (): void => {
    cache.set(SESSION_KEY, '', 1);
};

/** A page fetched as a member says so in its header; a guest page does not. */
export const isSignedIn = (html: string): boolean => html.includes('ログアウト');
