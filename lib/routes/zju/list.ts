// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
const host = 'https://www.zju.edu.cn/';
export default async (ctx) => {
    const type = ctx.req.param('type') ?? 'xs';
    const link = host + type + `/list.htm`;
    const response = await got({
        method: 'get',
        url: link,
        headers: {
            Referer: host,
        },
    });
    const $ = load(response.data);

    function sortUrl(e) {
        return e.search('redirect') === -1 ? e : link;
    }
    const list = $('#wp_news_w7 ul.news li')
        .map(function () {
            const info = {
                title: $(this).find('a').attr('title'),
                link: sortUrl($(this).find('a').attr('href')),
                date: $(this)
                    .text()
                    .match(/\d{4}-\d{2}-\d{2}/)[0],
            };
            return info;
        })
        .get();

    const out = await Promise.all(
        list.map((info) => {
            const title = info.title;
            const date = info.date;
            const itemUrl = new URL(info.link, host).href;
            return cache.tryGet(itemUrl, async () => {
                const response = await got({
                    method: 'get',
                    url: itemUrl,
                    headers: {
                        Referer: link,
                    },
                });
                const $ = load(response.data);
                const description = $('.right_content').html();
                return {
                    title,
                    link: itemUrl,
                    description,
                    pubDate: parseDate(date),
                };
            });
        })
    );
    ctx.set('data', {
        title: `浙江大学` + $('ul.submenu .selected').text(),
        link,
        item: out,
    });
};
