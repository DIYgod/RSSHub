// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { finishArticleItem } from '@/utils/wechat-mp';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export default async (ctx) => {
    const id = ctx.req.param('id');
    const rootUrl = 'https://www.cimidata.com';

    const url = `${rootUrl}/a/${id}`;
    const response = await got(url);
    const $ = load(response.data);
    const items = $('.weui_media_box')
        .map((_, ele) => {
            const $item = load(ele);
            const link = $item('.weui_media_title a').attr('href');
            return {
                title: $item('.weui_media_title a').text(),
                description: $item('.weui_media_desc').text(),
                link,
                pubDate: timezone(parseDate($item('.weui_media_extra_info').attr('title')), +8),
            };
        })
        .get();

    await Promise.all(items.map((item) => finishArticleItem(item)));

    ctx.set('data', {
        title: `微信公众号 - ${$('span.name').text()}`,
        link: url,
        description: $('div.Profile-sideColumnItemValue').text(),
        item: items,
    });
};
