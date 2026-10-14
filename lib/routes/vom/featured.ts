import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Language, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'http://www.vom.mn';
const languages: Record<string, Language> = {
    en: 'en',
    ja: 'ja',
    // The shared Language union does not include the site's ISO 639 code for Mongolian.
    mn: 'mn' as Language,
    ru: 'ru',
    zh: 'zh',
};

export const route: Route = {
    path: '/featured/:lang?',
    categories: ['traditional-media'],
    example: '/vom/featured',
    parameters: { lang: 'Language, see the table below, `mn` by default' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['vom.mn/:lang', 'vom.mn/'],
            target: '/featured/:lang?',
        },
    ],
    name: 'News',
    maintainers: ['TonyRL'],
    handler,
    description: `| English | 日本語 | Монгол | Русский | 简体中文 |
| ------- | ------ | ------ | ------- | -------- |
| en      | ja     | mn     | ru      | zh       |`,
};

async function handler(ctx) {
    const { lang = 'mn' } = ctx.req.param();
    const { data: response } = await got(`${baseUrl}/${lang}`);

    const $ = load(response);

    const links = [
        ...new Set(
            $('#bigNewsSlide .item, #news_3 .item')
                .toArray()
                .map((item) => $(item).find('a').eq(0).attr('href'))
                .filter((link): link is string => Boolean(link))
        ),
    ];
    const items = await pMap(links, getArticle, { concurrency: 3, stopOnError: false });

    return {
        title: $('meta[name=description]').attr('content')!,
        link: `${baseUrl}/${lang}`,
        language: languages[lang],
        image: 'http://www.vom.mn/dist/images/vom-logo.png',
        item: items,
    };
}

type ArticleDetails = Pick<DataItem, 'title' | 'author' | 'pubDate' | 'category' | 'description'>;

async function fetchArticle(link: string): Promise<ArticleDetails> {
    const { data: response } = await got(link);
    const $ = load(response);
    const title = $('h2').text();
    const author = $('.uk-border-circle').next().text();
    const pubDate = parseDate($('.vom-news-show-meta .right').prev().text());
    const category = $('.vom-news-show-meta .uk-button-text').text();
    $('.uk-article-title, .uk-text-meta, article .uk-grid-small').remove();
    return { title, author, pubDate, category, description: $('article').html() ?? undefined };
}

async function getArticle(link: string): Promise<DataItem> {
    const { title, author, pubDate, category, description } = await cache.tryGet(link, () => fetchArticle(link));
    return { link, title, author, pubDate, category, description };
}
