import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { load } from 'cheerio';
import path from 'node:path';
import { art } from '@/utils/render';

import { CookieJar } from 'tough-cookie';
const cookieJar = new CookieJar();

export const route: Route = {
    path: '/:journal',
    categories: ['journal'],
    example: '/mdpi/analytica',
    parameters: { journal: 'Journal Name, get it from the journal homepage' },
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
            source: ['www.mdpi.com/journal/:journal'],
        },
    ],
    name: 'Journal',
    maintainers: ['Derekmini'],
    handler,
};

async function handler(ctx) {
    const journal = ctx.req.param('journal');
    const host = 'https://www.mdpi.com';
    const jrnlUrl = `${host}/journal/${journal}`;

    const response = await got(jrnlUrl, {
        cookieJar,
    });
    const $ = load(response.data);
    const jrnlName = $('.journal__description').find('h1').text();
    const issueUrl = `${host}${$('.side-menu-ul').find('a').eq(1).attr('href')}`;

    const response2 = await got(issueUrl, {
        cookieJar,
    });
    const $2 = load(response2.data);
    const issue = $2('.content__container').find('h1').text().trim();
    const list = $2('.article-item')
        .map((_, item) => {
            const title = $2(item).find('.title-link').text();
            const link = `${host}${$2(item).find('.title-link').attr('href')}`;
            const authors = $2(item).find('.authors').find('.inlineblock').text();
            const doiLink = $2(item).find('.color-grey-dark').find('a').attr('href');
            let doi = '';
            if (doiLink !== undefined) {
                doi = doiLink.replace('https://doi.org/', '');
            }
            $2(item).find('.abstract-full').find('a').remove();
            const abstract = $2(item).find('.abstract-full').text().trim();
            const img = `${host}${$2(item).find('.openpopupgallery').find('img').attr('data-src')}`;
            return {
                title,
                authors,
                link,
                doi,
                abstract,
                issue,
                img,
            };
        })
        .get();

    const renderDesc = (item) =>
        art(path.join(__dirname, 'templates/description.art'), {
            item,
        });
    const items = list.map((item) => {
        item.description = renderDesc(item);
        return item;
    });

    return {
        title: jrnlName,
        link: jrnlUrl,
        item: items,
    };
}
