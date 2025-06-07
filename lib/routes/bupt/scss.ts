import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import type { Context } from 'hono';

export const route: Route = {
    path: '/scss/:type?',
    categories: ['university'],
    example: '/bupt/scss/xwdt',
    parameters: {
        type: {
            description: '信息类型，可选值：新闻动态，通知公告',
            default: 'tzgg',
            options: [
                {
                    value: 'xwdt',
                    label: '新闻动态'
                },
                {
                    value: 'tzgg',
                    label: '通知公告'
                }
            ]
        },
    },
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
            source: ['scss.bupt.edu.cn/index/xwdt.htm'],
            target: '/scss/xwdt',
        },
        {
            source: ['scss.bupt.edu.cn/index/tzgg1.htm'],
            target: '/scss/tzgg',
        },
    ],
    name: '网络空间安全学院',
    maintainers: ['ziri2004'],
    handler,
    url: 'scss.bupt.edu.cn',
};

async function handler(ctx: Context) {
    let type = ctx.req.param('type');
    if(!type) {
        type = 'tzgg'; // 默认值为通知公告
    }

    const rootUrl = 'https://scss.bupt.edu.cn';
    let currentUrl;
    let pageTitle;
    let selector;

    if (type === 'xwdt') {
        currentUrl = `${rootUrl}/index/xwdt.htm`;
        pageTitle = '新闻动态';
        selector = '.m-list3 li';
    } else if (type === 'tzgg') {
        currentUrl = `${rootUrl}/index/tzgg1.htm`;
        pageTitle = '通知公告';
        selector = '.Newslist li';
    } else {
        throw new Error('Invalid type parameter');
    }
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const list = $(selector)
        .toArray()
        .map((item) => {
            const $item = $(item);
            const $link = $item.find('a');
            let rawDate = '';

            if ($link.length === 0 || !$link.attr('href')) {
                return null;
            }

            const href = $link.attr('href');
            const link = new URL(href, rootUrl).href;
            if (type === 'tzgg') {
                rawDate = $item.find('span').text().replace('发布时间：', '').trim();
            } else if (type === 'xwdt') {
                rawDate = $item.find('span.time1').text().replace('发布时间：', '').trim();
            }

            return {
                title: $link.text().trim(),
                link,
                pubDateRaw: rawDate, // 暂存原始时间字符串
            };
        })
        .filter(Boolean);


    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link
                });
                const content = load(detailResponse.data);
                const newsContent = content('.v_news_content');

                newsContent.find('p, span, strong').each(function () {
                    const element = content(this);
                    const text = element.text().trim();
                    if (text === '') {
                        element.remove();
                    } else {
                        element.replaceWith(text);
                    }
                });

                item.description = newsContent.html();
                item.pubDate = timezone(parseDate(item.pubDateRaw), +8); // 正确设置 pubDate

                return item;
            })
        )
    );


    return {
        title: `北京邮电大学网络空间安全学院 - ${pageTitle}`,
        link: currentUrl,
        item: items as Data['item'],
    };
}
