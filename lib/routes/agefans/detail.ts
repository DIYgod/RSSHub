// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
const { rootUrl } = require('./utils');

export default async (ctx) => {
    const response = await got(`${rootUrl}/detail/${ctx.req.param('id')}`);
    const $ = load(response.data);

    const ldJson = JSON.parse($('script[type="application/ld+json"]').text());

    const items = $('.video_detail_episode')
        .first()
        .find('li')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a');
            return {
                title: a.text(),
                link: a.attr('href').replace('http://', 'https://'),
            };
        })
        .reverse();

    ctx.set('data', {
        title: `AGE动漫 - ${ldJson.name}`,
        link: `${rootUrl}/detail/${ctx.req.param('id')}`,
        description: ldJson.description,
        item: items,
    });
};
