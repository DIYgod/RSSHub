// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export default async (ctx) => {
    const url = 'http://graduate.bjfu.edu.cn/pygl/pydt/index.html';
    const response = await got.get(url);
    const data = response.data;
    const $ = load(data);
    const list = $('.itemList li')
        .slice(0, 11)
        .toArray()
        .map((e) => {
            const element = $(e);
            const title = element.find('li a').attr('title');
            const link = element.find('li a').attr('href');
            const date = element
                .find('li a')
                .text()
                .match(/\d{4}-\d{2}-\d{2}/);
            const pubDate = timezone(parseDate(date), 8);

            return {
                title,
                link: 'http://graduate.bjfu.edu.cn/pygl/pydt/' + link,
                author: '北京林业大学研究生院培养动态',
                pubDate,
            };
        });

    const result = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const itemReponse = await got.get(item.link);
                const data = itemReponse.data;
                const itemElement = load(data);

                item.description = itemElement('.articleTxt').html();

                return item;
            })
        )
    );

    ctx.set('data', {
        title: '北林研培养动态',
        link: url,
        item: result,
    });
};
