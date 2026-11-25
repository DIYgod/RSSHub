import { hash } from 'node:crypto';

import { config } from '@/config';
import ofetch from '@/utils/ofetch';

const rootUrl = 'https://www.baozimh.com';

const getCookies = (headers: Headers) =>
    headers
        .getSetCookie()
        .map((cookie) => cookie.split(';', 1)[0])
        .join('; ');

export const getGatekeeperHeaders = async () => {
    const userAgent = config.ua;
    const start = await ofetch.raw(`${rootUrl}/__gatekeeper_challenge/start?return=%2F`, {
        headers: { 'user-agent': userAgent },
        responseType: 'text',
    });
    const browserCookie = getCookies(start.headers);
    const challengeId = start._data?.match(/challengeId:"(\w+)"/)?.[1];
    const ticket = start._data?.match(/ticket:"([^"]+)"/)?.[1];
    const difficultyBits = Number(start._data?.match(/difficultyBits:(\d+)/)?.[1]);

    let nonce = 0;
    while (hash('sha256', `gatekeeper-pow-v1:${challengeId}:${nonce}`, 'buffer').readUInt32BE(0) >= 2 ** (32 - difficultyBits)) {
        nonce++;
    }

    const verify = await ofetch.raw(`${rootUrl}/__gatekeeper_challenge/verify`, {
        method: 'POST',
        headers: { 'user-agent': userAgent, cookie: browserCookie, origin: rootUrl },
        body: { challenge_id: challengeId, ticket, nonce: String(nonce) },
    });

    return { 'user-agent': userAgent, cookie: getCookies(verify.headers) };
};
