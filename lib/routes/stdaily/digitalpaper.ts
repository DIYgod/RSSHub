import type { Data, DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import type { ArticleDetailResponse, ArticleListResponse, DateListResponse, SectionListResponse } from './types';
import { art } from '@/utils/render';
import path from 'node:path';
import timezone from '@/utils/timezone';
import dayjs from 'dayjs';
import { load } from 'cheerio';

const SITE_ID = '811c18b08cf04e79be3b67d6902ee1a7';
const CODE = 'KJRB';
const API_HOST = 'https://epaper.stdaily.com/stdailynewspaperapi';

export const route: Route = {
    path: '/digitalpaper',
    categories: ['traditional-media'],
    example: '/stdaily/digitalpaper',
    name: '科技日报',
    maintainers: ['lyqluis', 'KarasuShin'],
    handler,
    features: {
        supportRadar: true,
    },
    radar: [
        {
            source: ['epaper.stdaily.com/statics/technology-site/index.html'],
            target: '/digitalpaper',
        },
    ],
};

async function handler() {
    const dateListResponse = await ofetch<DateListResponse>(`${API_HOST}/uv/article/period/date`, {
        method: 'POST',
        body: {
            code: CODE,
            date: dayjs(new Date(), 'YYYY-MM-01'),
        },
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
    });

    const lastDate = dateListResponse.obj.dateList.toSorted().at(-1);

    const sectionListResponse = await ofetch<SectionListResponse>(`${API_HOST}/uv/article/period/periodTime`, {
        method: 'POST',
        body: {
            code: CODE,
            periodTime: lastDate,
            siteId: SITE_ID,
        },
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
    });

    const items = await Promise.all(
        sectionListResponse.obj.editionList.map((section) =>
            cache.tryGet(`stdaily:epaper:${section.id}`, async () => {
                const { list } = await ofetch<ArticleListResponse>(`${API_HOST}/uv/article/article/editionId`, {
                    method: 'POST',
                    body: {
                        id: section.id,
                        siteId: SITE_ID,
                    },
                    headers: { 'X-Requested-With': 'XMLHttpRequest' },
                });

                return await Promise.all(
                    list.map(
                        async (article) =>
                            await cache.tryGet(`stddaily:epaper:article:${article.id}`, async () => {
                                const {
                                    obj: { articleVo },
                                } = await ofetch<ArticleDetailResponse>(`${API_HOST}/uv/article/article/articleId`, {
                                    method: 'POST',
                                    body: {
                                        code: CODE,
                                        id: article.id,
                                        siteId: SITE_ID,
                                    },
                                    headers: { 'X-Requested-With': 'XMLHttpRequest' },
                                });

                                return {
                                    title: `${articleVo.editionName.match(/：(.*)/)?.[1]} - ${load(articleVo.title).text()}`,
                                    description: art(path.join(__dirname, 'templates/description.art'), {
                                        subtitle: articleVo.subtitle,
                                        pics: articleVo.picList ?? [],
                                        content: articleVo.content,
                                    }),
                                    pubDate: timezone(parseDate(articleVo.periodTime), +8),
                                    author: articleVo.author,
                                    link: `https://epaper.stdaily.com/statics/technology-site/index.html#/home?isDetail=1&currentNewsId=${article.id}&currentVersionName=${articleVo.editionName}&currentVersion=${Number(section.editionCode)}&timeValue=${articleVo.periodTime}`,
                                } as DataItem;
                            })
                    )
                );
            })
        )
    );

    return {
        title: '中国科技网 - 科技日报',
        link: 'https://epaper.stdaily.com',
        item: items.flat(),
        image: 'https://www.stdaily.com/favicon.ico',
    } as Data;
}
