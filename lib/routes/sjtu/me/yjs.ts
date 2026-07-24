import { load } from 'cheerio';

import { config } from '@/config';
import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseUrl = 'https://me.sjtu.edu.cn';
const request = got.extend({
    headers: {
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        referer: `${baseUrl}/YanJS/`,
        'user-agent': config.trueUA,
    },
});

const typeMap: Record<string, { name: string; path: string }> = {
    indexnotice: { name: '首页通知公告', path: '/YanJS/indexnotice.html' },
    notice: { name: '博士研究生通知公告', path: '/YanJS/notice.html' },
    masternotice: { name: '硕士研究生通知公告', path: '/YanJS/masternotice.html' },
    indexnews: { name: '教学动态', path: '/YanJS/indexnews.html' },
    teacheraffairs: { name: '教师事务', path: '/YanJS/teacheraffairs.html' },
    studentaffairs: { name: '学生事务', path: '/YanJS/studentaffairs.html' },
    commqu: { name: '常见问题', path: '/YanJS/commqu.html' },
};

const toAbsoluteUrl = (url: string | undefined, currentUrl: string) => (url ? new URL(url, currentUrl).href : '');

const parsePubDate = (date: string | undefined) => {
    const match = date?.match(/\d{4}-\d{2}-\d{2}/);
    return match ? timezone(parseDate(match[0], 'YYYY-MM-DD'), +8) : undefined;
};

type ArticleItem = DataItem & { link: string };

function fetchArticle(item: ArticleItem): Promise<DataItem> {
    return cache.tryGet(item.link, async () => {
        const response = await request(item.link);
        const $ = load(response.data);
        const content = $('.d2 .snr').length ? $('.d2 .snr') : $('.news-cont .txt');

        content.find('img').each((_, element) => {
            const src = $(element).attr('src');
            if (src) {
                $(element).attr('src', toAbsoluteUrl(src, item.link));
            }
        });

        content.find('a').each((_, element) => {
            const href = $(element).attr('href');
            if (href) {
                $(element).attr('href', toAbsoluteUrl(href, item.link));
            }
        });

        return {
            title: $('.d2 .sbt').text().trim() || $('.news-cont .tit').text().trim() || item.title,
            link: item.link,
            pubDate: parsePubDate($('.d2 .ssj').text() || $('.news-cont').text()) ?? item.pubDate,
            description: content.html() ?? '',
        };
    });
}

export const route: Route = {
    path: '/me/yjs/:type?',
    categories: ['university'],
    example: '/sjtu/me/yjs',
    parameters: { type: '通知类别，默认为 indexnotice' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: Object.entries(typeMap).map(([type, { path }]) => ({
        source: [`me.sjtu.edu.cn${path}`],
        target: `/me/yjs/${type}`,
    })),
    name: '机械与动力工程学院研究生教学网',
    maintainers: ['yyh'],
    handler,
    url: 'me.sjtu.edu.cn/YanJS/indexnotice.html',
    description: `| 首页通知公告 | 博士研究生通知公告 | 硕士研究生通知公告 | 教学动态  | 教师事务       | 学生事务       | 常见问题 |
| ------------ | ------------------ | ------------------ | --------- | -------------- | -------------- | -------- |
| indexnotice  | notice             | masternotice       | indexnews | teacheraffairs | studentaffairs | commqu   |`,
};

async function handler(ctx): Promise<Data> {
    const type = ctx.req.param('type') ?? 'indexnotice';
    const config = typeMap[type];

    if (!config) {
        throw new Error(`Unknown type: ${type}. Valid types: ${Object.keys(typeMap).join(', ')}`);
    }

    const listUrl = new URL(config.path, baseUrl).href;
    const response = await request(listUrl);
    const $ = load(response.data);

    const items = $('.d2 ul.n2 li')
        .toArray()
        .map((element) => {
            const item = $(element);
            const anchor = item.find('a');
            const link = toAbsoluteUrl(anchor.attr('href'), listUrl);
            const title = anchor
                .text()
                .replace(/^·\s*/, '')
                .trim();
            const pubDate = parsePubDate(item.find('.sj').text());

            return {
                title,
                link,
                pubDate,
            };
        })
        .filter((item) => item.title && item.link);

    const dataItems = await Promise.all(
        items.map(async (item) => {
            try {
                return await fetchArticle(item);
            } catch {
                return {
                    title: item.title,
                    link: item.link,
                    pubDate: item.pubDate,
                };
            }
        })
    );

    return {
        title: `上海交通大学机械与动力工程学院研究生教学网 - ${config.name}`,
        link: listUrl,
        description: `上海交通大学机械与动力工程学院研究生教学网 - ${config.name}`,
        language: 'zh-CN',
        item: dataItems,
    };
}
