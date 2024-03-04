// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

const host = 'https://yz.chsi.com.cn';

export default async (ctx) => {
    const { type } = ctx.req.param();
    const response = await got(`${host}/kyzx/${type}`);
    const $ = load(response.data);
    const typeName = $('.bread-nav .location a').last().text() || '考研资讯';
    const list = $('ul.news-list').children();
    const items = await Promise.all(
        list.map((i, item) => {
            item = $(item);
            const itemTitle = item.find('a').text();
            const itemDate = item.find('.span-time').text();
            const path = item.find('a').attr('href');
            let itemUrl = '';
            itemUrl = path.startsWith('http') ? path : host + path;
            return cache.tryGet(itemUrl, async () => {
                let description = '';
                if (itemUrl) {
                    const result = await got(itemUrl);
                    const $ = load(result.data);
                    description = $('#article_dnull').html().trim();
                } else {
                    description = itemTitle;
                }
                return {
                    title: itemTitle,
                    link: itemUrl,
                    pubDate: timezone(parseDate(itemDate), 8),
                    description,
                };
            });
        })
    );

    ctx.set('data', {
        title: `中国研究生招生信息网 - ${typeName}`,
        link: `${host}/kyzx/${type}/`,
        description: `中国研究生招生信息网 - ${typeName}`,
        item: items,
    });
};
