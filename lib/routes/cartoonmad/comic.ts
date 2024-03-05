// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import { load } from 'cheerio';
import got from '@/utils/got';
const iconv = require('iconv-lite');
import { art } from '@/utils/render';
import * as path from 'node:path';

const baseUrl = 'https://www.cartoonmad.com';
const KEY = '5e585';

const loadContent = (id, { chapter, pages }) => {
    let description = '';
    for (let page = 1; page <= pages; page++) {
        const url = `${baseUrl}/${KEY}/${id}/${chapter}/${String(page).padStart(3, '0')}.jpg`;
        description += art(path.join(__dirname, 'templates/chapter.art'), {
            url,
        });
    }
    return description;
};

const getChapters = (id, list, tryGet) =>
    Promise.all(
        list.map((item) =>
            tryGet(item.link, () => {
                item.description = loadContent(id, item);

                return item;
            })
        )
    );

export default async (ctx) => {
    const id = ctx.req.param('id');
    const link = `${baseUrl}/comic/${id}`;

    const { data } = await got(link, {
        responseType: 'buffer',
        headers: {
            Referer: 'https://www.cartoonmad.com/',
        },
    });
    const content = iconv.decode(data, 'big5');
    const $ = load(content);

    const bookIntro = $('#info').eq(0).find('td').text().trim();
    // const coverImgSrc = $('.cover').parent().find('img').attr('src');
    const list = $('#info')
        .eq(1)
        .find('a')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.text(),
                link: `${baseUrl}${item.attr('href')}`,
                chapter: item.text().match(/\d+/)[0],
                pages: item.next('font').text().match(/\d+/)[0],
            };
        })
        .reverse();

    const chapters = await getChapters(id, list, cache.tryGet);

    ctx.set('data', {
        title: $('head title').text(),
        link,
        description: bookIntro,
        item: chapters,
    });
};
