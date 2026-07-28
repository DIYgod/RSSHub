import { load } from 'cheerio';
import { CookieJar } from 'tough-cookie';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

import { renderDescription } from './templates/description';

const cookieJar = new CookieJar();

export const route: Route = {
    path: '/:journal/:issue',
    categories: ['journal'],
    example: '/elsevier/signal-processing/192',
    parameters: {
        journal: 'Journal Name, the part of the URL after `/journal/`',
        issue: 'Release Number, the number in the URL after `/vol/` (If both Volume and Issue exist, must use the `Volume-Issue` form, e.g., `/elsevier/aace-clinical-case-reports/7-6`)',
    },
    radar: [
        {
            source: ['www.sciencedirect.com/journal/:journal/vol/:issue'],
            target: '/:journal/:issue',
        },
    ],
    name: 'Special Issue',
    maintainers: ['Derekmini', 'sunwolf-swb'],
    handler,
};

async function handler(ctx) {
    const journal = ctx.req.param('journal');
    const issue = 'Volume ' + ctx.req.param('issue').replace('-', ' Issue ');
    const host = 'https://www.sciencedirect.com';
    const issueUrl = `${host}/journal/${journal}/vol/${ctx.req.param('issue').replace('-', '/issue/')}`;

    const response = await got(issueUrl, {
        cookieJar,
    });
    const $ = load(response.data);
    const jrnlName = $('.anchor.js-title-link').text();
    const list = $('.js-article')
        .toArray()
        .map((item) => {
            const title = $(item).find('.js-article-title').text();
            const authors = $(item).find('.js-article__item__authors').text();
            const link = $(item).find('.article-content-title').attr('href');
            const id = $(item).find('.article-content-title').attr('id');
            return {
                title,
                link,
                id,
                authors,
                issue,
            };
        });

    const renderDesc = (item) => renderDescription(item);
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response2 = await got(`${host}/science/article/pii/${item.id}`, {
                    cookieJar,
                });

                const $2 = load(response2.data);
                $2('.section-title').remove();
                item.doi = $2('.doi').attr('href').replace('https://doi.org/', '');
                item.abstract = $2('.abstract.author').text();
                item.description = renderDesc(item);
                return item;
            })
        )
    );

    return {
        title: `${jrnlName} - ${issue}`,
        link: issueUrl,
        item: items,
    };
}
