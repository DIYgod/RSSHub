import path from 'node:path';

import { load } from 'cheerio';
import { CookieJar } from 'tough-cookie';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { art } from '@/utils/render';

const cookieJar = new CookieJar();

export const route: Route = {
    path: ['/:journal/latest', '/:journal'],
    radar: [
        {
            source: ['www.sciencedirect.com/journal/:journal/*'],
            target: '/:journal',
        },
    ],
    name: 'Unknown',
    maintainers: [],
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
    let issue = '';
    if (issueUrl.match('suppl') !== null) {
        issue = 'Volume ' + issueUrl.match('vol/(.*)/suppl')[1];
    } else if (issueUrl.match('issue') !== null) {
        issue = 'Volume ' + issueUrl.match('vol/(.*)/issue')[1] + ' Issue ' + issueUrl.match('/issue/(.*)')[1];
    }

    const response2 = await got(issueUrl, {
        cookieJar,
    });
    const $2 = load(response2.data);
    const list = $2('.js-article')
        .toArray()
        .map((item) => {
            const title = $2(item).find('.js-article-title').text();
            const authors = $2(item).find('.js-article__item__authors').text();
            const link = $2(item).find('.article-content-title').attr('href');
            const id = $2(item).find('.article-content-title').attr('id');
            return {
                title,
                link,
                id,
                authors,
                issue,
            };
        });

    const renderDesc = (item) =>
        art(path.join(__dirname, 'templates/description.art'), {
            item,
        });
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response3 = await got(`${host}/science/article/pii/${item.id}`, {
                    cookieJar,
                });
                const $3 = load(response3.data);
                $3('.section-title').remove();
                item.doi = $3('.doi').attr('href').replace('https://doi.org/', '');
                item.abstract = $3('.abstract.author').text();
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
