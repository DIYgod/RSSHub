import { load } from 'cheerio';

import { config } from '@/config';
import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { getAcwScV2ByArg1 } from '../5eplay/utils';

const host = 'https://segmentfault.com';

const acw_sc__v2 = (link) =>
    cache.tryGet(
        'segmentfault:acw_sc__v2',
        async () => {
            const response = await ofetch(link);

            let acw_sc__v2 = '';
            const matches = response.match(/var arg1='(.*?)';/);
            if (matches) {
                acw_sc__v2 = getAcwScV2ByArg1(matches[1]);
            }
            return acw_sc__v2;
        },
        config.cache.routeExpire,
        false
    );

interface SourceArticle {
    title: string;
    url: string;
    user: { name: string };
    created?: number;
    modified?: number;
    excerpt?: string;
}

interface ArticleItem extends DataItem {
    link: string;
}

const parseList = (data: SourceArticle[]): ArticleItem[] =>
    data.map((item) => {
        const timestamp = item.created || item.modified;
        return {
            title: item.title,
            link: new URL(item.url, host).href,
            author: item.user.name,
            pubDate: timestamp ? parseDate(timestamp, 'X') : undefined,
            description: item.excerpt,
        };
    });

const parseItems = async (cookie: string, item: ArticleItem) => {
    const details = await cache.tryGet(`${item.link}:details`, async () => {
        const response = await ofetch(item.link, {
            headers: {
                cookie: `acw_sc__v2=${cookie};`,
            },
        });
        const content = load(response);
        const description = content('article').html();
        if (!description) {
            throw new Error(`No article body was found at ${item.link}.`);
        }
        return {
            description,
            category: content('.badge-tag')
                .toArray()
                .map((item) => content(item).text()),
        };
    });
    return { ...item, ...details };
};

export { acw_sc__v2, host, parseItems, parseList };
