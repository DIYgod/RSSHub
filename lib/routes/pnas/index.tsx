import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';
import { CookieJar } from 'tough-cookie';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import logger from '@/utils/logger';
import { parseDate } from '@/utils/parse-date';
import puppeteer from '@/utils/puppeteer';
import { setCookies } from '@/utils/puppeteer-utils';

export const route: Route = {
    path: '/:topicPath{.+}?',
    radar: [
        {
            source: ['pnas.org/*topicPath'],
            target: '/:topicPath',
        },
    ],
    name: 'Unknown',
    maintainers: [],
    handler,
    url: 'pnas.org/*topicPath',
};

async function handler(ctx) {
    const baseUrl = 'https://www.pnas.org';
    const topicPath = ctx.req.param('topicPath');
    const link = `${baseUrl}/${topicPath ?? 'latest'}`;

    let cookieJar = await cache.get('pnas:cookieJar');
    const cacheMiss = !cookieJar;
    cookieJar = cacheMiss ? new CookieJar() : CookieJar.fromJSON(cookieJar);
    const { data: res } = await got(link, {
        cookieJar,
    });
    if (cacheMiss) {
        await cache.set('pnas:cookieJar', cookieJar.toJSON());
    }

    const $ = load(res);
    const list = $('.card--row-reversed .card-content')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('.article-title a');
            return {
                title: a.text(),
                link: new URL(a.attr('href'), baseUrl).href,
                pubDate: parseDate(item.find('.card__meta__date').text()),
            };
        });

    const browser = await puppeteer();

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const page = await browser.newPage();
                await setCookies(page, await cookieJar.getCookieString(item.link), '.pnas.org');
                await page.setRequestInterception(true);
                page.on('request', (request) => {
                    request.resourceType() === 'document' ? request.continue() : request.abort();
                });
                logger.http(`Requesting ${item.link}`);
                await page.goto(item.link, {
                    waitUntil: 'domcontentloaded',
                    referer: link,
                });
                await page.waitForSelector('.core-container');

                const res = await page.evaluate(() => document.documentElement.innerHTML);
                await page.close();

                const $ = load(res);
                const PNASdataLayer = JSON.parse(
                    $('script')
                        .text()
                        .match(/PNASdataLayer =(.*?);/)[1]
                );

                $('.signup-alert-ad, .citations-truncation button').remove();

                const { keywords, topic } = PNASdataLayer.page.attributes;

                item.category = [...keywords, topic];
                item.author = PNASdataLayer.page.pageInfo.author;
                item.doi = PNASdataLayer.page.pageInfo.DOI;
                const access = PNASdataLayer.user.access === 'yes';
                const abstracts = $('#abstracts .core-container').html();
                const articleBody = $('[property=articleBody]').html();
                const dataAvailability = $('#data-availability').html();
                const acknowledgments = $('#acknowledgments').html();
                const supplementaryMaterials = $('#supplementary-materials').html();
                const bibliography = $('#bibliography').html();

                item.description = renderToString(
                    <>
                        {abstracts ? raw(abstracts) : null}
                        {access && articleBody ? raw(articleBody) : null}
                        {dataAvailability ? raw(dataAvailability) : null}
                        {acknowledgments ? raw(acknowledgments) : null}
                        {supplementaryMaterials ? raw(supplementaryMaterials) : null}
                        {bibliography ? raw(bibliography) : null}
                    </>
                );

                return item;
            })
        )
    );

    await browser.close();

    return {
        title: `${$('.banner-widget__content h1').text()} - PNAS`,
        description: $('.banner-widget__content p').text(),
        image: 'https://www.pnas.org/favicon.ico',
        language: 'en-US',
        link,
        item: out,
    };
}
