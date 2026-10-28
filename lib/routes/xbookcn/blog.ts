import { type Cheerio, type CheerioAPI, load } from 'cheerio';
import { type AnyNode, cloneNode, Document } from 'domhandler';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

function getListItems($: CheerioAPI, url: string): DataItem[] {
    return $('article.list__item')
        .toArray()
        .flatMap((element) => {
            const article = $(element);
            const anchor = article.find('h2.list__title.post__title > a').first();
            const href = anchor.attr('href');
            if (!href) {
                return [];
            }

            const body = copyContent(article.find('.content.list__content'));
            const authorElement = body
                .children('p')
                .slice(0, 2)
                .filter((_, element) => /^作者[：:]\s*\S/.test($(element).text()))
                .first();
            const author = authorElement
                .text()
                .match(/^作者[：:]\s*(\S.*)$/s)?.[1]
                .trim();
            if (author) {
                authorElement.remove();
            }

            return {
                title: anchor.text(),
                link: new URL(href, url).href,
                description: body.html() ?? undefined,
                author,
                category: article
                    .find('.meta__item-tags a')
                    .toArray()
                    .map((element) => $(element).text()),
            };
        });
}

function copyContent<T extends AnyNode>(selection: Cheerio<T>): Cheerio<T> {
    const copy = selection.map((_, element) => cloneNode(element, true));
    const root = new Document(copy.toArray());
    copy.each((_, element) => {
        element.parent = root;
    });
    return copy;
}

async function fetchDetail(link: string): Promise<Pick<DataItem, 'description' | 'category'>> {
    const response = await ofetch(link);
    const $ = load(response);
    return {
        description: $('.post-body.entry-content').html() ?? undefined,
        category: $('.post-labels a')
            .toArray()
            .map((element) => $(element).text()),
    };
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

    if ($('article.list__item').length) {
        return {
            title: 'xbookcn',
            link: url,
            item: getListItems($, url),
        };
    }

    const articles = $('.blog-posts.hfeed .date-outer').find('.post');
    const list = articles
        .toArray()
        .filter((element) => $(element).find('.post-title a').attr('href'))
        .map((element): DataItem & { link: string } => {
            const a = $(element).find('.post-title a');
            return {
                title: a.text(),
                link: new URL(a.attr('href')!, url).href,
                category: [],
            };
        });

    const items = await pMap(
        list,
        async (item) => {
            const detail = await cache.tryGet(`xbookcn:detail:v2:${item.link}`, () => fetchDetail(item.link));
            return { ...item, description: detail.description, category: detail.category };
        },
        { concurrency: 3, stopOnError: false }
    );

    return {
        title: 'xbookcn',
        link: url,
        item: items,
    };
}
