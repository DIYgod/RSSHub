import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

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
    maintainers: ['Derekmini', 'TonyRL'],
    handler,
};

async function handler(ctx) {
    const host = 'https://www.springer.com';
    const journal = ctx.req.param('journal');
    const jrnlUrl = `${host}/journal/${journal}`;

    const response = await got(jrnlUrl, {
        cookieJar,
    });
    const $ = load(response.data);
    const jrnlName = $('h1#journalTitle').text().trim();
    const issueUrl = $('p.c-card__title.u-mb-16.u-flex-grow').find('a').attr('href');

    const response2 = await got(issueUrl, {
        cookieJar,
    });
    const $2 = load(response2.data);
    const issue = $2('.app-volumes-and-issues__info').find('h1').text();
    const list = $2('article.c-card')
        .map((_, item) => {
            const title = $(item).find('.c-card__title').text().trim();
            const link = $(item).find('a').attr('href');
            const doi = link.replace('https://link.springer.com/article/', '');
            const img = $(item).find('img').attr('src');
            const authors = $(item)
                .find('.c-author-list')
                .find('li')
                .map((_, item) => $(item).text().trim())
                .get()
                .join('; ');
            return {
                title,
                link,
                doi,
                issue,
                img,
                authors,
            };
        })
        .get();

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
                $3('.c-article__sub-heading').remove();
                item.abstract = $3('div#Abs1-content').text();
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
