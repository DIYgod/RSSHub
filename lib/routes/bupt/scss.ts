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
            description: '信息类型，可选值：新闻动态，通知公告',
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
    
    let selector;
    if (type === 'xwdt') {
        selector = '.m-list3 li';
    } else {
        selector = '.Newslist li';
    }

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
                const detailResponse = await got({ url: item.link });
                const content = load(detailResponse.data);
                const newsContent = content('.v_news_content');

                // 修复1：直接获取纯文本
                item.description = newsContent.text().trim(); 

                // 修复2：健壮的日期解析
                const pubDateText = content('.info').text().trim();
                const cleanedPubDate = pubDateText.replace(/发布时间[:：]\s*/, '');
                const parsedDate = parseDate(cleanedPubDate);
                
                // 修复3：日期解析容错
                item.pubDate = isNaN(parsedDate) ? new Date() : timezone(parsedDate, +8);

                return item;
            })
        )
    );


    return {
        title: `北京邮电大学网络空间安全学院 - ${pageTitle}`,
        link: currentUrl,
        item: items,
    };
}
