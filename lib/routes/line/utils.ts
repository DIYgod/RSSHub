import { load } from 'cheerio';
import { FetchError } from 'ofetch';
import pMap from 'p-map';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import logger from '@/utils/logger';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://today.line.me';

const parseList = (items) =>
    items.map((item) => ({
        title: item.title,
        link: item.url.url,
        pubDate: parseDate(item.publishTimeUnix),
        hash: item.url.hash,
        category: item.categoryName,
    }));

const parseItems = (list: Array<DataItem & { link: string; hash: string }>) =>
    pMap(
        list,
        async (item) => {
            const detail = await cache.tryGet(`line:article:${item.link}`, async () => {
                const edition = item.link.match(/today\.line\.me\/(\w+)\/v[23]\/.*$/)?.[1];
                if (!edition) {
                    throw new Error(`Cannot identify the LINE TODAY edition for ${item.link}`);
                }
                let data;
                try {
                    const response = await got(`${baseUrl}/webapi/portal/page/setting/article`, {
                        searchParams: { country: edition, hash: item.hash, group: 'NA' },
                    });
                    data = response.data;
                } catch (error) {
                    if (error instanceof FetchError && error.statusCode === 404) {
                        logger.error(`Error parsing article ${item.link}: ${error.message}`);
                        return {};
                    }
                    throw error;
                }

                const $ = load(data.data.content, null, false);
                $('img').each((_, img) => {
                    delete img.attribs['data-hashid'];
                    img.attribs.src = img.attribs.src.replace(/\/w\d+$/, '');
                });

                return {
                    description: $.html(),
                    author: data.data.author,
                    categories: data.data.exploreLinks.map((link) => link.name),
                };
            });
            return {
                ...item,
                description: detail.description,
                author: detail.author,
                category: detail.categories ? [...new Set([item.category, ...detail.categories])] : item.category,
            };
        },
        { concurrency: 3 }
    );

export { baseUrl, parseItems, parseList };
