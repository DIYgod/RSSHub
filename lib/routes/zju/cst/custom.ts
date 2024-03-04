// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

async function getPage(id) {
    const res = await got({
        method: 'get',
        url: `http://www.cst.zju.edu.cn/${id}/list.htm`,
    });
    const $ = load(res.data);
    const content = $('.lm_new ul li');

    return (
        content &&
        content
            .map((index, item) => {
                item = $(item);

                const title = item.find('a').text();
                const pubDate = parseDate(item.find('.fr').text());
                const link = item.find('a').attr('href');

                return {
                    title,
                    pubDate,
                    link,
                };
            })
            .get()
    );
}

export default async (ctx) => {
    const id = ctx.req.param('id').split('+');
    const tasks = id.map((id) => getPage(id));
    const results = await Promise.all(tasks);
    let items = [];
    for (const result of results) {
        items = [...items, ...result];
    }

    ctx.set('data', {
        title: '浙江大学软件学院通知',
        link: 'http://www.cst.zju.edu.cn/',
        item: items,
    });
};
