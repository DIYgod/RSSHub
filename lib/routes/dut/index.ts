// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
const defaults = require('./defaults');
const shortcuts = require('./shortcuts');
import { isValidHost } from '@/utils/valid-host';

export default async (ctx) => {
    const site = ctx.params[0] ?? 'news';
    if (!isValidHost(site)) {
        throw new Error('Invalid site');
    }

    let items;
    let category = ctx.params[1] ?? (Object.hasOwn(defaults, site) ? defaults[site] : '');
    category = Object.hasOwn(shortcuts, site) ? (Object.hasOwn(shortcuts[site], category) ? shortcuts[site][category] : category) : category;

    const rootUrl = `https://${site}.dlut.edu.cn`;
    const currentUrl = `${rootUrl}/${category}.htm`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    if (site === 'panjin') {
        items = $('a.news').slice(0, -4);
    } else if (site === 'fldpj') {
        items = $('li[id^="line_u9"]').find('a');
    } else {
        $('.Next, .rjxw_left, .pb_sys_common').remove();
        items = $('.txt, .itemlist, .wall, .list, .list01, .ny_list, .rjxw_right, .rj_yjs_con, .c_hzjl_list1, .winstyle67894, .winstyle80936, .winstyle50738, #lili').find('a');
    }

    items = items
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 50)
        .toArray()
        .map((item) => {
            item = $(item);

            const result = {
                link: item.attr('href').startsWith('http') ? item.attr('href') : `${rootUrl}/${item.attr('href').replace(/^[./]+/, '')}`,
            };

            if (site === 'fldpj') {
                result.title = item.find('em').text();
                result.pubDate = parseDate(item.find('span').text());
            } else {
                const dateRegex = /(\d{4}[/年-]\d{2}[/月-]\d{2})/;

                let dateMatch = item.parent().text().match(dateRegex);
                if (!dateMatch) {
                    dateMatch = item.parent().parent().text().match(dateRegex);
                }

                result.title = item.text().trim() === '' ? item.next().text() : item.text();
                if (dateMatch) {
                    result.pubDate = parseDate(dateMatch[1].replaceAll(/年|月/g, '-'));
                }
            }

            return result;
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    const content = load(detailResponse.data);

                    item.description = content('.v_news_content, .conbox').html();
                } catch {
                    // Fo example: http://dutdice.dlut.edu.cn/nry.jsp?urltype=news.NewsContentUrl&wbtreeid=1006&wbnewsid=9820
                    // do nothing to the cases which require fetching resources from the Intranet :P
                }
                return item;
            })
        )
    );

    ctx.set('data', {
        title: $('title').text(),
        link: currentUrl,
        item: items,
        allowEmpty: true,
    });
};
