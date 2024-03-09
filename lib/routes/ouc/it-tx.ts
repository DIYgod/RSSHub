import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const host = 'https://it.ouc.edu.cn';
    const id = ctx.req.param('id') || 'xwdt';
    const link = `${host}/tx/${id}/list.htm`;
    const response = await got(link);
    const $ = load(response.data);
    const typeTitle = $('span.Column_Anchor').text();
    const title = $('li.col_title h2').text();

    const list = $('ul.wp_article_list li')
        .toArray()
        .map((e) => {
            e = $(e);
            const a = e.find('a');
            return {
                title: a.attr('title'),
                link: new URL(a.attr('href'), host).href,
                pubDate: parseDate(e.find('span.Article_PublishDate').text(), 'YYYY-MM-DD'),
            };
        });

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = load(response.data);
                item.author = '中国海洋大学信息科学与工程学院';
                item.description = $('.wp_articlecontent').html();
                return item;
            })
        )
    );

    ctx.set('data', {
        title: `信息科学与工程学院团学工作 - ${typeTitle}${title === typeTitle ? '' : title}`,
        description: '中国海洋大学信息科学与工程学院团学工作',
        link,
        item: out,
    });
};
