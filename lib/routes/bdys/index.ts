// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { art } from '@/utils/render';
import * as path from 'node:path';
const asyncPool = require('tiny-async-pool');
import { config } from '@/config';

// Visit https://www.bdys.me for the list of domains
const allowDomains = new Set(['52bdys.com', 'bde4.icu', 'bdys01.com']);

export default async (ctx) => {
    const caty = ctx.req.param('caty') || 'all';
    const type = ctx.req.param('type') || 'all';
    const area = ctx.req.param('area') || 'all';
    const year = ctx.req.param('year') || 'all';
    const order = ctx.req.param('order') || '0';

    const site = ctx.req.query('domain') || 'bdys01.com';
    if (!config.feature.allow_user_supply_unsafe_domain && !allowDomains.has(new URL(`https://${site}`).hostname)) {
        throw new Error(`This RSS is disabled unless 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN' is set to 'true'.`);
    }

    const rootUrl = `https://www.${site}`;
    const currentUrl = `${rootUrl}/s/${caty}?${type === 'all' ? '' : '&type=' + type}${area === 'all' ? '' : '&area=' + area}${year === 'all' ? '' : '&year=' + year}&order=${order}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let jsessionid = '';

    const list = $('.card-body .card a')
        .slice(0, 15)
        .toArray()
        .map((item) => {
            item = $(item);
            const link = item.attr('href').split(';jsessionid=');
            jsessionid = link[1];
            const next = item.next();
            return {
                title: next.find('h3').text(),
                link: `${rootUrl}${link[0]}`,
                pubDate: parseDate(next.find('.text-muted').text()),
            };
        });

    const headers = {
        cookie: `JSESSIONID=${jsessionid}`,
    };

    const items = [];

    for await (const data of asyncPool(1, list, (item) =>
        cache.tryGet(item.link, async () => {
            const detailResponse = await got({
                method: 'get',
                url: item.link,
                headers,
            });
            const downloadResponse = await got({
                method: 'get',
                url: `${rootUrl}/downloadInfo/list?mid=${item.link.split('/')[4].split('.')[0]}`,
                headers,
            });
            const content = load(detailResponse.data);

            content('svg').remove();
            const torrents = content('.download-list .list-group');

            item.description = art(path.join(__dirname, 'templates/desc.art'), {
                info: content('.row.mt-3').html(),
                synopsis: content('#synopsis').html(),
                links: downloadResponse.data,
                torrents: torrents.html(),
            });

            item.pubDate = timezone(parseDate(content('.bg-purple-lt').text().replace('更新时间：', '')), +8);
            item.guid = `${item.link}#${content('.card h1').text()}`;

            item.enclosure_url = torrents.html() ? `${rootUrl}${torrents.find('a').first().attr('href')}` : downloadResponse.data.pop().url;
            item.enclosure_type = 'application/x-bittorrent';

            return item;
        })
    )) {
        items.push(data);
    }

    ctx.set('data', {
        title: '哔嘀影视',
        link: currentUrl,
        item: items,
    });
};
