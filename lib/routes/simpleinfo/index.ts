// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import * as path from 'node:path';
import { art } from '@/utils/render';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const category = ctx.req.param('category');
    const rootUrl = 'https://blog.simpleinfo.cc';
    const link = `${rootUrl}${category ? (category === 'work' || category === 'talk' ? `/blog/${category}` : `/shasha77?category=${category}`) : '/shasha77'}`;
    const response = await got(link);
    const $ = load(response.data);
    const title = `${$('.-active').text()} - 簡訊設計`;
    $('.-ad').remove();

    const list = $('.article-item')
        .map((_, item) => {
            item = $(item);
            return {
                title: item.find('.title').text(),
                link: item.find('a').first().attr('href'),
                category: item.find('.category').text(),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const result = await got(item.link);
                const content = load(result.data);
                item.author = content('meta[property="article:author"]').attr('content');
                item.pubDate = timezone(parseDate(content('meta[property="article:published_time"]').attr('content')), +8);
                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    image: content('meta[property="og:image"]').attr('content'),
                    description: content('.article-content').first().html(),
                });
                return item;
            })
        )
    );

    ctx.set('data', {
        title,
        link,
        language: 'zh-tw',
        item: items,
    });
};
