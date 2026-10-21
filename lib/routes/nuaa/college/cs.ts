import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import getCookie from '../utils/pypasswaf';

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
        requirePuppeteer: true,
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

interface ArticleSummary {
    title?: string;
    link?: string;
    description?: string;
    date?: string;
}

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
    const date = parseDate(value, 'YYYY-MM-DD', true);
    return Number.isNaN(date.getTime()) ? undefined : date;
}

async function handler(ctx) {
    const type = ctx.req.param('type');
    const getDescription = Boolean(ctx.req.param('getDescription'));
    const suffix = map.get(type)!.suffix;

    const link = new URL(suffix, host).href;
    const cookie = await getCookie(host);
    const gotConfig = {
        headers: {
            cookie,
        },
    };
    const response = await got(link, gotConfig);
    const $ = load(response.data);

    const perCount = Number.parseInt($('.per_count', '#wp_paging_w6').text());
    const allCount = Number.parseInt($('.all_count', '#wp_paging_w6').slice(1).text());
    const modernList = $('.page-con-list .page-con-item');
    const isModernLayout = modernList.length > 0;
    const list: ArticleSummary[] = isModernLayout
        ? modernList.toArray().map((element) => ({
              title: $(element).find('h2').text(),
              link: $(element).find('a').attr('href'),
              description: $(element).find('p').html() ?? undefined,
              date: undefined,
          }))
        : $('#news_list ul li')
              .slice(0, Math.min(perCount, allCount))
              .toArray()
              .map((element) => ({
                  title: $(element).find('a').attr('title'),
                  link: $(element).find('a').attr('href'),
                  date: $(element).find('span').text(),
                  description: undefined,
              }));

    const out = await pMap(
        list,
        async (info) => {
            const title = info.title || 'tzgg';
            const date = info.date;
            let pubDate = date ? parseDate(date) : undefined;
            let author: string | undefined;
            const itemUrl = new URL(info.link!, host).href;
            let description = isModernLayout ? info.description : title + '<br><a href="' + itemUrl + '" target="_blank">查看原文</a>';

            if (getDescription) {
                const detail = await cache.tryGet<ArticleData>('nuaa:cs:article:byline:' + itemUrl, async () => {
                    const arr = itemUrl.split('.');
                    const pageType = arr.at(-1);
                    if (pageType === 'htm' || pageType === 'html') {
                        const response = await got(itemUrl, gotConfig);
                        const $ = load(response.data);
                        const metadata = $('.infoA > span')
                            .toArray()
                            .map((element) => $(element).text());
                        const publication = metadata.find((text) => /^时间\s*[:：]/.test(text));
                        const byline = metadata.find((text) => /^作者\s*[:：]/.test(text));
                        return {
                            description: $('.wp_articlecontent').html() ?? undefined,
                            publishedDate: publication?.replace(/^时间\s*[:：]\s*/, '').trim(),
                            author: byline?.replace(/^作者\s*[:：]\s*/, '').trim() || undefined,
                        };
                    }
                    return { description: '' };
                });
                description = detail.description;
                author = detail.author;
                pubDate = parsePublicationDate(detail.publishedDate) ?? pubDate;
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
