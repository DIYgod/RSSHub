import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import path from 'node:path';
import { art } from '@/utils/render';

import { CookieJar } from 'tough-cookie';
const cookieJar = new CookieJar();

export const route: Route = {
    path: '/journal/:journal',
    categories: ['journal'],
    example: '/springer/journal/10450',
    parameters: { journal: 'Journal Code, the number in the URL from the journal homepage' },
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
            source: ['www.springer.com/journal/:journal/*'],
        },
    ],
    name: 'Journal',
    maintainers: ['Derekmini', 'TonyRL', 'xiahaoyun'],
    handler,
};

async function handler(ctx) {
    const host = 'https://link.springer.com';
    const journal = ctx.req.param('journal');
    const jrnlUrl = `${host}/journal/${journal}/volumes-and-issues`;

    const response = await got(jrnlUrl, {
        cookieJar,
    });
    const $ = load(response.data);
    const jrnlName = $('span.app-journal-masthead__title').text().trim();
    const issueUrl = `${host}${$('li.c-list-group__item:first-of-type').find('a').attr('href')}`;

    const response2 = await got(issueUrl, {
        cookieJar,
    });
    const $2 = load(response2.data);
    const issue = $2('h2.app-journal-latest-issue__heading').text();
    const list = $2('ol.u-list-reset > li')
        .toArray()
        .map((item) => {
            const title = $(item).find('h3.app-card-open__heading').find('a').text().trim();
            const link = $(item).find('h3.app-card-open__heading').find('a').attr('href');
            const doi = link.replace('https://link.springer.com/article/', '');
            const img = $(item).find('img').attr('src');
            const authors = $(item)
                .find('li')
                .toArray()
                .map((item) => $(item).text().trim())
                .join('; ');
            return {
                title,
                link,
                doi,
                issue,
                img,
                authors,
            };
        });

    const renderDesc = (item) =>
        art(path.join(__dirname, 'templates/description.art'), {
            item,
        });
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response3 = await got(item.link, {
                    cookieJar,
                });
                const $3 = load(response3.data);
                item.abstract = $3('div#Abs1-content > p:first-of-type').text();
                item.description = renderDesc(item);
                return item;
            })
        )
    );
    return {
        title: jrnlName,
        link: jrnlUrl,
        item: items,
    };
}
