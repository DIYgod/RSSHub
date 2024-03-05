// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
const { rootUrl } = require('./utils');

export default async (ctx) => {
    const currentUrl = `${rootUrl}/update`;
    const response = await got(currentUrl);

    const $ = load(response.data);

    const list = $('.video_item')
        .toArray()
        .map((item) => {
            item = $(item);
            const link = item.find('a').attr('href').replace('http://', 'https://');
            return {
                title: item.text(),
                link,
                guid: `${link}#${item.find('.video_item--info').text()}`,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = load(detailResponse.data);

                content('img').each((_, ele) => {
                    if (ele.attribs['data-original']) {
                        ele.attribs.src = ele.attribs['data-original'];
                        delete ele.attribs['data-original'];
                    }
                });
                content('.video_detail_collect').remove();

                item.description = content('.video_detail_left').html();

                return item;
            })
        )
    );

    ctx.set('data', {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    });
};
