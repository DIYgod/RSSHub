// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';
const { puppeteerGet } = require('./utils');
import puppeteer from '@/utils/puppeteer';

export default async (ctx) => {
    const baseUrl = 'https://www.picnob.com';
    const id = ctx.req.param('id');
    const url = `${baseUrl}/profile/${id}/`;

    const browser = await puppeteer();
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
    } catch (error) {
        if (error.message.includes('code 403')) {
            html = await puppeteerGet(url, browser);
            usePuppeteer = true;
        }
    }
    const $ = load(html);
    const profileName = $('h1.fullname').text();
    const userId = $('input[name=userid]').attr('value');

    let posts;
    if (usePuppeteer) {
        const data = await puppeteerGet(`${baseUrl}/api/posts?userid=${userId}`, browser);
        posts = data.posts;
    } else {
        const { data } = await got(`${baseUrl}/api/posts`, {
            headers: {
                accept: 'application/json',
            },
            searchParams: {
                userid: userId,
            },
        });
        posts = data.posts;
    }

    const list = await Promise.all(
        posts.items.map(async (item) => {
            const { shortcode, type, sum_pure, time } = item;
            const link = `${baseUrl}/post/${shortcode}/`;
            if (type === 'img_multi') {
                item.images = await cache.tryGet(link, async () => {
                    let html;
                    if (usePuppeteer) {
                        html = await puppeteerGet(link, browser);
                    } else {
                        const { data } = await got(link);
                        html = data;
                    }
                    const $ = load(html);
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
                title: sum_pure,
                description: art(path.join(__dirname, 'templates/desc.art'), { item }),
                link,
                pubDate: parseDate(time, 'X'),
            };
        })
    );
    await browser.close();

    ctx.set('data', {
        title: `${profileName} (@${id}) - Picnob`,
        description: $('.info .sum').text(),
        link: url,
        image: $('.ava .pic img').attr('src'),
        item: list,
    });
};
