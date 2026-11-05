import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { parseCachedItem } from './utils';

export const route: Route = {
    path: '/topics/:topic',
    categories: ['traditional-media'],
    example: '/scmp/topics/coronavirus-pandemic-all-stories',
    parameters: { topic: 'Topic, can be found in URL' },
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
            source: ['scmp.com/topics/:topic'],
        },
    ],
    name: 'Topics',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const topic = ctx.req.param('topic');
    const requestedLimit = Number(ctx.req.query('limit'));
    const limit = Number.isFinite(requestedLimit) && requestedLimit >= 1 ? Math.floor(requestedLimit) : 30;
    const pageUrl = `https://www.scmp.com/topics/${topic}`;
    const { data: pageResponse } = await got(pageUrl);
    const $ = load(pageResponse);

    const nextData = JSON.parse($('script#__NEXT_DATA__').text());
    const topicData = nextData.props.pageProps.payload.data.topic;
    const list: Array<DataItem & { link: string }> = topicData.contents.edges.slice(0, limit).map(({ node }) => ({
        title: node.headline,
        summary: node.summary.text,
        link: `https://www.scmp.com${node.urlAlias}`,
        author:
            node.authors
                .map((a) => a.name)
                .filter(Boolean)
                .join(', ') || undefined,
        pubDate: parseDate(node.publishedDate, 'x'),
        updated: parseDate(node.updatedDate, 'x'),
    }));

    const items = await pMap(list, (item) => parseCachedItem(item), { concurrency: 3 });

    ctx.set('json', {
        nextData,
    });

    return {
        title: topicData.name,
        link: pageUrl,
        description: topicData.description.text,
        item: items,
        language: 'en' as const,
        icon: 'https://assets.i-scmp.com/static/img/icons/scmp-icon-256x256.png',
        logo: 'https://customerservice.scmp.com/img/logo_scmp@2x.png',
        image: 'https://assets-v2.i-scmp.com/production/_next/static/media/default-image.d1be8967.png',
    };
}
