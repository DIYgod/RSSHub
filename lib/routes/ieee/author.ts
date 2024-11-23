import { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import path from 'node:path';
import { art } from '@/utils/render';
import { getCurrentPath } from '@/utils/helpers';

export const route: Route = {
    name: 'IEEE Author Articles',
    maintainers: ['Derekmini'],
    categories: ['journal'],
    path: '/author/:aid/:sortType/:count?',
    parameters: {
        aid: 'Author ID',
        sortType: 'Sort Type of papers',
        count: 'Number of papers to show',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: true,
    },
    example: '/ieee/author/37264968900/newest/20',
    handler,
};

async function handler(ctx) {
    const { aid, sortType, count = 10 } = ctx.req.param();
    const host = 'https://ieeexplore.ieee.org';

    const author = await ofetch(`${host}/rest/author/${aid}`).then((res) => res[0]);
    const title = `${author.preferredName} on IEEE Xplore`;
    const link = `${host}/author/${aid}`;
    const description = author.bioParagraphs.join('<br/>');

    const response = await ofetch(`${host}/rest/search`, {
        method: 'POST',
        body: {
            rowsPerPage: count,
            searchWithin: [`"Author Ids": ${aid}`],
            sortType,
        },
    });

    const list = response.records.map((item) => {
        const $ = load(item.articleTitle);
        return {
            title: $.text(),
            link: item.htmlLink,
            doi: item.doi,
            authors: 'authors' in item ? item.authors.map((itemAuth) => itemAuth.preferredName).join('; ') : 'Do not have author',
            abstract: 'abstract' in item ? item.abstract : '',
        };
    });

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
                    const $2 = load(metadata?.abstract || '');
                    item.abstract = $2.text();
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
    };
}

function renderDescription(item: { title: string; authors: string; abstract: string; doi: string }) {
    const __dirname = getCurrentPath(import.meta.url);
    return art(path.join(__dirname, 'templates/description.art'), {
        item,
    });
}
