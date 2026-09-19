import { config } from '@/config';
import cache from '@/utils/cache';
import md5 from '@/utils/md5';
import ofetch from '@/utils/ofetch';

/**
 * 通过 /c/f/frs/page API 获取贴吧帖子列表
 * 使用贴吧客户端签名认证，无需 Puppeteer
 */
const TIEBA_CLIENT_SECRET = 'tiebaclient!!!';

type TiebaClientParams = {
    _client_id: string;
    _client_type: string;
    _client_version: string;
    _phone_imei: string;
    from: string;
    kw: string;
    rn: string;
    pn: string;
    BDUSS: string;
    is_good?: string;
    cid?: string;
    sort_type?: string;
    sign?: string;
};

const computeSign = (params: Partial<TiebaClientParams> & Record<string, string>): string => {
    // oxlint-disable-next-line unicorn-js/require-array-sort-compare
    const sortedKeys = Object.keys(params).toSorted();
    const raw = sortedKeys.map((key) => `${key}=${params[key]}`).join('') + TIEBA_CLIENT_SECRET;
    return md5(raw);
};

export const tiebaClientRequest = async (path: string, params: Partial<TiebaClientParams> & Record<string, string>) => {
    const bduss = config.baidu.cookie?.match(/BDUSS=([^;]+)/)?.[1];
    const apiParams: Partial<TiebaClientParams> & Record<string, string> = {
        _client_id: `wappc_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        _client_type: '2',
        _client_version: '12.20.1.0',
        _phone_imei: '000000000000000',
        from: 'tieba',
        ...(bduss && { BDUSS: bduss }),
        ...params,
    };
    apiParams.sign = computeSign(apiParams);

    const cacheKey = `tieba:api:${path}:${new URLSearchParams(params).toString()}`;
    const data = await cache.tryGet(
        cacheKey,
        () =>
            ofetch(`https://tieba.baidu.com${path}`, {
                method: 'POST',
                body: new URLSearchParams(apiParams),
                parseResponse: JSON.parse, // content-type application/x-javascript
            }),
        config.cache.routeExpire,
        false
    );
    if (Number(data.error_code) !== 0) {
        throw new Error(`Tieba API error: ${data.error_msg || data.error_code}`);
    }
    return data;
};

export const renderContent = (items: any[] = []) =>
    items
        .map((item) => {
            switch (Number(item.type)) {
                case 1:
                case 18:
                    return `<a href="${item.link}">${item.text}</a>`;
                case 2:
                    return `<img src="https://tb3.bdstatic.com/emoji/${item.text}@2x.png" alt="${item.c}">`;
                case 3:
                    return `<img src="${item.origin_src || item.src}">`;
                default:
                    return item.text ?? '';
            }
        })
        .join('');
