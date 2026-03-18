import { load } from 'cheerio';
import pMap from 'p-map';

import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseUrl = 'https://news.zaimanhua.com';

export const route: Route = {
    path: '/news/:category?',
    categories: ['anime'],
    example: '/zaimanhua/news/donghuaqingbao',
    parameters: { category: '分类，例如 donghuaqingbao' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    radar: [
        {
            source: ['news.zaimanhua.com/'],
            target: '/news',
        },
        {
            source: ['news.zaimanhua.com/:category'],
            target: '/news/:category',
        },
    ],
    name: '新闻站',
    maintainers: ['kjasn'],
    handler,
    url: 'news.zaimanhua.com',
    description: `| 动画情报       | 漫画情报      | 轻小说情报          | 动漫周边       | 声优情报        | 音乐资讯    | 游戏资讯   | 美图欣赏      | 漫展情报       | 大杂烩  |
| -------------- | ------------- | ------------------- | -------------- | --------------- | ----------- | ---------- | ------------- | -------------- | ------- |
| donghuaqingbao | manhuaqingbao | qingxiaoshuoqingbao | manhuazhoubian | shengyouqingbao | yinyuezixun | youxizixun | meituxinshang | manzhanqingbao | dazahui |`,
};

const extractDescription = ($) => {
    const content = $('.news_content_con').first().clone();
    content.find('#content_page').remove();
    content.find('div').has('img[src*="news_bottom_pic"]').remove();
    return content.html() ?? '';
};

async function handler(ctx) {
    const categorySlug = ctx.req.param('category');
    const listUrl = categorySlug ? `${baseUrl}/${categorySlug}` : baseUrl;
    const response = await got(listUrl, {
        headers: {
            'user-agent': config.trueUA,
            referer: baseUrl,
        },
    });
    const $ = load(response.data);
    const limit = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const list = $('.briefnews_con_li')
        .toArray()
        .map((item) => {
            const element = $(item);
            const link = element.find('h3 a').attr('href');
            const title = element.find('h3 a').text();
            const pubDateText = element.find('p.head_con_p_o span').first().text().trim();
            const pubDate = pubDateText ? timezone(parseDate(pubDateText, 'YYYY-MM-DD HH:mm'), +8) : undefined;
            const authorText = element.find('p.head_con_p_o span').last().text().trim();
            const author = authorText.startsWith('发布') ? authorText.split('：')[1]?.trim() : undefined;

            return {
                title,
                link,
                author,
                pubDate,
            };
        })
        .filter((item): item is { title: string; link: string; author: string | undefined; pubDate: Date | undefined } => Boolean(item.link));

    const items = await pMap(
        list.slice(0, limit),
        async (item) => {
            const detailUrl = item.link.endsWith('.html') ? item.link.replace(/\.html$/, '_all.html') : item.link;
            const detail = await cache.tryGet(detailUrl, async () => {
                const detailResponse = await got(detailUrl, {
                    headers: {
                        'user-agent': config.trueUA,
                        referer: baseUrl,
                    },
                });
                const detailPage = load(detailResponse.data);
                const detailPubDateText = detailPage('.news_content_info .data_time').text().trim();
                const detailPubDate = detailPubDateText ? timezone(parseDate(detailPubDateText, 'YYYY-MM-DD HH:mm'), +8) : undefined;
                const description = extractDescription(detailPage);
                const tags = detailPage('.news_content_foot .bqwarp')
                    .toArray()
                    .map((tag) => detailPage(tag).text());

                return {
                    description,
                    pubDate: detailPubDate,
                    tags,
                };
            });

            return {
                title: item.title,
                link: item.link,
                author: item.author,
                pubDate: detail.pubDate ?? item.pubDate,
                description: detail.description,
                category: detail.tags,
            };
        },
        { concurrency: 4 }
    );

    return {
        title: $('title').text(),
        link: listUrl,
        item: items,
    };
}
