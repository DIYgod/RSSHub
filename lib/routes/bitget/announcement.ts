import { load } from 'cheerio';

import { config } from '@/config';
import type { DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import type { BitgetResponse } from './type';

const handler: Route['handler'] = async (ctx) => {
    const baseUrl = 'https://www.bitget.com';
    const announcementApiUrl = `${baseUrl}/v1/msg/push/stationLetterNew`;
    const { type, lang = 'zh-CN' } = ctx.req.param<'/bitget/announcement/:type/:lang?'>();
    const languageCode = lang.replace('-', '_');
    const headers = {
        Referer: baseUrl,
        accept: 'application/json, text/plain, */*',
        'content-type': 'application/json;charset=UTF-8',
        language: languageCode,
        locale: languageCode,
    };
    const pageSize = ctx.req.query('limit') ?? '10';

    // stationLetterType: 0 表示全部通知，02 表示新币上线，01 表示最新活动，06 表示最新公告
    const reqBody: {
        pageSize: string;
        openUnread: number;
        stationLetterType: string;
        isPre: boolean;
        lastEndId: null;
        languageType: number;
        excludeStationLetterType?: string;
    } = {
        pageSize,
        openUnread: 0,
        stationLetterType: '0',
        isPre: false,
        lastEndId: null,
        languageType: 1,
    };

    // 根据 type 判断 reqBody 的 stationLetterType 的值
    switch (type) {
        case 'new-listing':
            reqBody.stationLetterType = '02';
            break;

        case 'latest-activities':
            reqBody.stationLetterType = '01';
            break;

        case 'new-announcement':
            reqBody.stationLetterType = '06';
            break;

        case 'all':
            reqBody.stationLetterType = '0';
            reqBody.excludeStationLetterType = '00';
            break;

        default:
            throw new Error('Invalid type');
    }

    const response = (await cache.tryGet(
        `bitget:announcement:${type}:${pageSize}:${lang}`,
        async () => {
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
    )) as BitgetResponse;

    if (!response) {
        throw new Error('Failed to fetch announcements');
    }
    const items = response.data.items;
    const data = await Promise.all(
        items.map(
            (item) =>
                cache.tryGet(`bitget:announcement:${item.id}:${pageSize}:${lang}`, async () => {
                    // 从 unix 时间戳转换为日期
                    const date = parseDate(Number(item.sendTime));
                    const dataItem: DataItem = {
                        title: item.title ?? '',
                        link: item.openUrl ?? '',
                        pubDate: item.sendTime ? date : undefined,
                        description: item.content ?? '',
                    };

                    if (item.imgUrl) {
                        dataItem.image = item.imgUrl;
                    }

                    if (item.stationLetterType === '01' || item.stationLetterType === '06') {
                        try {
                            const itemResponse = await ofetch<string>(item.openUrl ?? '', {
                                headers,
                            });
                            const $ = load(itemResponse);
                            const nextData = JSON.parse($('script#__NEXT_DATA__').text());
                            dataItem.description = nextData.props.pageProps.details?.content || nextData.props.pageProps.pageInitInfo?.ruleContent || item.content || '';
                        } catch (error: any) {
                            if (error.name && (error.name === 'HTTPError' || error.name === 'RequestError' || error.name === 'FetchError')) {
                                dataItem.description = item.content ?? '';
                            } else {
                                throw error;
                            }
                        }
                    }
                    return dataItem;
                }) as Promise<DataItem>
        )
    );

    return {
        title: `Bitget | ${findTypeLabel(type)}`,
        link: `https://www.bitget.com/${lang}/inmail`,
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
            source: ['www.bitget.com/:lang/inmail'],
            target: '/announcement/all/:lang',
        },
    ],
    name: 'Announcement',
    description: `
type:
| Type | Description |
| --- | --- |
| all | 全部通知 |
| new-listing | 新币上线 |
| latest-activities | 最新活动 |
| new-announcement | 最新公告 |

lang:
| Lang | Description |
| ---   | ---   |
| zh-CN | 中文 |
| en-US | English |
| es-ES | Español |
| fr-FR | Français |
| de-DE | Deutsch |
| ja-JP | 日本語 |
| ru-RU | Русский |
| ar-SA | العربية |
`,
    maintainers: ['YukiCoco'],
    handler,
};
