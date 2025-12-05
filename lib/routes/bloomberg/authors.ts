import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import rssParser from '@/utils/rss-parser';

import { parseArticle } from './utils';

const parseAuthorNewsList = async (slug) => {
    const baseURL = `https://www.bloomberg.com/authors/${slug}`;
    const apiUrl = `https://www.bloomberg.com/lineup/api/lazy_load_author_stories?slug=${slug}&authorType=default&page=1`;
    const resp = await ofetch(apiUrl);
    // Likely rate limited
    if (!resp.html) {
        return [];
    }
    const $ = load(resp.html);
    const articles = $('article.story-list-story');
    return articles.toArray().map((item) => {
        item = $(item);
        const headline = item.find('a.story-list-story__info__headline-link');
        return {
            title: headline.text(),
            pubDate: item.attr('data-updated-at'),
            guid: `bloomberg:${item.attr('data-id')}`,
            link: new URL(headline.attr('href'), baseURL).href,
        };
    });
};

export const route: Route = {
    path: '/authors/:id/:slug/:source?',
    categories: ['finance'],
    view: ViewType.Articles,
    example: '/bloomberg/authors/ARbTQlRLRjE/matthew-s-levine',
    parameters: { id: 'Author ID, can be found in URL', slug: 'Author Slug, can be found in URL', source: 'Data source, either `api` or `rss`,`api` by default' },
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
            source: ['www.bloomberg.com/*/authors/:id/:slug', 'www.bloomberg.com/authors/:id/:slug'],
            target: '/authors/:id/:slug',
        },
    ],
    name: 'Authors',
    maintainers: ['josh', 'pseudoyu'],
    handler,
};

async function handler(ctx) {
    const { id, slug, source } = ctx.req.param();
    const link = `https://www.bloomberg.com/authors/${id}/${slug}`;

    let list = [];
    if (!source || source === 'api') {
        list = await parseAuthorNewsList(`${id}/${slug}`);
    }
    // Fallback to rss if api failed or requested by param
    if (source === 'rss' || list.length === 0) {
        list = (await rssParser.parseURL(`${link}.rss`)).items;
    }

    const item = await pMap(list, (item) => parseArticle(item), { concurrency: 1 });
    const authorName = item.find((i) => i.author)?.author ?? slug;

    return {
        title: `Bloomberg - ${authorName}`,
        link,
        language: 'en-us',
        item,
    };
}
