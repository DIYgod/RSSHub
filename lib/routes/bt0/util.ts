import { load } from 'cheerio';
import { CookieJar } from 'tough-cookie';

import { config } from '@/config';
import cache from '@/utils/cache';
import got from '@/utils/got';

const cookieJar = new CookieJar();

async function doGot(num, host, link) {
    if (num > 4) {
        throw new Error('The number of attempts has exceeded 5 times');
    }
    const response = await got.get(link, {
        cookieJar,
    });
    const body: string = response.body;
    let data;
    try {
        data = JSON.parse(body);
    } catch {
        const regex = /document\.cookie\s*=\s*"([^"]*)"/;
        const match = body.match(regex);
        if (!match) {
            throw new Error('api error');
        }
        cookieJar.setCookieSync(match[1], host);
        return doGot(num + 1, host, link);
    }
    return data;
}

const getApiData = async (host: string, endpoint: string, params: Record<string, string | number>) => {
    const credentials = await cache.tryGet(
        `bt0:public-api:${host}`,
        async () => {
            const { data: homepage } = await got(host);
            const $ = load(homepage);
            const scriptUrl = $('script[type="module"][src]').attr('src');
            if (!scriptUrl) {
                throw new Error('Butailing did not return its application script.');
            }
            const { data: script } = await got(new URL(scriptUrl, host).href);
            const appId = script.match(/params\.app_id="([^"]+)"/)?.[1];
            const identity = script.match(/params\.identity="([^"]+)"/)?.[1];
            if (!appId || !identity) {
                throw new Error('Butailing did not return its public API identifiers.');
            }
            return { appId, identity };
        },
        config.cache.contentExpire,
        false
    );
    const { data } = await got(`${host}/prod/api/v1/${endpoint}`, {
        searchParams: {
            ...params,
            app_id: credentials.appId,
            identity: credentials.identity,
        },
    });
    if (data.code !== 200 || !data.success || !data.data) {
        throw new Error(`Butailing API failed: ${data.message ?? data.code}`);
    }
    return data.data;
};

const genSize = (sizeStr) => {
    // Match a numeric file size followed by GB or MB.
    const regex = /^(\d+(\.\d+)?)\s*(gb|mb)$/i;
    const match = sizeStr.match(regex);

    if (!match) {
        return 0;
    }

    const value = Number(match[1]);
    const unit = match[3].toUpperCase();

    let bytes;
    switch (unit) {
        case 'GB':
            bytes = Math.floor(value * 1024 * 1024 * 1024);
            break;
        case 'MB':
            bytes = Math.floor(value * 1024 * 1024);
            break;
        default:
            bytes = 0;
    }
    return bytes;
};

export { doGot, genSize, getApiData };
