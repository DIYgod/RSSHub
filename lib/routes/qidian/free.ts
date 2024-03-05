// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseRelativeDate } from '@/utils/parse-date';

export default async (ctx) => {
    const type = ctx.req.param('type');

    let link, title;
    if (type === 'mm') {
        link = 'https://www.qidian.com/mm/free';
        title = '起点女生网';
    } else {
        link = 'https://www.qidian.com/free';
        title = '起点中文网';
    }

    const response = await got(link);
    const $ = load(response.data);

    const list = $('#limit-list li');
    const out = list
        .map((index, item) => {
            item = $(item);

            const img = `<img src="https:${item.find('.book-img-box img').attr('src')}">`;
            const rank = `<p>评分：${item.find('.score').text()}</p>`;
            const update = `<a href=https:${item.find('p.update > a').attr('href')}>${item.find('p.update > a').text()}</a>`;

            return {
                title: item.find('.book-mid-info h4 a').text(),
                description: img + rank + update + '<br>' + item.find('p.intro').html(),
                pubDate: parseRelativeDate(item.find('p.update span').text()),
                link: 'https:' + item.find('.book-mid-info h4 a').attr('href'),
                author: item.find('p.author a.name').text(),
            };
        })
        .get();

    ctx.set('data', {
        title,
        description: `限时免费-${title}`,
        link,
        item: out,
    });
};
