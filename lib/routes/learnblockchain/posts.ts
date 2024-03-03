// @ts-nocheck
import { load } from 'cheerio';
import got from '@/utils/got';
import { parseRelativeDate } from '@/utils/parse-date';

export default async (ctx) => {
    const cid = ctx.req.param('cid') || 'all';
    const sort = ctx.req.param('sort');

    let url = 'https://learnblockchain.cn/categories/';
    url += cid + '/';

    if (sort) {
        url += sort + '/';
    }

    const response = await got(url);

    const data = response.data;
    const $ = load(data);
    const list = $('div.stream-list section.stream-list-item');

    ctx.set('data', {
        title: `登链社区--${cid}`,
        link: url,
        description: `登链社区`,
        item:
            list &&
            list
                .map((idx, ite) => {
                    const item = $(ite);
                    const json = {
                        title: item.find('h2.title').text().trim(),
                        description: item.find('div.excerpt').text().trim(),
                        pubDate: parseRelativeDate(item.find('.author li:nth-child(2)').text().replace('发布于', '').trim()),
                        link: item.find('h2.title a').attr('href').trim(),
                        author: item.find('.author li:nth-child(1)').text().trim(),
                    };

                    return json;
                })
                .get(),
    });
};
