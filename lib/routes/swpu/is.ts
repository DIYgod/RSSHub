// @ts-nocheck
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';
import got from '@/utils/got';
import timezone from '@/utils/timezone';

export default async (ctx) => {
    const url = `https://www.swpu.edu.cn/is/xydt/${ctx.req.param('code')}.htm`;

    const res = await got(url);
    const $ = load(res.data);

    let title = $('title').text();
    title = title.substring(0, title.indexOf('-'));

    const items = $('tr[height="20"]')
        .toArray()
        .map((elem) => ({
            title: $('a[title]', elem).text().trim(),
            pubDate: timezone(parseDate($('td:eq(1)', elem).text(), 'YYYY年MM月DD日'), +8),
            link: `https://www.swpu.edu.cn/is/${$('a[href]', elem).attr('href').split('../')[1]}`,
        }));

    const out = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const res = await got(item.link);
                const $ = load(res.data);
                if ($('title').text().startsWith('系统提示')) {
                    item.author = '系统';
                    item.description = '无权访问';
                } else {
                    item.author = '学院';
                    item.description = $('.v_news_content').html();
                    for (const elem of $('.v_news_content p')) {
                        if ($(elem).css('text-align') === 'right') {
                            item.author = $(elem).text();
                            break;
                        }
                    }
                }
                return item;
            })
        )
    );

    ctx.set('data', {
        title: `西南石油大学信息学院 ${title}`,
        link: url,
        description: `西南石油大学信息学院 ${title}`,
        language: 'zh-CN',
        item: out,
    });
};
