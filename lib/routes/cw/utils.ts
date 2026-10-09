import { load } from 'cheerio';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://www.cw.com.tw';

const pathMap = {
    today: {
        pageUrl: () => '/today',
        limit: 30,
    },
    master: {
        pageUrl: (channel) => `/masterChannel.action?idMasterChannel=${channel}`,
        limit: 12,
    },
    sub: {
        pageUrl: (channel) => `/subchannel.action?idSubChannel=${channel}`,
        limit: 12,
    },
    author: {
        pageUrl: (channel) => `/author/${channel}`,
        limit: 10,
    },
};

const parsePage = async (path, ctx) => {
    const pageUrl = `${baseUrl}${pathMap[path].pageUrl(ctx.req.param('channel'))}`;

    const response = await ofetch(pageUrl);
    const $ = load(response);

    const list = parseList($, ctx.req.query('limit') ? Number(ctx.req.query('limit')) : pathMap[path].limit);
    const items = await parseItems(list);

    return { $, items };
};

const parseList = ($, limit) =>
    $('.caption')
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.find('h3').text(),
                link: $item.find('h3 a').attr('href'),
                pubDate: parseDate($item.find('time').text()),
            };
        })
        .slice(0, limit);

const parseItems = (list) =>
    Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);

                const meta = JSON.parse($('head script[type="application/ld+json"]:contains("NewsArticle")').first().text());
                $('.article__head .breadcrumb, .article__head h1, .article__provideViews, .ad').remove();
                $('img.lazyload').each((_, img) => {
                    if (!img.attribs['data-src']) {
                        return;
                    }

                    img.attribs.src = img.attribs['data-src'];
                    delete img.attribs['data-src'];
                });

                item.title = $('head title').text();
                item.category = $('meta[name=keywords]').attr('content')!.split(',');
                item.pubDate = parseDate(meta.datePublished);
                item.author = Array.isArray(meta.author) ? meta.author : meta.author.name;
                item.description = $('.article__head .container').html()! + $('.article__content').html()!;

                return item;
            })
        )
    );

export { baseUrl, parseItems, parseList, parsePage, pathMap };
