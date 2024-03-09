import { getSubPath } from '@/utils/common-utils';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import iconv from 'iconv-lite';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { config } from '@/config';
const allowHost = new Set([
    'www.xbiquwx.la',
    'www.biqu5200.net',
    'www.xbiquge.so',
    'www.biqugeu.net',
    'www.b520.cc',
    'www.ahfgb.com',
    'www.ibiquge.la',
    'www.biquge.tv',
    'www.bswtan.com',
    'www.biquge.co',
    'www.bqzhh.com',
    'www.biqugse.com',
    'www.ibiquge.info',
    'www.ishuquge.com',
    'www.mayiwxw.com',
]);

export default async (ctx) => {
    const rootUrl = getSubPath(ctx).split('/').slice(1, 4).join('/');
    const currentUrl = getSubPath(ctx).slice(1);
    if (!config.feature.allow_user_supply_unsafe_domain && !allowHost.has(new URL(rootUrl).hostname)) {
        throw new Error(`This RSS is disabled unless 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN' is set to 'true'.`);
    }

    const response = await got({
        method: 'get',
        url: currentUrl,
        responseType: 'buffer',
        https: {
            rejectUnauthorized: false,
        },
    });

    const isGBK = /charset="?'?gb/i.test(response.data.toString());
    const encoding = isGBK ? 'gbk' : 'utf-8';

    const $ = load(iconv.decode(response.data, encoding));
    const author = $('meta[property="og:novel:author"]').attr('content');
    const pubDate = timezone(parseDate($('meta[property="og:novel:update_time"]').attr('content')), +8);

    let items = $('dl dd a')
        .toArray()
        .reverse()
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 1)
        .map((item) => {
            item = $(item);

            let link = '';
            const url = item.attr('href');
            if (url.startsWith('http')) {
                link = url;
            } else if (/^\//.test(url)) {
                link = `${rootUrl}${url}`;
            } else {
                link = `${currentUrl}/${url}`;
            }

            return {
                title: item.text(),
                link,
                author,
                pubDate,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                    responseType: 'buffer',
                    https: {
                        rejectUnauthorized: false,
                    },
                });

                const content = load(iconv.decode(detailResponse.data, encoding));

                item.description = content('#content').html();

                return item;
            })
        )
    );

    ctx.set('data', {
        title: `${$('meta[property="og:title"]').attr('content')} - 笔趣阁`,
        link: currentUrl,
        item: items,
    });
};
