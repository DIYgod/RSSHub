import { load } from 'cheerio';

import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const API_BASE = 'https://www.hebpta.com.cn:8090';

const DEFAULT_HEADERS = {
    Origin: 'https://www.hebpta.com.cn',
    Referer: 'https://www.hebpta.com.cn/',
    'User-Agent': config.trueUA,
};

const detailUrl = (sectionId: string, id: number | string) => `https://www.hebpta.com.cn/article?artId=${id}&id=${sectionId}`;

const getSectionArticles = async (sectionId: string): Promise<Array<{ id: number; title: string; publishedDate?: string; jumpLink?: string; jumpType?: string }>> => {
    const response = await got(`${API_BASE}/door/homeArticleList`, {
        params: {
            pageNum: 1,
            pageSize: 10,
            belongSectionId: sectionId,
        },
        headers: DEFAULT_HEADERS,
    });

    return (response.data?.data?.records ?? []) as Array<{ id: number; title: string; publishedDate?: string; jumpLink?: string; jumpType?: string }>;
};

export const route: Route = {
    path: '/section/:sectionId',
    categories: ['government'],
    example: '/hebpta/section/293',
    parameters: {
        sectionId: {
            description: '栏目 ID',
        },
    },
    name: '栏目',
    description: '栏目 ID 通过接口参数传入，列表来自 /door/homeArticleList。',
    maintainers: ['nczitzk'],
    url: 'www.hebpta.com.cn',
    radar: [
        {
            source: ['www.hebpta.com.cn/hebpta/#/notice?id=:sectionId'],
            target: '/section/:sectionId',
        },
    ],
    handler: async (ctx) => {
        const sectionId = ctx.req.param('sectionId');
        if (!sectionId) {
            throw new Error('Missing section ID.');
        }
        const candidates = await getSectionArticles(sectionId);

        if (!candidates.length) {
            throw new Error(`No articles found for section ${sectionId}. The API returned an empty list.`);
        }

        const items = await Promise.all(
            candidates.map((item) =>
                cache.tryGet(`hebpta:section:${sectionId}:article:${item.id}`, async () => {
                    if (item.jumpType === '2') {
                        return {
                            title: item.title,
                            link: item.jumpLink,
                            pubDate: item.publishedDate ? parseDate(item.publishedDate) : undefined,
                        };
                    }

                    const detailResponse = await got(`${API_BASE}/door/article`, {
                        params: { id: item.id },
                        headers: DEFAULT_HEADERS,
                    });

                    const detail = detailResponse.data?.data as {
                        id: number;
                        title: string;
                        publishedDate?: string;
                        articleContent?: string;
                        sectionName?: string;
                        jumpLink?: string;
                    };

                    const content = detail.articleContent || '';
                    let description: string | undefined;
                    if (content) {
                        const $ = load(content);
                        $('[style]').removeAttr('style');
                        $('font').each((_, element) => {
                            $(element).replaceWith($(element).html() || '');
                        });
                        description = $.html();
                    }
                    const publishedDate = detail.publishedDate ?? item.publishedDate;

                    return {
                        title: detail.title || item.title,
                        link: detailUrl(sectionId, detail.id),
                        pubDate: publishedDate ? parseDate(publishedDate) : undefined,
                        description,
                        category: detail.sectionName ? [detail.sectionName] : undefined,
                    };
                })
            )
        );

        const categoryName = items.find((item) => item.category && item.category.length > 0)?.category?.[0];
        const feedTitle = categoryName ? `河北省人事考试网 - ${categoryName}` : `河北省人事考试网 - 栏目 ${sectionId}`;

        return {
            title: feedTitle,
            link: `https://www.hebpta.com.cn/notice?id=${sectionId}`,
            item: items,
        };
    },
};
