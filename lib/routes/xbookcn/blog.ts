import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';

function getListItems($: CheerioAPI, url: string): DataItem[] {
    return $('article.list__item')
        .toArray()
        .map((element) => {
            const article = $(element);
            const anchor = article.find('h2.list__title.post__title > a');
            const body = article.find('.content.list__content');
            const authorElement = body
                .children('p')
                .slice(0, 2)
                .filter((_, element) => /^作者[：:]\s*\S/.test($(element).text()));
            const author = authorElement
                .text()
                .match(/^作者[：:]\s*(\S.*)$/s)?.[1]
                .trim();
            authorElement.remove();

            return {
                title: anchor.text(),
                link: new URL(anchor.attr('href')!, url).href,
                description: body.html(),
                author,
                category: article
                    .find('.meta__item-tags a')
                    .toArray()
                    .map((element) => $(element).text()),
            };
        });
}

export const route: Route = {
    path: '/:label?',
    categories: ['reading'],
    example: '/xbookcn/精选作品',
    parameters: { label: '按名称分类，详见https://blog.xbookcn.net/p/all.html' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    name: '短篇',
    maintainers: ['Lyunvy'],
    handler,
};

async function handler(ctx) {
    const { label = '精选作品' } = ctx.req.param();
    const url = `https://blog.xbookcn.net/search/label/${label}`;
    const response = await ofetch(url);
    const $ = load(response);

    return {
        title: 'xbookcn',
        link: url,
        item: getListItems($, url),
    };
}
