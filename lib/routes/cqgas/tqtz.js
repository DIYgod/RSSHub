import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
const url = 'http://www.cqgas.cn/portal/article/page?cateId=1082&pageNo=1';
export default async (ctx) => {
    const { data: response } = await got(url);
    const $ = load(response);
    const contentUrl = (id) => `http://www.cqgas.cn/portal/article/content?contentId=${id}`;
    const list = $('ul.news_list > li')
        .toArray()
        .map((item) => {
            item = $(item);
            const title = item.find('a').first();
            return {
                title: title.text(),
                link: contentUrl(title.attr('contentid')),
                pubDate: parseDate(item.find('span.right.txt_black2').text()),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);
                item.description = $('body > div').first().html();
                return item;
            })
        )
    );
    ctx.set('data', {
        title: '重庆燃气——停气检修通知',
        link: url,
        item: items,
    });
};
