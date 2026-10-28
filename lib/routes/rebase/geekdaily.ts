import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';

const rootUrl = 'https://rebase.network';
const currentUrl = `${rootUrl}/geekdaily`;

export const route: Route = {
    path: '/geekdaily',
    categories: ['new-media'],
    example: '/rebase/geekdaily',
    radar: [
        {
            source: ['rebase.network/geekdaily'],
            target: '/geekdaily',
        },
    ],
    name: 'Web3 Geek Daily',
    maintainers: ['gaoyifan'],
    handler: async () => {
        const response = await ofetch(currentUrl, { responseType: 'text' });
        const $ = load(response);
        const feed = await parser.parseString(await ofetch(`${currentUrl}/rss.xml`, { responseType: 'text' }));
        const cards = $('article.episode-card').toArray();
        const items = await pMap(
            cards,
            (card) => {
                const href = $(card).find('h2 a').attr('href');
                if (!href) {
                    throw new Error('Rebase episode is missing its article link');
                }
                const link = new URL(href, rootUrl).href;
                return cache.tryGet(`rebase:geekdaily:v2:${link}`, async (): Promise<DataItem> => {
                    const pageSource1 = await ofetch(link, { responseType: 'text' });
                    const detail = load(pageSource1);
                    const article = detail('article#episode-body');
                    if (!article.length || !article.find('#episode-items').length) {
                        throw new Error('Rebase episode content is missing');
                    }
                    const title = article.find('h1').first().text();
                    const date = article.find('.detail-body-lead p').first().text();
                    const author = article
                        .find('.detail-body-lead p')
                        .filter((_, element) => detail(element).text().startsWith('本期编辑：'))
                        .text()
                        .replace(/^本期编辑：/, '');
                    const published = feed.items.find((item) => item.link === link)?.isoDate;
                    article.children('header').remove();
                    return {
                        title,
                        link,
                        description: article.html(),
                        pubDate: published ? parseDate(published) : date ? parseDate(`${date} +0000`, 'YYYY年M月D日 ZZ') : undefined,
                        author: author || undefined,
                    };
                });
            },
            { concurrency: 6 }
        );

        return {
            title: 'Web3 Geek Daily',
            link: currentUrl,
            item: items,
        };
    },
};
