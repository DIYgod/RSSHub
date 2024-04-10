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
    path: '/journal/:journal/earlyaccess/:sortType?',
    categories: ['journal'],
    example: '/ieee/journal/5306045/earlyaccess',
    parameters: { journal: 'Issue code, the number of the `isnumber` in the link', sortType: 'Sort Type, default: `vol-only-seq`, the part of the link after `sortType`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Early Access Journal',
    maintainers: ['5upernova-heng', 'Derekmini'],
    handler,
};

const renderDesc = (item) =>
    art(path.join(__dirname, 'templates/description.art'), {
        item,
    });

async function handler(ctx) {
    const isnumber = ctx.req.param('journal');
    const sortType = ctx.req.param('sortType') ?? 'vol-only-seq';
    const host = 'https://ieeexplore.ieee.org';
    const link = `${host}/xpl/tocresult.jsp?isnumber=${isnumber}`;

    const { title, punumber, volume } = await ofetch(`${host}/rest/publication/home/metadata?issueid=${isnumber}`, {
        parseResponse: JSON.parse,
        headers: {
            cookie: cookieJar.getCookieStringSync(host),
        },
    }).then((res) => {
        const title = res.displayTitle;
        const punumber = res.publicationNumber;
        const volume = res.currentIssue.volume;
        return {
            title,
            punumber,
            volume,
        };
    });

    const response = await ofetch(`${host}/rest/search/pub/${punumber}/issue/${isnumber}/toc`, {
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
        list.map((item: any) =>
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
        item: list,
    };
}
