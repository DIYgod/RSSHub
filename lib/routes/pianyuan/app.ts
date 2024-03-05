// @ts-nocheck
import cache from '@/utils/cache';
import { load } from 'cheerio';
const utils = require('./utils');

export default async (ctx) => {
    const media = ctx.req.param('media') ?? -1;
    const link_base = 'https://pianyuan.org/';
    let description = '电影和剧集';
    let link = link_base;
    if (media !== -1) {
        link = link_base + `?cat=${media}`;
        if (media === 'mv') {
            description = '电影';
        } else if (media === 'tv') {
            description = '剧集';
        } else {
            link = link_base;
        }
    }

    const response = await utils.request(link, cache);
    const $ = load(response.data);
    const detailLinks = $('#main-container > div > div.col-md-10 > table > tbody > tr')
        .get()
        .map((tr) => $(tr).find('td.dt.prel.nobr > a').attr('href'));
    detailLinks.shift();
    const items = await utils.ProcessFeed(detailLinks, cache);

    ctx.set('data', {
        title: '片源网',
        description,
        link: link_base,
        item: items,
    });
};
