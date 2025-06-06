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
    let type = ctx.req.param('type'); // 默认类型为通知公告
    if (!type) {
        type = 'tzgg';
    }
    const rootUrl = 'https://scss.bupt.edu.cn';
    let currentUrl;
    let pageTitle;

    if (type === 'xwdt') {
        currentUrl = `${rootUrl}/index/xwdt.htm`;
        pageTitle = '新闻动态';
    } else if (type === 'tzgg') {
        currentUrl = `${rootUrl}/index/tzgg1.htm`;
        pageTitle = '通知公告';
    } else {
        throw new Error('Invalid type parameter');
    }

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const selector = type === 'xwdt' ? '.m-list3 li' : '.Newslist li';

    const list = $(selector)
        .toArray()
        .map((item) => {
            const $item = $(item);
            const $link = $item.find('a');
            if ($link.length === 0 || !$link.attr('href')) {
                return null;
            }
            const href = $link.attr('href');
            const link = new URL(href, rootUrl).href;

            return {
                title: $link.text().trim(),
                link,
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

                // 清理后的内容转换为文本
                const cleanedDescription = newsContent.text().trim();

                let pubDateText = content('.info span').first().text().trim();
                if (!pubDateText || pubDateText === '') {
                    pubDateText = content('body').text().match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? '';
                }

                item.description = content('.v_news_content').html();
                item.pubDate = pubDateText ? timezone(parseDate(pubDateText),+8) : undefined;

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
