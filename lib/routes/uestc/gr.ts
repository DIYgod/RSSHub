// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://gr.uestc.edu.cn/tongzhi/';
const baseIndexUrl = 'https://gr.uestc.edu.cn';

export default async (ctx) => {
    const response = await got.get(baseIndexUrl);

    const $ = load(response.data);

    const items = [];
    $('[href^="/tongzhi/"]').each((_, item) => {
        items.push(baseIndexUrl + item.attribs.href);
    });

    const out = await Promise.all(
        items.map(async (newsUrl) => {
            const newsDetail = await cache.tryGet(newsUrl, async () => {
                const result = await got.get(newsUrl);

                const $ = load(result.data);

                const title = '[' + $('.over').text() + '] ' + $('div.title').text();
                const author = $('.info').text().split('|')[1].trim().substring(3);
                const date = parseDate($('.info').text().split('|')[0].trim().substring(4));
                const description = $('.content').html();

                return {
                    title,
                    link: newsUrl,
                    author,
                    pubDate: date,
                    description,
                };
            });
            return newsDetail;
        })
    );

    ctx.set('data', {
        title: '研究生院通知',
        link: baseUrl,
        description: '电子科技大学研究生院通知公告',
        item: out,
    });
};
