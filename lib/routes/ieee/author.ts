import { load } from 'cheerio';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

import { renderDescription } from './templates/description';
import { fetchArticleMetadata, withArticleMetadataBrowser } from './utils';

export const route: Route = {
    name: 'Author Articles',
    maintainers: ['Derekmini'],
    categories: ['journal'],
    path: '/author/:aid/:sortType',
    parameters: {
        aid: 'Author ID',
        sortType: 'Sort Type of papers',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: true,
    },
    example: '/ieee/author/37264968900/newest',
    handler,
};

async function handler(ctx) {
    const { aid, sortType } = ctx.req.param();
    if (!/^[1-9]\d*$/.test(aid)) {
        throw new InvalidParameterError('Invalid author ID. Use a positive integer.');
    }
    const count = getRouteLimit(ctx, 10);
    const host = 'https://ieeexplore.ieee.org';

    const res = await ofetch(`${host}/rest/author/${aid}`);
    const author = res[0];
    const title = `${author.preferredName} on IEEE Xplore`;
    const link = `${host}/author/${aid}`;
    const description = author.bioParagraphs.join(' ');
    const image = author.photoUrl ? new URL(author.photoUrl, host).href : undefined;

    const response = await ofetch(`${host}/rest/search`, {
        method: 'POST',
        body: {
            rowsPerPage: count,
            searchWithin: [`"Author Ids": ${aid}`],
            sortType,
        },
    });

    const list: Array<{ title: string; link: string; doi?: string; author?: string; abstract: string; pubDate?: Date }> = response.records.map((item) => ({
        title: item.articleTitle,
        link: item.htmlLink,
        doi: item.doi,
        author: item.authors?.map((itemAuth) => itemAuth.preferredName).join('; '),
        abstract: load(item.abstract ?? '').text(),
    }));

    const items = await withArticleMetadataBrowser((getBrowser) =>
        pMap(
            list,
            async (item) => {
                const metadata = item.abstract ? await fetchArticleMetadata(item.link, getBrowser) : undefined;
                const article = {
                    ...item,
                    abstract: metadata?.abstract || item.abstract,
                    pubDate: metadata?.insertDate ? parseDate(metadata.insertDate) : undefined,
                };
                return { ...article, description: renderDescription(article) };
            },
            { concurrency: 3 }
        )
    );

    return {
        title,
        link,
        description,
        item: items,
        image,
    };
}
