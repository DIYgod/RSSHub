import { load } from 'cheerio';
import { CookieJar } from 'tough-cookie';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

import { renderDescription } from './templates/description';

const cookieJar = new CookieJar();

export const route: Route = {
    path: '/:journal',
    categories: ['journal'],
    example: '/elsevier/signal-processing',
    parameters: {
        journal: 'Journal Name, the part of the URL after `/journal/`',
    },
    radar: [
        {
            source: ['www.sciencedirect.com/journal/:journal/*'],
            target: '/:journal',
        },
    ],
    name: 'Journal',
    maintainers: ['Derekmini', 'sunwolf-swb'],
    handler,
};

async function handler(ctx) {
    const journal = ctx.req.param('journal');
    const host = 'https://www.sciencedirect.com';
    const jrnlUrl = `${host}/journal/${journal}`;

    const response = await got(jrnlUrl, {
        cookieJar,
    });
    const $ = load(response.data);
    const jrnlName = $('.anchor.js-title-link').text();
    const issueUrl = `${host}${$('.link-anchor.u-clr-black').attr('href')}`;

    const response2 = await got(issueUrl, {
        cookieJar,
    });
    const $2 = load(response2.data);
    const list = $2('.js-article')
        .toArray()
        .map((item): DataItem => {
            const title = $2(item).find('.js-article-title').text();
            const authors = $2(item).find('.js-article__item__authors').text();
            const link = $2(item).find('.article-content-title').attr('href');
            const id = $2(item).find('.article-content-title').attr('id');
            return {
                title,
                link,
                id,
                author: authors,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const response3 = await got(`${host}/science/article/pii/${item.id}`, {
                    cookieJar,
                });
                const $3 = load(response3.data);
                $3('.section-title').remove();
                item.doi = $3('.doi').attr('href')!.replace('https://doi.org/', '');
                item.description = renderDescription({ abstract: $3('.abstract.author').text() });
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
