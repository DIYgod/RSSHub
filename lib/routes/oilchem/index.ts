// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
const routes = require('./routes');
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const type = ctx.req.param('type') ?? '';
    const category = ctx.req.param('category') ?? '';
    const subCategory = ctx.req.param('subCategory') ?? '';

    const route = category === '' ? '' : `/${category}${subCategory === '' ? '' : `/${subCategory}`}`;

    const rootUrl = `https://${type === '' ? 'www' : 'list'}.oilchem.net`;
    const currentUrl = `${rootUrl}${type === '' ? '/1/' : type === 'list' ? route : `/${routes[`/${type}${route}`]}`}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const list = $('.list ul ul li a')
        .map((_, item) => {
            item = $(item);

            return {
                title: item.text(),
                link: item.attr('href'),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = load(detailResponse.data);

                item.description = content('#content').html();
                item.pubDate = timezone(
                    parseDate(
                        content('.xq-head')
                            .find('span')
                            .text()
                            .match(/发布时间：\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}/)[0],
                        'YYYY-MM-DD HH:mm'
                    ),
                    +8
                );

                return item;
            })
        )
    );

    ctx.set('data', {
        title: `${$('.hdbox h3').text()} - 隆众资讯`,
        link: currentUrl,
        item: items,
    });
};
