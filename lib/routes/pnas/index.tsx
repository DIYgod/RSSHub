import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';
import { CookieJar } from 'tough-cookie';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import logger from '@/utils/logger';
import { parseDate } from '@/utils/parse-date';
import playwright from '@/utils/playwright';
import { setCookies } from '@/utils/playwright-utils';

export const route: Route = {
    path: '/:topicPath{.+}?',
    categories: ['journal'],
    example: '/pnas/latest',
    parameters: {
        topicPath: 'Topic path, support **Featured Topics**, **Articles By Topic** and [**Collected Papers**](https://www.pnas.org/about/collected-papers), `latest` by default',
    },
    features: {
        requirePuppeteer: true,
        antiCrawler: true,
        supportScihub: true,
    },
    radar: [
        {
            source: ['pnas.org/*topicPath'],
            target: '/:topicPath',
        },
    ],
    name: 'Journal',
    maintainers: ['emdoe', 'HenryQW', 'y9c'],
    handler,
    url: 'pnas.org/*topicPath',
    description: `::: tip
Some topics require adding \`topic/\` to \`topicPath\` like [\`/pnas/topic/app-math\`](https://rsshub.app/pnas/topic/app-math) and some don't like [\`/pnas/biophysics-and-computational-biology\`](https://rsshub.app/pnas/biophysics-and-computational-biology)
:::`,
};

async function handler(ctx): Promise<Data> {
    const baseUrl = 'https://www.pnas.org';
    const topicPath = ctx.req.param('topicPath');
    const link = `${baseUrl}/${topicPath ?? 'latest'}`;

    let cookieJar: any = await cache.get('pnas:cookieJar');
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
        .map((item): DataItem & { link: string } => {
            const $item = $(item);
            const a = $item.find('.article-title a');
            return {
                title: a.text(),
                link: new URL(a.attr('href')!, baseUrl).href,
                pubDate: parseDate($item.find('.card__meta__date').text()),
            };
        });

    const context = await playwright();

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const page = await context.newPage();
                await setCookies(page, await cookieJar.getCookieString(item.link), '.pnas.org');
                await page.route('**/*', (route) => {
                    const request = route.request();
                    request.resourceType() === 'document' ? route.continue() : route.abort();
                });
                logger.http(`Requesting ${item.link}`);
                await page.goto(item.link, {
                    waitUntil: 'domcontentloaded',
                    referer: link,
                });
                await page.waitForSelector('.core-container');

                const res = await page.evaluate(() => document.documentElement.getHTML());
                await page.close();

                const $ = load(res);
                const PNASdataLayer = JSON.parse(
                    $('script')
                        .text()
                        .match(/PNASdataLayer =(.*?);/)![1]
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

    await context.close();

    return {
        title: `${$('.banner-widget__content h1').text()} - PNAS`,
        description: $('.banner-widget__content p').text(),
        image: 'https://www.pnas.org/favicon.ico',
        language: 'en-us',
        link,
        item: out,
    };
}
