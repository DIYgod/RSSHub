import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/time';

const MAP = {
    notice: 'tzgg',
    scholar: 'xsdt',
};

const HEAD = {
    notice: '通知公告',
    scholar: '学术动态',
};

class ArticleBodyUnavailableError extends Error {}

function getCareerApi(link: string) {
    const url = new URL(link);
    const match = url.pathname.match(/^\/career\/news\/view\/([\w-]+)\/(\d+)$/);
    return url.origin === 'https://career.upc.edu.cn' && match ? `${url.origin}/career/news/data/${match[1]}/${match[2]}` : undefined;
}

async function getCareerContent(apiUrl: string): Promise<Pick<DataItem, 'description'>> {
    const { data } = await got.post(apiUrl, { form: {} });
    return { description: data.data.newsContent };
}
export const route: Route = {
    path: '/main/:type',
    categories: ['university'],
    example: '/upc/main/notice',
    parameters: { type: '分类，见下表' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '主页',
    maintainers: ['Veagau'],
    handler,
    description: `| 通知公告 | 学术动态 |
| -------- | -------- |
| notice   | scholar  |`,
};
async function handler(ctx) {
    const baseUrl = 'https://news.upc.edu.cn';
    const type = ctx.req.param('type');
    const link = `${baseUrl}/${MAP[type]}.htm`;
    const response = await got({
        method: 'get',
        url: link,
    });
    const $ = load(response.data);

    const list = $('.main-list-box-left li')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const a = $item.find('.li-right-bt a');
            const link = a.attr('href');
            return {
                title: a.text(),
                description: $item.find('.li-right-zy a').text(),
                link: link!.startsWith('http') ? link! : `${baseUrl}/${link}`,
                pubDate: parseDate($item.find('.li-left').text(), 'DDYYYY-MM', 8),
            };
        });

    const out = await pMap(
        list,
        async (item) => {
            const careerApi = getCareerApi(item.link);
            try {
                const details = await cache.tryGet<Pick<DataItem, 'description' | 'pubDate' | 'author'>>(`upc:main:public-detail:v1:${item.link}`, async () => {
                    if (careerApi) {
                        return getCareerContent(careerApi);
                    }
                    const details: Pick<DataItem, 'description' | 'pubDate' | 'author'> = {};
                    if (!item.link.startsWith(`${baseUrl}/`) || item.link.includes('content.jsp')) {
                        throw new ArticleBodyUnavailableError('The source article is outside the supported public news sources.');
                    }

                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });
                    const $ = load(detailResponse.data);
                    const detailContent = $('.v_news_content').html();

                    // author,
                    details.description = detailContent;
                    details.pubDate = parseDate($('.nr-xinxi i').first().text(), 'YYYY-MM-DD HH:mm:ss', 8);

                    return details;
                });
                return { ...item, ...details, pubDate: details.pubDate ?? item.pubDate };
            } catch (error) {
                if (error instanceof ArticleBodyUnavailableError || (careerApi && error instanceof Error && error.name === 'FetchError')) {
                    return item;
                }
                throw error;
            }
        },
        { concurrency: 3 }
    );
    return {
        title: HEAD[type] + '-中国石油大学（华东）',
        link,
        description: HEAD[type] + '-中国石油大学（华东）',
        item: out,
    };
}
