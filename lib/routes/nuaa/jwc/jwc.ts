import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import getCookie from '../utils/pypasswaf';

const host = 'https://aao.nuaa.edu.cn/';

const map = new Map([
    ['tzgg', { title: '通知公告 | 南京航空航天大学教务处', suffix: '8222/list.htm' }],
    ['jxfw', { title: '教学服务 | 南京航空航天大学教务处', suffix: '8230/list.htm' }],
    ['xspy', { title: '学生培养 | 南京航空航天大学教务处', suffix: '8231/list.htm' }],
    ['jxjs', { title: '教学建设 | 南京航空航天大学教务处', suffix: '8232/list.htm' }],
    ['jxzy', { title: '教学资源 | 南京航空航天大学教务处', suffix: '8233/list.htm' }],
]);

export const route: Route = {
    path: '/jwc/:type/:getDescription?',
    categories: ['university'],
    example: '/nuaa/jwc/tzgg/getDescription',
    parameters: { type: '分类名，见下表', getDescription: '是否获取全文' },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '教务处',
    maintainers: ['arcosx', 'Seiry', 'qrzbing', 'Xm798'],
    handler,
    description: `| 通知公告 | 教学服务 | 教学建设 | 学生培养 | 教学资源 |
| -------- | -------- | -------- | -------- | -------- |
| tzgg     | jxfw     | jxjs     | xspy     | jxzy     |`,
};

class ArticlePermissionError extends Error {}

interface ArticleDetails {
    description?: string;
    author?: string;
}

async function handler(ctx) {
    const type = ctx.req.param('type');
    const suffix = map.get(type)!.suffix;
    const getDescription = Boolean(ctx.req.param('getDescription'));

    const link = new URL(suffix, host).href;
    const cookie = await getCookie(host);
    const gotConfig = {
        headers: {
            cookie,
        },
    };
    const response = await got(link, gotConfig);
    const $ = load(response.data);

    const list = $('#news_list .news_ul .p-list-item a')
        .slice(0, 10)
        .toArray()
        .map((element) => {
            const info = {
                title: $(element).find('.text .title').text(),
                link: $(element).attr('href'),
                date: $(element).find('.date em').text() + '-' + $(element).find('.date span').text(),
            };
            return info;
        });

    const out = await pMap(
        list,
        async (info) => {
            const title = info.title || 'tzgg';
            const date = info.date;
            const itemUrl = new URL(info.link!, host).href;
            let detail: ArticleDetails = {};

            if (getDescription) {
                try {
                    detail = await cache.tryGet<ArticleDetails>(`nuaa:jwc:article:byline:${itemUrl}`, async () => {
                        const arr = itemUrl.split('.');
                        const pageType = arr.at(-1);
                        if (pageType === 'htm' || pageType === 'html') {
                            const response = await got(itemUrl, gotConfig);
                            const $ = load(response.data);
                            const content = $('.wp_articlecontent');
                            if (!content.length) {
                                if ($('.wp_error_msg').text().includes('该信息仅允许校内地址访问')) {
                                    throw new ArticlePermissionError('Article content is restricted to campus IP addresses: ' + itemUrl);
                                }
                                throw new Error('Article content was not found at ' + itemUrl);
                            }
                            const authorLabel = $('.infoA > span, .info > span')
                                .toArray()
                                .map((element) => $(element).text())
                                .find((text) => /^作者\s*[:：]/.test(text));
                            return {
                                description: content.html() ?? undefined,
                                author: authorLabel?.replace(/^作者\s*[:：]\s*/, '').trim() || undefined,
                            };
                        }
                        return {};
                    });
                } catch (error) {
                    if (!(error instanceof ArticlePermissionError)) {
                        throw error;
                    }
                    detail = {};
                }
            }

            return {
                title,
                link: itemUrl,
                description: detail.description,
                author: detail.author,
                pubDate: parseDate(date),
            };
        },
        { concurrency: 3 }
    );

    return {
        title: map.get(type)!.title,
        link,
        description: '南京航空航天大学教务处RSS',
        item: out,
    };
}
