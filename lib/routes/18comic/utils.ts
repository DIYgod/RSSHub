import { load } from 'cheerio';
import CryptoJS from 'crypto-js';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import md5 from '@/utils/md5';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

import { renderDescription } from './templates/description';

const defaultDomain = 'jmcomic1.me';
// list of address: https://jmcomic2.bet
const allowDomain = new Set(['18comic.vip', '18comic.org', 'jmcomic.me', 'jmcomic1.me', 'jm-comic3.art', 'jm-comic.club', 'jm-comic2.ark']);

// the API domains change often, the current list is published at apiDomainServer (AES encrypted)
const apiDomainServer = 'https://rup4a04-c01.tos-ap-southeast-1.bytepluses.com/newsvr-2025.txt';
const fallbackApiDomains = ['www.cdnhjk.net', 'www.cdnutc.cc', 'www.cdngwc.net', 'www.cdngwc.club'];

const getRootUrl = (domain) => {
    if (!config.feature.allow_user_supply_unsafe_domain && !allowDomain.has(domain)) {
        throw new ConfigNotFoundError(`This RSS is disabled unless 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN' is set to 'true'.`);
    }

    return `https://${domain}`;
};

const apiMapCategory = (category) => {
    switch (category) {
        case 'another':
            return '其他漫畫';
        case 'doujin':
            return '同人';
        case 'hanman':
            return '韓漫';
        case 'meiman':
            return '美漫';
        case 'short':
            return '短篇';
        case 'single':
            return '單本';
        default:
            return null;
    }
};

// decrypt base64 encoded AES-256-ECB data, the key is the md5 hex string of the seed
const decrypt = (data: string, seed: string) => {
    // decode base64
    const encryptedWordArray = CryptoJS.enc.Base64.parse(data);

    // to md5 hex string , this string must be 32 bytes , because it is used as key for AES-256
    const md5HexStr = CryptoJS.MD5(seed).toString(); // hex 字串

    // convert string to WordArray that can be used as key for AES
    const key = CryptoJS.enc.Utf8.parse(md5HexStr); // 32 bytes => AES-256

    // create a CipherParams object from the encrypted WordArray
    const cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: encryptedWordArray,
    });

    // decrypt the CipherParams object using AES in ECB mode with PKCS7 padding
    const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
    });

    // convert the decrypted WordArray to a UTF-8 string
    return decrypted.toString(CryptoJS.enc.Utf8);
};

const getApiDomains = () =>
    cache.tryGet(
        '18comic:api-domains',
        async () => {
            let domains: string[] = [];
            try {
                const response = await got(apiDomainServer);
                const { Server } = JSON.parse(decrypt(String(response.body).trim(), 'diosfjckwpqpdfjkvnqQjsik'));
                domains = Server.filter((domain) => typeof domain === 'string' && /^[\w.-]+$/.test(domain));
            } catch {
                // use the fallback domains
            }
            return [...new Set([...domains, ...fallbackApiDomains])];
        },
        config.cache.contentExpire,
        false
    );

const fetchApi = async (apiUrl: string) => {
    // get timestamp using javascript native api
    const ts = Date.now();
    const tokenParam = `${ts},1.7.5`;
    // md5 from {token ts + "18comicAPP"
    let token = `${ts}18comicAPP`;
    token = md5(token);

    const response = await got(apiUrl, {
        headers: {
            token,
            tokenparam: tokenParam,
        },
    });

    const data = response.data?.data;
    if (typeof data !== 'string' || !data) {
        throw new Error(`Invalid API response from ${apiUrl}`);
    }

    // the result is a JSON string
    const resultJson = decrypt(data, ts + '185Hcomic3PAPP7R');

    const result = JSON.parse(resultJson);
    return result;
};

// using api to fetch data, try each API domain until one works
const processApiItems = async (apiPath: string) => {
    apiPath = apiPath.replace(/\?$/, '');
    const domains = await getApiDomains();

    const tryDomain = async (index: number) => {
        try {
            return await fetchApi(`https://${domains[index]}${apiPath}`);
        } catch (error) {
            if (index + 1 < domains.length) {
                return tryDomain(index + 1);
            }
            throw new Error(`Failed to fetch 18comic API ${apiPath} from all domains: ${error instanceof Error ? error.message : error}`, { cause: error });
        }
    };
    return tryDomain(0);
};

const ProcessItems = async (ctx, currentUrl, rootUrl) => {
    currentUrl = currentUrl.replace(/\?$/, '');

    const response = await got(currentUrl);

    const $ = load(response.data);

    let items = $('.video-title')
        .slice(0, getRouteLimit(ctx, 20))
        .toArray()
        .map((item): DataItem & { guid: string } => {
            const $item = $(item);

            return {
                title: $item.text().trim(),
                link: `${rootUrl}${$item.prev().find('a').attr('href')}`,
                guid: `18comic:${$item.prev().find('a').attr('href')}`,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.guid, async () => {
                const detailResponse = await got(item.link);

                const content = load(detailResponse.data);

                item.pubDate = parseDate(content('div[itemprop="datePublished"]').first().attr('content')!);
                item.updated = parseDate(content('div[itemprop="datePublished"]').last().attr('content')!);
                item.category = content('span[data-type="tags"]')
                    .first()
                    .find('a')
                    .toArray()
                    .map((c) => $(c).text());
                item.author = content('span[data-type="author"]')
                    .first()
                    .find('a')
                    .toArray()
                    .map((a) => $(a).text())
                    .join(', ');
                item.description = renderDescription({
                    introduction: content('#intro-block .p-t-5').text(),
                    images: content('.img_zoom_img img')
                        .toArray()
                        .map((image) => content(image).attr('data-original')!),
                    cover: content('.thumb-overlay img').first().attr('src'),
                    category: item.category,
                });

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
        description: $('meta[property="og:description"]').attr('content'),
        allowEmpty: true,
    };
};

export { apiMapCategory, defaultDomain, getRootUrl, processApiItems, ProcessItems };
