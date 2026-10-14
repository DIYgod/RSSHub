import { load } from 'cheerio';
import { escape } from 'entities/escape';
import pMap from 'p-map';

import { type Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

type SourceArticle = { id: string; name: string; href: string; date: string };
type SourceBlock = { type: string; content?: string; name?: string; data?: Array<{ title: string; urlAlias: string; thumbUrl: string }> };

function renderBlock(block: SourceBlock) {
    if (block.type === 'text') {
        return block.content ?? '';
    }
    if (block.type === 'videoList') {
        const clips = (block.data ?? [])
            .map((clip) => {
                const link = escape(new URL(`/video/${clip.urlAlias}`, 'https://www.schwabnetwork.com').href);
                const title = escape(clip.title);
                return `<figure><a href="${link}"><img src="${escape(clip.thumbUrl)}" alt="${title}"></a><figcaption><a href="${link}">${title}</a></figcaption></figure>`;
            })
            .join('');
        return `<section>${block.name ? `<h2>${escape(block.name)}</h2>` : ''}${clips}</section>`;
    }
    return '';
}

export const route: Route = {
    path: '/markets',
    categories: ['finance'],
    view: ViewType.Notifications,
    example: '/schwabnetwork/markets',
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
            source: ['schwabnetwork.com/markets'],
        },
    ],
    name: '市场新闻',
    maintainers: ['hutianyu2006'],
    handler,
    url: 'schwabnetwork.com/markets',
};

async function handler() {
    const url = 'https://www.schwabnetwork.com/markets';
    const response = await got(url);
    const $ = load(response.body);

    const nextDataRaw = $('#__NEXT_DATA__').text();
    const nextData = JSON.parse(nextDataRaw || '{}');

    const groups: SourceArticle[][] = Object.values(nextData.props.pageProps.context.META_CATEGORY_ARTICLES.value);
    const articles = new Map(groups.flat().map((article) => [article.id, article])).values().toArray();
    const resolvedItems = await pMap(
        articles,
        async (article) => ({
            title: article.name,
            link: `https://www.schwabnetwork.com${article.href}`,
            guid: article.id,
            pubDate: parseDate(article.date),
            description: await cache.tryGet(`schwabnetwork:article:v3:${article.id}`, async () => {
                const articleResponse = await got(`https://www.schwabnetwork.com${article.href}`);
                const article$ = load(articleResponse.body);
                const nextData = JSON.parse(article$('#__NEXT_DATA__').text() || '{}');
                const articleContentBlocks = nextData.props.pageProps.context.articleContent.value.content.blocks ?? [];
                return articleContentBlocks.map(renderBlock).join('');
            }),
        }),
        { concurrency: 3 }
    );
    const uniqueItems = new Map(resolvedItems.map((item) => [item.guid, item])).values().toArray();

    const result = {
        title: 'Schwab Network - Markets Overview',
        description: 'Latest news and updates from Schwab Network.',
        link: url,
        item: uniqueItems,
    };
    return result;
}
