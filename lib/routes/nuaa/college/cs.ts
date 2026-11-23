import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDateStrict } from '@/utils/time';

const host = 'https://cs.nuaa.edu.cn/';

const map = new Map([
    ['tzgg', { title: '通知公告 | 南京航空航天大学计算机科学与技术学院', suffix: 'tzgg/list.htm' }],
    ['rdxw', { title: '热点新闻 | 南京航空航天大学计算机科学与技术学院', suffix: '10846/list.htm' }],
    ['xkky', { title: '学科科研 | 南京航空航天大学计算机科学与技术学院', suffix: '10849/list.htm' }],
    ['be', { title: '本科生培养 | 南京航空航天大学计算机科学与技术学院', suffix: '10850/list.htm' }],
    ['me', { title: '研究生培养 | 南京航空航天大学计算机科学与技术学院', suffix: '10851/list.htm' }],
    ['jxdt', { title: '教学动态 | 南京航空航天大学计算机科学与技术学院', suffix: '1977/list.htm' }],
    ['xsgz', { title: '学生工作 | 南京航空航天大学计算机科学与技术学院', suffix: '1959/list.htm' }],
]);

export const route: Route = {
    path: '/cs/:type/:getDescription?',
    categories: ['university'],
    example: '/nuaa/cs/jxdt',
    parameters: { type: '分类名，见下表', getDescription: '是否获取全文' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '计算机科学与技术学院',
    maintainers: ['LogicJake', 'Seiry', 'qrzbing', 'Xm798'],
    handler,
    description: `| 通知公告 | 热点新闻 | 学科科研 | 教学动态 | 本科生培养 | 研究生培养 | 学生工作 |
| -------- | -------- | -------- | -------- | ---------- | ---------- | -------- |
| tzgg     | rdxw     | xkky     | jxdt     | be         | me         | xsgz     |`,
};

interface ArticleData {
    description?: string;
    publishedDate?: string;
    author?: string;
}

function parsePublicationDate(value?: string) {
    if (!value) {
        return;
    }
    // The calendar label has no offset; do not assign an unverified timezone.
    return parseDateStrict(value, 'YYYY-MM-DD');
}

async function handler(ctx) {
    const type = ctx.req.param('type');
    const getDescription = Boolean(ctx.req.param('getDescription'));
    const suffix = map.get(type)!.suffix;

    const link = new URL(suffix, host).href;
    const response = await got(link);
    const $ = load(response.data);

    const list = $('.page-con-list .page-con-item')
        .toArray()
        .map((element) => ({
            title: $(element).find('h2').text(),
            link: $(element).find('a').attr('href'),
            description: $(element).find('p').html() ?? undefined,
        }));

    const out = await pMap(
        list,
        async (info) => {
            const title = info.title || 'tzgg';
            let pubDate: Temporal.Instant | undefined;
            let author: string | undefined;
            const itemUrl = new URL(info.link!, host).href;
            let description = info.description;

            if (getDescription) {
                const detail = await cache.tryGet<ArticleData>('nuaa:cs:article:byline:' + itemUrl, async () => {
                    const arr = itemUrl.split('.');
                    const pageType = arr.at(-1);
                    if (pageType === 'htm' || pageType === 'html') {
                        const response = await got(itemUrl);
                        const $ = load(response.data);
                        const metadata = $('.infoA > span')
                            .toArray()
                            .map((element) => $(element).text());
                        const publication = metadata.find((text) => /^时间\s*[:：]/.test(text));
                        const byline = metadata.find((text) => /^作者\s*[:：]/.test(text));
                        return {
                            description: $('.wp_articlecontent').html() ?? undefined,
                            publishedDate: publication?.replace(/^时间\s*[:：]\s*/, ''),
                            author: byline?.replace(/^作者\s*[:：]\s*/, '') || undefined,
                        };
                    }
                    return { description: '' };
                });
                description = detail.description;
                author = detail.author;
                pubDate = parsePublicationDate(detail.publishedDate);
            }

            return {
                title,
                link: itemUrl,
                description,
                pubDate,
                author,
            };
        },
        { concurrency: 3 }
    );

    return {
        title: map.get(type)!.title,
        link,
        description: '南京航空航天大学计算机科学与技术学院RSS',
        item: out,
    };
}
