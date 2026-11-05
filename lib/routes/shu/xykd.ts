import { load } from 'cheerio';
import pMap from 'p-map'; // cheerio@1.0.0

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const noticeType = {
    whxx: { title: '上海大学 - 文化信息', url: 'https://www.shu.edu.cn/xnrc/whxx.htm' },
    xsbg: { title: '上海大学 - 学术报告', url: 'https://www.shu.edu.cn/xnrc/xsbg.htm' },
};

export const route: Route = {
    path: '/xykd/:type?',
    categories: ['university'],
    example: '/shu/xykd/xsbg',
    parameters: { type: '分类，默认为学术报告' },
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
            source: ['www.shu.edu.cn/'],
            target: '/xykd',
        },
    ],
    name: '校园看点',
    maintainers: ['GhhG123'],
    handler,
    url: 'www.shu.edu.cn/',
    description: `| 文化信息 | 学术报告 |
| -------- | -------- |
| whxx     | xsbg     |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') ?? 'xsbg';
    const rootUrl = 'https://www.shu.edu.cn';

    // 发起 HTTP GET 请求
    const response = await got({
        method: 'get',

        /* headers: {
            'user-agent': UA,
            cookie: await getCookie(ctx),
        }, */
        url: noticeType[type].url,
    });

    const $ = load(response.data);

    const list = $('div.xsbg_list ul li') // 定位到HTML结构中的li元素
        .toArray()
        .map((el): DataItem & { link: string } => {
            const item = $(el); // 使用Cheerio包装每个li元素
            const rawLink = item.find('a').attr('href');

            return {
                title: item.find('p.bt').text(),
                link: rawLink ? new URL(rawLink, rootUrl).href : rootUrl, // 生成完整链接
                description: item.find('div.zy').text().trim(), // 提取简要描述
            };
        });

    const items = await pMap(
        list,
        async (item) => {
            const details = await cache.tryGet(`shu:xykd:v2:${item.link}`, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                }); // 获取详情页内容
                const content = load(detailResponse.data); // 使用cheerio解析内容

                const published = content('.sj').text();
                item.pubDate = published ? timezone(parseDate(published, 'YYYY.MM.DD'), 8) : undefined;
                item.description = content('#vsb_content_500 .v_news_content').html() || item.description; // 提取内容区详情

                return { description: item.description, pubDate: item.pubDate }; // 返回完整的item
            });
            return { ...item, ...details };
        },
        { concurrency: 3 }
    );

    return {
        title: noticeType[type].title,
        description: noticeType[type].title,
        link: noticeType[type].url,
        image: 'https://www.shu.edu.cn/__local/0/08/C6/1EABE492B0CF228A5564D6E6ABE_779D1EE3_5BF7.png',
        item: items,
    };
}
