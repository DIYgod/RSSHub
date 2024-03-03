// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const host = 'https://gs.sass.org.cn';
export default async (ctx) => {
    const type = ctx.req.param('type');
    const url = `${host}/${type}/list.htm`;

    const response = await got(url);

    const $ = load(response.data);
    const list = $('.column-news-list .cols_list .cols');
    const items = await Promise.all(
        list.map((i, item) => {
            const [titleLink, time] = item.children;
            const itemDate = $(time).text();
            const { href: path, title: itemTitle } = titleLink.children[0].attribs;

            const itemUrl = path.startsWith('http') ? path : host + path;
            return cache.tryGet(itemUrl, async () => {
                let description = '';
                if (itemUrl) {
                    const result = await got(itemUrl);
                    const $ = load(result.data);
                    description = $('.read .wp_articlecontent').length ? $('.read .wp_articlecontent').html().trim() : itemTitle;
                } else {
                    description = itemTitle;
                }
                return {
                    title: itemTitle,
                    link: itemUrl,
                    description,
                    pubDate: parseDate(itemDate, 'YYYY-MM-DD'),
                };
            });
        })
    );
    // 处理返回
    ctx.set('data', {
        title: '上海社会科学院 - 研究生院',
        link: url,
        description: '上海社会科学院 - 研究生院',
        item: items,
    });
};
