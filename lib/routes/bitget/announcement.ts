import { load } from 'cheerio';

import { config } from '@/config';
import type { DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

import type { BitgetResponse } from './type';

interface AnnouncementRequestBody {
    pageSize: number;
    openUnread: number;
    businessType: number;
    isPre: boolean;
}

const handler: Route['handler'] = async (ctx) => {
    const baseUrl = 'https://www.bitget.com';
    const announcementApiUrl = `${baseUrl}/v1/msg/public/station/pageList`;
    const { type, lang = 'zh-CN' } = ctx.req.param<'/bitget/announcement/:type/:lang?'>();
    const languageCode = lang.replace('-', '_');
    const headers = {
        Referer: baseUrl,
        accept: 'application/json, text/plain, */*',
        'content-type': 'application/json;charset=UTF-8',
        language: languageCode,
        locale: languageCode,
    };
    const pageSize = getRouteLimit(ctx, 10);
    const businessTypes = {
        all: [70, 20, 50],
        'new-listing': [50],
        'latest-activities': [20],
        'new-announcement': [70],
    }[type];
    if (!businessTypes) {
        throw new Error('Invalid type');
    }

    const responses = await Promise.all(
        businessTypes.map((businessType) =>
            cache.tryGet(
                `bitget:announcement:public:${businessType}:${pageSize}:${lang}`,
                async () => {
                    const reqBody: AnnouncementRequestBody = {
                        pageSize,
                        openUnread: 0,
                        businessType,
                        isPre: false,
                    };
                    const result = await ofetch<BitgetResponse>(announcementApiUrl, {
                        method: 'POST',
                        body: reqBody,
                        headers,
                    });
                    if (result?.code !== '200') {
                        throw new Error('Failed to fetch announcements, error code: ' + result?.code);
                    }
                    return result;
                },
                config.cache.routeExpire,
                false
            )
        )
    );
    const response = responses[0];

    if (!response) {
        throw new Error('Failed to fetch announcements');
    }
    const items = responses
        .flatMap((response) => response!.data.items)
        .toSorted((a, b) => Number(b.sendTime || 0) - Number(a.sendTime || 0))
        .slice(0, pageSize);
    const data = await Promise.all(
        items.map((item) =>
            cache.tryGet(`bitget:announcement:public:${item.id}:${lang}`, async () => {
                const date = parseDate(Number(item.sendTime));
                const dataItem: DataItem = {
                    title: item.title ?? '',
                    link: item.openUrl,
                    guid: item.id,
                    pubDate: item.sendTime ? date : undefined,
                    description: item.content ?? '',
                    image: item.imgUrl,
                };

                if (item.openUrl && (item.businessType === 20 || item.businessType === 70)) {
                    try {
                        const itemResponse = await ofetch<string>(item.openUrl ?? '', {
                            headers,
                        });
                        const $ = load(itemResponse);
                        const queryState = $('script')
                            .toArray()
                            .map(
                                (element) =>
                                    $(element)
                                        .text()
                                        .match(/window\.__ZEUS_REACT_QUERY_STATE__\s*=\s*(\{.+\})/s)?.[1]
                            )
                            .find(Boolean);
                        if (queryState) {
                            const article = JSON.parse(queryState).queries.find((query) => query.queryKey[0] === 'articles')?.state.data?.articleDetails;
                            dataItem.description = article?.content || item.content || '';
                        } else {
                            const nextData = $('script#__NEXT_DATA__').text();
                            if (nextData) {
                                const pageProps = JSON.parse(nextData).props.pageProps;
                                dataItem.description = pageProps.details?.content || pageProps.pageInitInfo?.ruleContent || item.content || '';
                            }
                        }
                    } catch (error: any) {
                        if (error.name && ['HTTPError', 'RequestError', 'FetchError'].includes(error.name)) {
                            dataItem.description = item.content ?? '';
                        } else {
                            throw error;
                        }
                    }
                }
                return dataItem;
            })
        )
    );

    return {
        title: `Bitget | ${findTypeLabel(type)}`,
        link: `https://www.bitget.com/${lang}/promotion/inmail`,
        item: data,
    };
};

const findTypeLabel = (type: string) => {
    const typeMap = {
        all: 'All',
        'new-listing': 'New Listing',
        'latest-activities': 'Latest Activities',
        'new-announcement': 'New Announcement',
    };
    return typeMap[type];
};

export const route: Route = {
    path: '/announcement/:type/:lang?',
    categories: ['finance'],
    view: ViewType.Articles,
    example: '/bitget/announcement/all/zh-CN',
    parameters: {
        type: {
            description: 'Bitget 通知类型',
            default: 'all',
            options: [
                { value: 'all', label: '全部通知' },
                { value: 'new-listing', label: '新币上线' },
                { value: 'latest-activities', label: '最新活动' },
                { value: 'new-announcement', label: '最新公告' },
            ],
        },
        lang: {
            description: '语言',
            default: 'zh-CN',
            options: [
                { value: 'zh-CN', label: '中文' },
                { value: 'en-US', label: 'English' },
                { value: 'es-ES', label: 'Español' },
                { value: 'fr-FR', label: 'Français' },
                { value: 'de-DE', label: 'Deutsch' },
                { value: 'ja-JP', label: '日本語' },
                { value: 'ru-RU', label: 'Русский' },
                { value: 'ar-SA', label: 'العربية' },
            ],
        },
    },
    radar: [
        {
            source: ['www.bitget.com/:lang/promotion/inmail', 'www.bitget.com/:lang/inmail'],
            target: '/announcement/all/:lang',
        },
    ],
    name: 'Announcement',
    description: `type:

| Type              | Description |
| ----------------- | ----------- |
| all               | 全部通知    |
| new-listing       | 新币上线    |
| latest-activities | 最新活动    |
| new-announcement  | 最新公告    |

lang:

| Lang  | Description |
| ----- | ----------- |
| zh-CN | 中文        |
| en-US | English     |
| es-ES | Español     |
| fr-FR | Français    |
| de-DE | Deutsch     |
| ja-JP | 日本語      |
| ru-RU | Русский     |
| ar-SA | العربية     |`,
    maintainers: ['YukiCoco'],
    handler,
};
