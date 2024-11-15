import { Route, ViewType } from '@/types';
import { load } from 'cheerio';
import got from '@/utils/got';
import rssParser from '@/utils/rss-parser';
import { asyncPoolAll, parseArticle } from './utils';

const parseAuthorNewsList = async (slug) => {
    const baseURL = `https://www.bloomberg.com/authors/${slug}`;
    const apiUrl = `https://www.bloomberg.com/lineup/api/lazy_load_author_stories?slug=${slug}&authorType=default&page=1`;
    const resp = await got(apiUrl);
    // Likely rate limited
    if (!resp.data.html) {
        return [];
    }
    const $ = load(resp.data.html);
    const articles = $('article.story-list-story');
    return articles
        .map((index, item) => {
            item = $(item);
            const headline = item.find('a.story-list-story__info__headline-link');
            return {
                title: headline.text(),
                pubDate: item.attr('data-updated-at'),
                guid: `bloomberg:${item.attr('data-id')}`,
                link: new URL(headline.attr('href'), baseURL).href,
            };
        })
        .get();
};

export const route: Route = {
    path: '/authors/:id/:slug/:source?',
    categories: ['finance', 'popular'],
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
    maintainers: ['josh'],
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

    const item = await asyncPoolAll(1, list, (item) => parseArticle(item));
    const authorName = item.find((i) => i.author)?.author ?? 'Unknown';

    return {
        title: `Bloomberg - ${authorName}`,
        link,
        language: 'en-us',
        item,
    };
}
