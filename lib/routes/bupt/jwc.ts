import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/jwc/:type',
    categories: ['university'],
    example: '/bupt/jwc/tzgg',
    parameters: {
        type: {
            type: 'string',
            optional: false,
            description: '信息类型，可选值：tzgg（通知公告），xwzx（新闻资讯）',
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
            source: ['jwc.bupt.edu.cn/tzgg1.htm'],
            target: '/jwc/tzgg',
        },
        {
            source: ['jwc.bupt.edu.cn/xwzx2.htm'],
            target: '/jwc/xwzx',
        },
    ],
    name: '教务处',
    maintainers: ['Yoruet'],
    handler,
    url: 'jwc.bupt.edu.cn',
};

async function handler(ctx: Context) {
    let type = ctx.req.param('type'); // 默认类型为通知公告
    if (!type) {
        type = 'tzgg';
    }
    const rootUrl = 'https://jwc.bupt.edu.cn';
    let currentUrl;
    let pageTitle;

    if (type === 'tzgg') {
        currentUrl = `${rootUrl}/tzgg1.htm`;
        pageTitle = '通知公告';
    } else if (type === 'xwzx') {
        currentUrl = `${rootUrl}/xwzx2.htm`;
        pageTitle = '新闻资讯';
    } else {
        throw new Error('Invalid type parameter');
    }

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const list = $('.txt-elise')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const $link = $item.find('a');
            // Skip elements without links or with empty href
            if ($link.length === 0 || !$link.attr('href')) {
                return null;
            }
            return {
                title: $link.text().trim(),
                link: rootUrl + '/' + $link.attr('href'),
            };
        })
        .filter(Boolean);

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                // 选择包含新闻内容的元素
                const newsContent = content('.v_news_content');

                // 移除不必要的标签，比如 <p> 和 <span> 中无用的内容
                newsContent.find('p, span, strong').each(function () {
                    const element = content(this);
                    const text = element.text().trim();

                    // 删除没有有用文本的元素，防止空元素被保留
                    if (text === '') {
                        element.remove();
                    } else {
                        // 去除多余的嵌套标签，但保留其内容
                        element.replaceWith(text);
                    }
                });

                // 清理后的内容转换为文本
                const cleanedDescription = newsContent.text().trim();

                // 提取并格式化发布时间
                item.description = cleanedDescription;
                item.pubDate = timezone(parseDate(content('.info').text().replace('发布时间：', '').trim()), +8);

                return item;
            })
        )
    );

    return {
        title: `北京邮电大学教务处 - ${pageTitle}`,
        link: currentUrl,
        item: items,
    };
}
