import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import path from 'node:path';
import { art } from '@/utils/render';

const rootUrl = 'https://academic.oup.com';

export const route: Route = {
    path: '/journals/:name',
    categories: ['journal'],
    example: '/oup/journals/adaptation',
    parameters: { name: 'short name for a journal, can be found in URL' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['academic.oup.com/', 'academic.oup.com/:name/issue'],
        },
    ],
    name: 'Oxford Academic - Journal',
    maintainers: ['Fatpandac'],
    handler,
    url: 'academic.oup.com/',
};

async function handler(ctx) {
    const name = ctx.req.param('name');
    const url = `${rootUrl}/${name}/issue`;

    const response = await ofetch.raw(url);
    const cookies = response.headers
        .getSetCookie()
        .map((item) => item.split(';')[0])
        .join(';');
    const $ = load(response._data);
    const list = $('div.al-article-items')
        .toArray()
        .map((item) => ({
            title: $(item).find('a.at-articleLink').text(),
            link: new URL($(item).find('a.at-articleLink').attr('href'), rootUrl).href,
        }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await ofetch(item.link, {
                    headers: {
                        Cookie: cookies,
                    },
                });
                const $ = load(detailResponse);

                item.author = $('.al-authors-list button').text();
                item.description = art(path.join(__dirname, 'templates/article.art'), {
                    abstractContent: $('section.abstract > p.chapter-para').text(),
                });
                item.pubDate = parseDate($('div.citation-date').text());
                item.category = $('div.kwd-group > a')
                    .toArray()
                    .map((item) => $(item).text());

                return item;
            })
        )
    );

    return {
        title: `OUP - ${name}`,
        link: url,
        item: items,
        language: $('html').attr('lang'),
    };
}
