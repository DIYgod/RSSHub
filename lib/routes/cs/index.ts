// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
const iconv = require('iconv-lite');
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

const decodeBufferByCharset = (buffer) => {
    const isGBK = /charset="?'?gb/i.test(buffer.toString());
    const encoding = isGBK ? 'gbk' : 'utf-8';

    return iconv.decode(buffer, encoding);
};

export default async (ctx) => {
    const { category = 'xwzx' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 30;

    const rootUrl = 'https://www.cs.com.cn';
    const currentUrl = new URL(category.endsWith('/') ? category : `${category}/`, rootUrl).href;

    const { data: response } = await got(currentUrl, {
        responseType: 'buffer',
    });

    const $ = load(decodeBufferByCharset(response));

    let items = $('ul.ch_type3_list li a')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.find('h3').text().trim(),
                link: new URL(item.prop('href'), currentUrl).href,
                pubDate: timezone(parseDate(item.find('em').text()), +8),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const { data: detailResponse } = await got(item.link, {
                        responseType: 'buffer',
                    });

                    const content = load(decodeBufferByCharset(detailResponse));

                    item.title = content('article.cont_article header h1').text().trim();
                    item.description = content('article.cont_article section').html();
                    item.author = content('div.artc_info em').text().trim();
                    item.category = content('div.artc_route div a')
                        .slice(1)
                        .toArray()
                        .map((c) => content(c).prop('title') ?? content(c).text());
                    item.pubDate = timezone(parseDate(content('.time').prop('datetime')), +8);
                } catch {
                    // no-empty
                }

                return item;
            })
        )
    );

    const title = $('title').text();
    const image = new URL($('div.logo_cs a img').prop('src'), currentUrl).href;
    const icon = new URL('favicon.ico', rootUrl).href;

    ctx.set('data', {
        item: items,
        title,
        link: currentUrl,
        description: $('meta[name="Description"]').prop('content'),
        language: $('html').prop('lang'),
        image,
        icon,
        logo: icon,
        subtitle: $('meta[name="Keywords"]').prop('content'),
        author: title.split('-').pop().trim(),
    });
};
