import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import path from 'node:path';
import { art } from '@/utils/render';

export const route: Route = {
    path: '/author/:aid/:sortType?/:count?',
    categories: ['journal'],
    example: '/ieee/author/37281702200',
    parameters: { aid: 'Author ID', sortType: 'Sort Type of papers', count: 'Number of papers to show' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: true,
    },
    name: 'Author',
    maintainers: ['Derekmini'],
    handler,
};

const renderDesc = (item) =>
    art(path.join(__dirname, 'templates/description.art'), {
        item,
    });

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
    let list = response.records.map((item) => {
        const $ = load(item.articleTitle);
        const title = $.text();
        const link = item.htmlLink;
        const doi = item.doi;
        let authors = 'Do not have author';
        if (Object.hasOwn(item, 'authors')) {
            authors = item.authors.map((itemAuth) => itemAuth.preferredName).join('; ');
        }
        const abstract = Object.hasOwn(item, 'abstract') ? item.abstract : '';
        // const pubDate = item.publicationDate;
        // const category = item.articleContentType;
        // const description = item.abstract;
        return {
            title,
            link,
            authors,
            doi,
            abstract,
            // pubDate,
            // category,
            // description,
        };
    });

    list = await Promise.all(
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
                    item.description = renderDesc(item);
                }
                return item;
            })
        )
    );

    return {
        title,
        link,
        description,
        item: list,
    };
}
