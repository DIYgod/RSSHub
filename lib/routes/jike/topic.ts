// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
const { topicDataHanding } = require('./utils');
import { load } from 'cheerio';
const dayjs = require('dayjs');
const { constructTopicEntry } = require('./utils');

const urlRegex = /(https?:\/\/[^\s"'<>]+)/g;

export default async (ctx) => {
    const id = ctx.req.param('id');
    const topicUrl = `https://m.okjike.com/topics/${id}`;

    const data = await constructTopicEntry(ctx, topicUrl);

    if (data) {
        const result = ctx.get('data');
        result.item = topicDataHanding(data, ctx);
        if (id === '553870e8e4b0cafb0a1bef68' || id === '55963702e4b0d84d2c30ce6f') {
            result.item = await Promise.all(
                result.item.map(async (one) => {
                    const item = { ...one };
                    const regResult = /https:\/\/www\.okjike\.com\/medium\/[\dA-Za-z]*/.exec(item.description);
                    if (regResult) {
                        const newsUrl = regResult[0];
                        item.description = await cache.tryGet(newsUrl, async () => {
                            const { data } = await got(newsUrl);
                            const $ = load(data);
                            const upper = $('ul.main > li.item');
                            const links = upper.find('a').map((_, ele) => $(ele).attr('href'));
                            const texts = upper.find('span.text').map((_, ele) => $(ele).text());
                            let description = '';
                            for (const [i, link] of links.entries()) {
                                description += `${i + 1}、<a href="${link}">${texts[i]}</a><br>`;
                            }
                            description = description.replace(/<br>$/, '');
                            return description;
                        });
                    }
                    item.description = item.description.replaceAll(urlRegex, (url) => `<a href="${url}">${url}</a>`);
                    item.title = `${data.topic.content} ${dayjs(one.pubDate).format('MM月DD日')}`;
                    return item;
                })
            );
        }
        ctx.set('data', result);
    }
};
