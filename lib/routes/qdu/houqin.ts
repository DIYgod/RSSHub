// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

const base = 'https://houqin.qdu.edu.cn/';

export default async (ctx) => {
    const response = await got({
        method: 'get',
        url: `${base}index/tzgg.htm`,
    });

    const $ = load(response.data);
    const list = $('.n_newslist').children();
    const items = await Promise.all(
        list.map((i, item) => {
            item = $(item);
            const itemTitle = item.find('a').text();
            let itemDate = timezone(parseDate(item.find('span').text()), 8);
            const path = item.find('a').attr('href');
            const itemUrl = base + path;
            return cache.tryGet(itemUrl, async () => {
                let description = '';
                const result = await got(itemUrl);
                const $ = load(result.data);
                if (
                    $('.article_body')
                        .find('div > h4')
                        .text()
                        .match(/发布时间：(.*)编辑：/) !== null
                ) {
                    itemDate = timezone(
                        parseDate(
                            $('.article_body')
                                .find('div > h4')
                                .text()
                                .match(/发布时间：(.*)编辑：/)[1]
                                .trim(),
                            'YYYY年MM月DD日 HH:mm'
                        ),
                        8
                    );
                }
                description = $('.v_news_content').html().trim();

                return {
                    title: itemTitle,
                    link: itemUrl,
                    pubDate: itemDate,
                    description,
                };
            });
        })
    );

    ctx.set('data', {
        title: '青岛大学 - 后勤管理处通知',
        link: `${base}index/tzgg.htm`,
        description: '青岛大学 - 后勤管理处通知',
        item: items,
    });
};
