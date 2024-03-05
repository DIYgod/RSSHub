// @ts-nocheck
import cache from '@/utils/cache';
// Warning: The author still knows nothing about javascript!

// params:
// type: subject type

import got from '@/utils/got'; // get web content
import { load } from 'cheerio'; // html parser
const get_article = require('./_article');
import { isValidHost } from '@/utils/valid-host';

export default async (ctx) => {
    const type = ctx.req.param('type') ?? 'www';
    if (!isValidHost(type)) {
        throw new Error('Invalid type');
    }

    const base_url = `https://${type}.solidot.org`;
    const response = await got({
        method: 'get',
        url: base_url,
    });
    const data = response.data; // content is html format
    const $ = load(data);

    // get urls
    const a = $('div.block_m').find('div.bg_htit > h2 > a');
    const urls = [];
    for (const element of a) {
        urls.push($(element).attr('href'));
    }

    // get articles
    const msg_list = await Promise.all(urls.map((u) => cache.tryGet(u, () => get_article(u))));

    // feed the data
    ctx.set('data', {
        title: '奇客的资讯，重要的东西',
        link: base_url,
        item: msg_list,
    });
};
