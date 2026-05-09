import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Data, Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { namespace } from './namespace';

export const route: Route = {
    path: '/display/offline-exhibit',
    categories: ['travel'],
    example: '/shanghaimuseum/display/offline-exhibit',
    // Use SHM English version channel name
    name: 'Special Exhibitions',
    maintainers: ['magazian'],
    radar: [
        {
            source: ['www.shanghaimuseum.net/mu/frontend/pg/display/offline-exhibit'],
            target: '/display/offline-exhibit',
        },
    ],
    handler: async (_ctx: Context): Promise<Data> => {
        const baseUrl = 'https://www.shanghaimuseum.net';
        const apiUrl = `${baseUrl}/mu/frontend/pg/display/search-exhibit`;

        const response = await got.post(apiUrl, {
            json: {
                limit: 20,
                page: 1,
                params: {
                    exhibitTypeCode: 'OFFLINE_EXHIBITION',
                    langCode: 'CHINESE',
                    offlineExhibitionType: 'PRESENT',
                },
            },
        });

        const list = response.data.data || [];

        const items = list.map((item) => {
            const museumName = namespace.zh?.name || namespace.name;
            const title = item.name;
            const itemLink = `${baseUrl}/mu/frontend/pg/article/id/${item.code}`;
            const imgUrl = item.picPath ? `${baseUrl}/${item.picPath}` : '';
            const location = item.exhibitPlace || '上海博物馆';
            const pubDate = parseDate(item.issueTime);

            const fullDuration = item.exhibitDateRange || '';
            const [startDate, endDate] = fullDuration.includes(' - ')
                ? fullDuration.split(' - ').map((s) => s.trim())
                : [fullDuration, ''];

            const $desc = load('<div></div>', null, false);

            if (imgUrl) {
                $desc('div').append(`<img src="${imgUrl}">`);
                $desc('div').append('<br>');
            }
            $desc('div').append(`<p><b>地点：</b>${location}</p>`);
            $desc('div').append(`<p><b>开展：</b>${startDate ?? '未定/常设'}</p>`);
            $desc('div').append(`<p><b>闭展：</b>${endDate ?? '未定/常设'}</p>`);

            if (fullDuration) {
                $desc('div').append(`<p><small>原始展期：${fullDuration}</small></p>`);
            }

            return {
                title,
                link: itemLink,
                pubDate,
                description: $desc.html(),
                // For further processing, keep the fixed format
                _extra: {
                    museumName,
                    title,
                    location,
                    startDate,
                    endDate,
                    itemLink,
                },
            };
        });

        return {
            title: '上海博物馆 - 特别展览',
            link: `${baseUrl}/mu/frontend/pg/display/offline-exhibit`,
            language: 'zh-CN',
            item: items,
        };
    },
};
