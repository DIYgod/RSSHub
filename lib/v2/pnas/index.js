const cheerio = require('cheerio');
const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');
const { setCookies } = require('@/utils/puppeteer-utils');
const { CookieJar } = require('tough-cookie');
const logger = require('@/utils/logger');

module.exports = async (ctx) => {
    const baseUrl = 'https://www.pnas.org';
    const { topicPath } = ctx.params;
    const link = `${baseUrl}/${topicPath ? topicPath : 'latest'}`;

    let cookieJar = await ctx.cache.get('pnas:cookieJar');
    const cacheMiss = !cookieJar;
    cookieJar = cacheMiss ? new CookieJar() : CookieJar.fromJSON(cookieJar);
    const { data: res } = await got(link, {
        cookieJar,
    });
    if (cacheMiss) {
        await ctx.cache.set('pnas:cookieJar', cookieJar.toJSON());
    }

    const $ = cheerio.load(res);
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

    const browser = await require('@/utils/puppeteer')();

    const out = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const page = await browser.newPage();
                await setCookies(page, await cookieJar.getCookieString(item.link), '.pnas.org');
                await page.setRequestInterception(true);
                page.on('request', (request) => {
                    request.resourceType() === 'document' ? request.continue() : request.abort();
                });
                logger.debug(`Requesting ${item.link}`);
                await page.goto(item.link, {
                    waitUntil: 'domcontentloaded',
                    referer: link,
                });
                await page.waitForSelector('.core-container');

                const res = await page.evaluate(() => document.documentElement.innerHTML);
                await page.close();

                const $ = cheerio.load(res);
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
                item.description = art(path.join(__dirname, 'templates', 'article.art'), {
                    access: PNASdataLayer.user.access === 'yes',
                    //
                    abstracts: $('#abstracts .core-container').html(),
                    //
                    articleBody: $('[property=articleBody]').html(),
                    //
                    dataAvailability: $('#data-availability').html(),
                    acknowledgments: $('#acknowledgments').html(),
                    supplementaryMaterials: $('#supplementary-materials').html(),
                    bibliography: $('#bibliography').html(),
                });

                return item;
            })
        )
    );

    browser.close();

    ctx.state.data = {
        title: `${$('.banner-widget__content h1').text()} - PNAS`,
        description: $('.banner-widget__content p').text(),
        image: 'https://www.pnas.org/favicon.ico',
        language: 'en-US',
        link,
        item: out,
    };
};
