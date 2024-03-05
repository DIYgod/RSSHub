// @ts-nocheck
import { getSubPath } from '@/utils/common-utils';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const { rootUrl, ProcessItem } = require('./utils');

const shortcuts = {
    '/information': '/information/web_news',
    '/information/latest': '/information/web_news',
    '/information/recommend': '/information/web_recommend',
    '/information/life': '/information/happy_life',
    '/information/estate': '/information/real_estate',
    '/information/workplace': '/information/web_zhichang',
};

export default async (ctx) => {
    const path = getSubPath(ctx)
        .replace(/^\/news(?!flashes)/, '/information')
        .replace(/\/search\/article/, '/search/articles');

    const currentUrl = `${rootUrl}${Object.hasOwn(shortcuts, path) ? shortcuts[path] : path}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const data = JSON.parse(response.data.match(/"itemList":(\[.*?])/)[1]);

    let items = data
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 30)
        .filter((item) => item.itemType !== 0)
        .map((item) => {
            item = item.templateMaterial ?? item;
            return {
                title: item.widgetTitle.replaceAll(/<\/?em>/g, ''),
                author: item.author,
                pubDate: parseDate(item.publishTime),
                link: `${rootUrl}/${path === '/newsflashes' ? 'newsflashes' : 'p'}/${item.itemId}`,
                description: item.widgetContent ?? item.content,
            };
        });

    if (!/^\/(search|newsflashes)/.test(path)) {
        items = await Promise.all(items.map((item) => ProcessItem(item, cache.tryGet)));
    }

    ctx.set('data', {
        title: `36氪 - ${$('title').text().split('_')[0]}`,
        link: currentUrl,
        item: items,
    });
};
