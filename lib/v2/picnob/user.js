const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');
const { puppeteerGet } = require('./utils');

module.exports = async (ctx) => {
    const baseUrl = 'https://www.picnob.com';
    const { id } = ctx.params;
    const url = `${baseUrl}/profile/${id}/`;

    const browser = await require('@/utils/puppeteer')();
    // TODO: can't bypass cloudflare 403 error without puppeteer
    let html;
    let usePuppeteer = false;
    try {
        const { data } = await got(url, {
            headers: {
                accept: 'text/html',
                referer: 'https://www.google.com/',
            },
        });
        html = data;
    } catch (e) {
        if (e.message.includes('code 403')) {
            html = await puppeteerGet(url, browser);
            usePuppeteer = true;
        }
    }
    const $ = cheerio.load(html);
    const profileName = $('h1.fullname').text();
    const userId = $('input[name=userid]').attr('value');

    let posts;
    if (!usePuppeteer) {
        const { data } = await got(`${baseUrl}/api/posts`, {
            headers: {
                accept: 'application/json',
            },
            searchParams: {
                userid: userId,
            },
        });
        posts = data.posts;
    } else {
        const data = await puppeteerGet(`${baseUrl}/api/posts?userid=${userId}`, browser);
        posts = data.posts;
    }

    const list = await Promise.all(
        posts.items.map(async (item) => {
            const { shortcode, type } = item;
            const link = `${baseUrl}/post/${shortcode}/`;
            if (type === 'img_multi') {
                item.images = await ctx.cache.tryGet(link, async () => {
                    let html;
                    if (!usePuppeteer) {
                        const { data } = await got(link);
                        html = data;
                    } else {
                        html = await puppeteerGet(link, browser);
                    }
                    const $ = cheerio.load(html);
                    return [
                        ...new Set(
                            $('.post_slide a')
                                .toArray()
                                .map((a) => {
                                    a = $(a);
                                    return {
                                        ori: a.attr('href'),
                                        url: a.find('img').attr('data-src'),
                                    };
                                })
                        ),
                    ];
                });
            }

            return {
                title: item.sum_pure,
                description: art(path.join(__dirname, 'templates/desc.art'), { item }),
                link,
                pubDate: parseDate(item.time, 'X'),
            };
        })
    );
    await browser.close();

    ctx.state.data = {
        title: `${profileName} (@${id}) - Picnob`,
        description: $('.info .sum').text(),
        link: url,
        image: $('.ava .pic img').attr('src'),
        item: list,
    };
};
