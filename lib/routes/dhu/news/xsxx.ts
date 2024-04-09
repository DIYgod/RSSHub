import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://news.dhu.edu.cn/_wp3services/generalQuery?queryObj=articles&siteId=14&columnId=6410&pageIndex=1&rows=20';

export const route: Route = {
    path: '/news/xsxx',
    categories: ['university'],
    example: '/dhu/news/xsxx',
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
            source: ['news.dhu.edu.cn/6410'],
        },
    ],
    name: '学术信息',
    maintainers: ['fox2049'],
    handler,
    url: 'news.dhu.edu.cn/6410',
};

async function handler() {
    const { data } = await got(baseUrl, {
        headers: {
            Referer: 'https://news.dhu.edu.cn/6410/',
        },
    });
    // 从 API 响应中提取相关数据
    const list = data.data.map((item) => ({
        // 文章标题
        title: item.title,
        // 文章链接
        link: item.wapUrl,
        // 文章发布日期
        pubDate: parseDate(item.publishTime),
        // 文章作者
        author: item.publisher,
    }));

    // item content
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);
                item.description = $('.new_zwCot').first().html();
                return item;
            })
        )
    );

    return {
        title: '学术信息',
        link: 'https://news.dhu.edu.cn/6410',
        item: items,
    };
}
