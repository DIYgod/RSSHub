// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
const iconv = require('iconv-lite');
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const titles = {
    texie: '特写',
    jishi: '记事',
    daxie: '大写',
    haodu: '好读',
    kanke: '看客',
};

export default async (ctx) => {
    const category = ctx.req.param('category') ?? 'texie';

    const rootUrl = 'https://renjian.163.com';
    const currentUrl = `${rootUrl}/special/renjian_${category}/`;

    const response = await got({
        method: 'get',
        url: currentUrl,
        responseType: 'buffer',
    });

    const data = iconv.decode(response.data, 'gbk');

    let items = {};

    const urls = data.match(/url:"(.*)",/g);

    if (urls) {
        items = urls.slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 50).map((item) => ({
            link: item.match(/url:"(.*)",/)[1],
        }));
    } else {
        const $ = load(data);

        items = $('.article h3 a')
            .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 50)
            .toArray()
            .map((_, item) => {
                item = $(item);
                return {
                    link: item.attr('href'),
                };
            });
    }

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = load(detailResponse.data);

                item.title = content('h1').text();
                item.author = content('script')
                    .text()
                    .match(/renjian_author = '(.*)'/)[1];
                item.description = content('#endText').html() ?? content('#content').html();
                item.pubDate = timezone(parseDate(content('.pub_time').text() ?? content('.post_info').text().split('来源:')[0].trim()), 8);

                return item;
            })
        )
    );

    ctx.set('data', {
        title: `人间 - ${titles[category]} - 网易新闻`,
        link: currentUrl,
        item: items,
    });
};
