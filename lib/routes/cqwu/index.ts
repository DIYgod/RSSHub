// @ts-nocheck
import cache from '@/utils/cache';
import { load } from 'cheerio';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const host = 'https://www.cqwu.edu.cn';
const map = {
    notify: '/channel_24894.html',
    academiceve: '/channel_24895.html',
};
const titleMap = {
    notify: '通知',
    academiceve: '学术活动',
};

export default async (ctx) => {
    const type = ctx.req.param('type') ?? 'academiceve';
    const link = host + map[type];
    const title = '重文理' + titleMap[type] + '公告';
    const response = await got.get(link);
    const $ = load(response.data);
    const list = $('div[class="list"] ul').find('li');

    const items = await Promise.all(
        list.map(async (i, item) => {
            const pageUrl = host + $(item).find('a').attr('href');
            const { desc, pubDate } = await cache.tryGet(pageUrl, async () => {
                const page = await got.get(pageUrl);
                const $ = load(page.data);
                return {
                    desc: $('.contentAtice').html(),
                    pubDate: parseDate($('.abs span:nth-child(1)').text().replace('发布时间：', '')),
                };
            });

            return {
                title: $(item).find('.title').text(),
                link: pageUrl,
                description: desc,
                pubDate,
            };
        })
    );

    ctx.set('data', {
        title,
        link,
        item: items,
    });
};
