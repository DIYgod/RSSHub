import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import path from 'node:path';
import { art } from '@/utils/render';

import { CookieJar } from 'tough-cookie';
const cookieJar = new CookieJar();

export const route: Route = {
    path: '/journal/:journal/:sortType?',
    categories: ['journal'],
    example: '/ieee/journal/8782710',
    parameters: { journal: 'Issue code, the number of the `isnumber` in the link', sortType: 'Sort Type, default: `vol-only-seq`, the part of the link after `sortType`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: true,
    },
    name: 'Current Issue',
    maintainers: ['Derekmini'],
    handler,
};

const renderDesc = (item) =>
    art(path.join(__dirname, 'templates/description.art'), {
        item,
    });

async function handler(ctx) {
    const punumber = ctx.req.param('journal');
    const sortType = ctx.req.param('sortType') ?? 'vol-only-seq';
    const host = 'https://ieeexplore.ieee.org';
    const link = `${host}/xpl/mostRecentIssue.jsp?punumber=${punumber}`;

    const response = await ofetch(`${host}/rest/publication/home/metadata?pubid=${punumber}`, {
        parseResponse: JSON.parse,
        headers: {
            cookie: cookieJar.getCookieStringSync(host),
        },
    });
    const volume = response.currentIssue.volume;
    const isnumber = response.currentIssue.issueNumber;
    const title = response.displayTitle;

    const response2 = await ofetch(`${host}/rest/search/pub/${punumber}/issue/${isnumber}/toc`, {
        method: 'POST',
        parseResponse: JSON.parse,
        headers: {
            cookie: cookieJar.getCookieStringSync(host),
        },
        body: {
            punumber,
            isnumber,
            sortType,
            rowsPerPage: '100',
        },
    });
    let list = response2.records.map((item) => {
        const $2 = load(item.articleTitle);
        const title = $2.text();
        const link = item.htmlLink;
        const doi = item.doi;
        let authors = 'Do not have author';
        if (Object.hasOwn(item, 'authors')) {
            authors = item.authors.map((itemAuth) => itemAuth.preferredName).join('; ');
        }
        const abstract = Object.hasOwn(item, 'abstract') ? item.abstract : '';
        return {
            title,
            link,
            authors,
            doi,
            volume,
            abstract,
        };
    });

    list = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                if (item.abstract !== '') {
                    const response3 = await ofetch(`${host}${item.link}`, {
                        parseResponse: (txt) => txt,
                    });
                    const $3 = load(response3);
                    const metadataMatch = $3.html().match(/metadata=(.*);/);
                    const metadata = metadataMatch ? JSON.parse(metadataMatch[1]) : null;
                    const $4 = load(metadata?.abstract || '');
                    item.abstract = $4.text();
                    item.description = renderDesc(item);
                }
                return item;
            })
        )
    );

    return {
        title,
        link,
        item: list,
    };
}
