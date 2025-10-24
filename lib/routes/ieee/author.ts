import { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import path from 'node:path';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';

export const route: Route = {
    name: 'IEEE Author Articles',
    maintainers: ['Derekmini'],
    categories: ['journal'],
    path: '/author/:aid/:sortType',
    parameters: {
        aid: 'Author ID',
        sortType: 'Sort Type of papers',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
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
    const count = ctx.req.query('limit') || 10;
    const host = 'https://ieeexplore.ieee.org';

    const res = await ofetch(`${host}/rest/author/${aid}`);
    const author = res[0];
    const title = `${author.preferredName} on IEEE Xplore`;
    const link = `${host}/author/${aid}`;
    const description = author.bioParagraphs.join(' ');
    const image = `${host}${author.photoUrl}`;

    const response = await ofetch(`${host}/rest/search`, {
        method: 'POST',
        body: {
            rowsPerPage: count,
            searchWithin: [`"Author Ids": ${aid}`],
            sortType,
        },
    });

    const list = response.records.map((item) => ({
        title: item.articleTitle,
        link: item.htmlLink,
        doi: item.doi,
        authors: 'authors' in item ? item.authors.map((itemAuth) => itemAuth.preferredName).join('; ') : 'Do not have author',
        abstract: 'abstract' in item ? item.abstract : '',
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                if (item.abstract !== '') {
                    const res = await ofetch(`${host}${item.link}`, {
                        parseResponse: (txt) => txt,
                    });
                    const $ = load(res);
                    const metadataMatch = $.html().match(/metadata=(.*);/);
                    const metadata = metadataMatch ? JSON.parse(metadataMatch[1]) : null;
                    item.pubDate = metadata?.insertDate ? parseDate(metadata.insertDate) : undefined;
                    item.abstract = load(metadata?.abstract || '').text();
                }
                return {
                    ...item,
                    description: renderDescription(item),
                };
            })
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

function renderDescription(item: { title: string; authors: string; abstract: string; doi: string }) {
    return art(path.join(__dirname, 'templates/description.art'), {
        item,
    });
}
