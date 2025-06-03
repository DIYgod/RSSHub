import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import type { Context } from 'hono';

export const route: Route = {
    path: '/scss/:type',
    categories: ['university'],
    example: '/bupt/scss/xwdt',
    parameters: {
        type: {
            type: 'string',
            optional: false,
            description: '信息类型，可选值：新闻动态(xwdt)，通知公告(tzgg)',
        },
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,  // 启用反爬虫保护
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
    const type = ctx.req.param('type') || 'tzgg'; // 默认类型为通知公告

    // 验证type参数有效性
    if (!['xwdt', 'tzgg'].includes(type)) {
        throw new Error(`Invalid type parameter: ${type}. Allowed values are 'xwdt' or 'tzgg'.`);
    }

    const rootUrl = 'https://scss.bupt.edu.cn';
    const typeConfig = {
        xwdt: {
            url: `${rootUrl}/index/xwdt.htm`,
            title: '新闻动态',
            selector: '.m-list3 li',
        },
        tzgg: {
            url: `${rootUrl}/index/tzgg1.htm`,
            title: '通知公告',
            selector: '.Newslist li',
        },
    };

    const { url: currentUrl, title: pageTitle, selector } = typeConfig[type];

    const response = await got({
        method: 'get',
        url: currentUrl,
        // 添加请求头防止被反爬
        headers: {
            Referer: rootUrl,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        },
    });

    const $ = load(response.data);

    const list = $(selector)
        .toArray()
        .filter((item) => {
            const $item = $(item);
            const $link = $item.find('a');
            return $link.length > 0 && $link.attr('href');
        })
        .map((item) => {
            const $item = $(item);
            const $link = $item.find('a');
            const href = $link.attr('href') || '';
            const link = new URL(href, rootUrl).href;

            // 尝试从列表项中提取日期
            const dateText = $item.find('span').text().trim();
            const listDate = dateText ? parseDate(dateText) : null;

            return {
                title: $link.text().trim(),
                link,
                pubDate: listDate,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const detailResponse = await got({
                        url: item.link,
                        headers: {
                            Referer: currentUrl,
                        },
                    });

                    const content = load(detailResponse.data);
                    const newsContent = content('.v_news_content');

                    // 优先使用详情页中的日期
                    const pubDateText = content('.info').text().trim();
                    const detailDate = pubDateText ? parseDate(pubDateText.replace(/发布时间[:：]\s*/, '')) : null;

                    // 如果详情页没有日期，使用列表中的日期
                    const pubDate = detailDate || item.pubDate || new Date();

                    return {
                        title: item.title,
                        link: item.link,
                        description: newsContent.html() || newsContent.text().trim(), // 保留HTML格式
                        pubDate: timezone(pubDate, +8),
                    };
                } catch (error) {
                    // 如果详情页请求失败，返回基本信息
                    return {
                        title: item.title,
                        link: item.link,
                        description: '获取内容失败，请直接访问原文链接',
                        pubDate: item.pubDate ? timezone(item.pubDate, +8) : new Date(),
                    };
                }
            })
        )
    );

    return {
        title: `北京邮电大学网络空间安全学院 - ${pageTitle}`,
        link: currentUrl,
        item: items as Data['item'],
    };
}
