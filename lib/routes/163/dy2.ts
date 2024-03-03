// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
const iconv = require('iconv-lite');
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
const { parseDyArticle } = require('./utils');

export default async (ctx) => {
    const id = ctx.req.param('id');
    const limit = ctx.req.query('limit') ?? 30;
    const url = `https://www.163.com/dy/media/${id}.html`;

    const response = await got(url, { responseType: 'buffer' });

    const charset = response.headers['content-type'].split('=')[1];
    const data = iconv.decode(response.data, charset);
    const $ = load(data);

    const list = $('.tab_content ul li')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('h4 a').text(),
                link: item.find('a').first().attr('href'),
                pubDate: timezone(parseDate(item.find('.time').text()), 8),
                imgsrc: item.find('a img').attr('src'),
            };
        });

    const items = await Promise.all(list.map((item) => parseDyArticle(charset, item, cache.tryGet)));

    ctx.set('data', {
        title: `${$('head title').text()} - 网易号`,
        link: url,
        description: $('.icon_line.desc').text(),
        image: $('.head_img').attr('src'),
        item: items,
        author: $('h2').text(),
    });
};
