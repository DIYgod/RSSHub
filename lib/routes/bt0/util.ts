import got from '@/utils/got';

// The site formerly at (1-9)bt0.com now serves from web{domain}.mukaku.com as a Vue SPA backed
// by a JSON API under /prod/api/v1/. Every request must carry app_id + identity: both are
// constants hardcoded in the site's own JS bundle (an axios interceptor appends them to every
// call) rather than per-visitor tokens, so replaying them verbatim is exactly what the site does.
const APP_ID = '83768d9ad4';
const IDENTITY = '23734adac0301bccdcb107c4aa21f96c';

const host = (domain) => `https://web${domain}.mukaku.com`;

// Call a /prod/api/v1/ endpoint and return its `data` payload, throwing on the API's own error envelope.
const api = async (domain, path, params = {}) => {
    const { data: body } = await got(`${host(domain)}/prod/api/v1/${path}`, {
        searchParams: {
            ...params,
            app_id: APP_ID,
            identity: IDENTITY,
        },
    });

    if (!body?.success) {
        throw new Error(`mukaku api ${path} failed: ${body?.code} ${body?.message}`);
    }

    return body.data;
};

const genSize = (sizeStr) => {
    // 正则表达式，用于匹配数字和单位 GB 或 MB
    const regex = /^(\d+(\.\d+)?)\s*(gb|mb)$/i;
    const match = sizeStr.match(regex);

    if (!match) {
        return 0;
    }

    const value = Number.parseFloat(match[1]);
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

export { api, genSize, host };
