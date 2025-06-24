import { Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import { load } from 'cheerio';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/kx',
    categories: ['finance'],
    view: ViewType.Notifications,
    example: '/fx678/kx',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['fx678.com/kx'],
        },
    ],
    name: '7x24 小时快讯',
    maintainers: ['occupy5', 'dousha'],
    handler,
    url: 'fx678.com/kx',
};

async function handler() {
    const link = 'https://www.fx678.com/kx/';
    const res = await got.get(link);
    const $ = load(res.data);
    // 页面新闻消息列表
    const list = $('.body_zb ul .body_zb_li .zb_word')
        .find('.list_font_pic > a:first-child')
        .toArray()
        .slice(0, 30)
        .map((e) => $(e).attr('href'));

    const out = await Promise.all(
        list.map((itemUrl) =>
            cache.tryGet(itemUrl, async () => {
                const res = await got.get(itemUrl);
                const $ = load(res.data);

                const contentPart = $('.article-main .content').html().trim();
                const forewordPart = $('.article-main .foreword').html().trim();
                const datetimeString = $('.article-cont .details i').text().trim();
                const articlePubDate = timezone(parseDate(datetimeString, 'YYYY-MM-DD HH:mm:ss'), +8);

                const item = {
                    title: $('.article-main .foreword').text().trim().split('——').pop(),
                    link: itemUrl,
                    description: contentPart.length > 1 ? contentPart : forewordPart,
                    pubDate: articlePubDate,
                };

                return item;
            })
        )
    );
    return {
        title: '7x24小时快讯',
        link,
        item: out,
    };
}
