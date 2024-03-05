// @ts-nocheck
import { getSubPath } from '@/utils/common-utils';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';

export default async (ctx) => {
    let language = '';
    let path = getSubPath(ctx);

    if (/^\/cn\/(cn|zh)/.test(path)) {
        language = path.match(/^\/cn\/(cn|zh)/)[1];
        path = path.match(new RegExp('\\/cn\\/' + language + '(.*)'))[1];
    } else {
        language = 'cn';
    }

    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 25;

    const rootUrl = `https://${language === 'zh' ? 'zh.' : ''}cn.nikkei.com`;
    const isOfficialRSS = path === '/rss';
    const currentUrl = `${rootUrl}${path}${isOfficialRSS ? '.html' : ''}`;

    let officialFeed;

    let items = [],
        $;

    if (isOfficialRSS) {
        officialFeed = await parser.parseURL(currentUrl);
        items = officialFeed.items.slice(0, limit).map((item) => ({
            title: item.title,
            link: new URL(item.attr('href'), rootUrl).href,
        }));
    } else {
        const response = await got({
            method: 'get',
            url: currentUrl,
        });

        $ = load(response.data);

        items = $('dt a')
            .toArray()
            .map((item) => {
                item = $(item);

                return {
                    title: item.text(),
                    link: new URL(item.attr('href'), currentUrl).href,
                };
            })
            .reduce((prev, cur) => (prev.length && prev.at(-1).link === cur.link ? prev : [...prev, cur]), [])
            .slice(0, limit);
    }

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: `${item.link}?print=1`,
                });

                const content = load(detailResponse.data);

                const divs = content('#contentDiv div');
                divs.first().remove();
                divs.last().remove();

                item.pubDate = timezone(parseDate(item.link.match(/\/\d+-(.*?)\.html/)[1], 'YYYY-MM-DD-HH-mm-ss'), +9);

                item.author = content('meta[name="author"]').attr('content');
                item.title = item.title ?? content('meta[name="twitter:title"]').attr('content');
                item.description = content('#contentDiv')
                    .html()
                    ?.replace(/&nbsp;/g, '')
                    .replaceAll('<p></p>', '');

                return item;
            })
        )
    );

    ctx.set('data', {
        title: isOfficialRSS ? officialFeed.title : $('title').first().text(),
        description: isOfficialRSS ? officialFeed.description : '',
        link: currentUrl,
        item: items,
    });
};
