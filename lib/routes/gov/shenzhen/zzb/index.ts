import { load } from 'cheerio';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import got from '@/utils/got';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { isValidHost } from '@/utils/valid-host';

const rootURL = 'http://www.zzb.sz.gov.cn/';
const currentCategories = {
    tzgg: { id: 29672, path: 'notice/announcement' },
    rqgs: { id: 17361, path: 'notice/appointment' },
    zcfg: { id: 17371, path: 'service/policy' },
    bgxz: { id: 17370, path: 'service/file' },
};

export const route: Route = {
    path: '/zzb/:caty/:page?',
    categories: ['government'],
    example: '/gov/shenzhen/zzb/tzgg',
    parameters: { caty: '信息类别', page: '历史兼容参数，所有值均返回第 1 页，不翻页' },
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
            source: ['www.zzb.sz.gov.cn/notice/announcement', 'www.zzb.sz.gov.cn/notice/announcement/index.html'],
            target: '/zzb/tzgg',
        },
        {
            source: ['www.zzb.sz.gov.cn/notice/appointment', 'www.zzb.sz.gov.cn/notice/appointment/index.html'],
            target: '/zzb/rqgs',
        },
        {
            source: ['www.zzb.sz.gov.cn/service/policy', 'www.zzb.sz.gov.cn/service/policy/index.html'],
            target: '/zzb/zcfg',
        },
        {
            source: ['www.zzb.sz.gov.cn/service/file', 'www.zzb.sz.gov.cn/service/file/index.html'],
            target: '/zzb/bgxz',
        },
    ],
    name: '市委组织部',
    maintainers: ['zlasd'],
    handler,
    url: 'zzb.sz.gov.cn/*',
    description: `| 通知公告 | 任前公示 | 政策法规 | 工作动态 | 部门预算决算公开 | 业务表格下载 |
| :------: | :------: | :------: | :------: | :--------------: | :----------: |
|   tzgg   |   rqgs   |   zcfg   |   gzdt   |       xcbd       |     bgxz     |`,
};

async function handler(ctx) {
    const categoryID = ctx.req.param('caty');
    if (!isValidHost(categoryID)) {
        throw new InvalidParameterError('Invalid caty');
    }

    const currentCategory = currentCategories[categoryID];
    if (currentCategory) {
        const data = await ofetch<{
            category: { name: string; post_per_page: number };
            articles: Array<{ title: string; url: string; abstract: string; author: string; visible_publish_time?: number; date?: string }>;
        }>(new URL(`/postmeta/i/${currentCategory.id}.json`, rootURL).href);
        return {
            title: `深圳组工在线 - ${data.category.name}`,
            link: new URL(`/${currentCategory.path}/index.html?pub_point=${currentCategory.path}`, rootURL).href,
            item: data.articles.slice(0, data.category.post_per_page).map((item) => {
                const pubDate = item.visible_publish_time ? parseDate(item.visible_publish_time, 'X') : item.date ? timezone(parseDate(item.date, 'YYYY-MM-DD', true), 8) : undefined;
                return {
                    title: item.title,
                    link: new URL(item.url, rootURL).href,
                    description: item.abstract && item.abstract !== item.title ? item.abstract : undefined,
                    author: item.author || undefined,
                    category: data.category.name,
                    pubDate: pubDate && Number.isFinite(pubDate.getTime()) ? pubDate : undefined,
                };
            }),
        };
    }

    const pagePath = `/${categoryID}/index.html`;

    const currentURL = new URL(pagePath, rootURL); // do not use deprecated 'url.resolve'
    const response = await got({ method: 'get', url: currentURL });

    const $ = load(response.data);
    const title = $('#Title').text().trim();
    const list = $('#List tbody tr td table tbody tr td[width="96%"]')
        .toArray()
        .map((item) => {
            const tag = $(item).find('font a');
            const tag2 = $(item).find('font[size="2px"]');
            return {
                title: tag.text(),
                link: tag.attr('href'),
                pubDate: timezone(parseDate(tag2.text().trim(), 'YYYY/MM/DD'), 0),
            };
        });

    return {
        title: '深圳组工在线 - ' + title,
        link: currentURL.href,
        item: list,
    };
}
