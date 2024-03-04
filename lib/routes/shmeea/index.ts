// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const id = ctx.req.param('id') ?? '08000';
    const baseURL = 'https://www.shmeea.edu.cn';
    const link = `${baseURL}/page/${id}/index.html`;

    const response = await got(link);
    const $ = load(response.data);

    const title = `上海市教育考试院-${$('#main .pageh4-tit').text().trim()}`;

    const list = $('#main .pageList li')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').attr('title') || item.find('a').text(),
                link: new URL(item.find('a').attr('href'), baseURL).href,
                pubDate: parseDate(item.find('.listTime').text().trim(), 'YYYY-MM-DD'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                if (!item.link.endsWith('.html') || new URL(item.link).hostname !== new URL(baseURL).hostname) {
                    return item;
                }

                const result = await got(item.link);
                const $ = load(result.data);

                const description = $('#ivs_content').html();
                const pbTimeText = $('#ivs_title .PBtime').text().trim();

                item.description = description;
                item.pubDate = pbTimeText ? timezone(parseDate(pbTimeText, 'YYYY-MM-DD HH:mm:ss'), +8) : item.pubDate;

                return item;
            })
        )
    );

    ctx.set('data', {
        title,
        link,
        item: items,
    });
};
