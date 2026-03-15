import type { Data, DataItem, Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import type { HomePostItem, HupuApiResponse, NewsDataItem } from './types';
import { isHomePostItem } from './types';
import { extractNextData, getEntryDetails } from './utils';

const categories = {
    nba: {
        title: 'NBA',
        data: 'newsData',
    },
    cba: {
        title: 'CBA',
        data: 'newsData',
    },
    soccer: {
        title: '足球',
        data: 'news',
    },
    '': {
        title: '首页',
        data: 'res',
    },
} as const;

export const route: Route = {
    path: ['/dept/:category?', '/:category?'],
    name: '手机虎扑网',
    url: 'm.hupu.com',
    maintainers: ['nczitzk', 'hyoban'],
    example: '/hupu/nba',
    parameters: {
        category: {
            description: '分类，可选值：nba、cba、soccer，默认为空（首页）',
            default: '',
            options: Object.entries(categories).map(([key, value]) => ({
                label: value.title,
                value: key,
            })),
        },
    },
    description: `::: tip
电竞分类参见 [游戏热帖](https://bbs.hupu.com/all-gg) 的对应路由 [\`/hupu/all/all-gg\`](https://rsshub.app/hupu/all/all-gg)。
:::`,
    categories: ['bbs'],
    radar: [
        {
            source: ['m.hupu.com/:category', 'm.hupu.com/'],
            target: '/:category',
        },
    ],
    handler: async (ctx): Promise<Data> => {
        const c = ctx.req.param('category') || '';
        if (!(c in categories)) {
            throw new Error('Invalid category. Valid options are: ' + Object.keys(categories).filter(Boolean).join(', '));
        }
        const category = c as keyof typeof categories;

        const rootUrl = 'https://m.hupu.com';
        const currentUrl = `${rootUrl}/${category}`;

        const response = await got({
            method: 'get',
            url: currentUrl,
        });

        const data = extractNextData<HupuApiResponse>(response.data, currentUrl);
        const { pageProps } = data.props;

        const dataKey = categories[category].data;
        if (!(dataKey in pageProps)) {
            throw new Error(`Expected '${dataKey}' property not found in pageProps for category: ${category || 'home'}`);
        }

        const rawDataArray: Array<HomePostItem | NewsDataItem> = (() => {
            const data = (pageProps as any)[dataKey];
            return Array.isArray(data) ? data : [];
        })();

        let items: DataItem[] = rawDataArray.map((item) =>
            isHomePostItem(item)
                ? ({
                      title: item.title,
                      link: item.url.replace(/bbs\.hupu.com/, 'm.hupu.com/bbs'),
                      guid: item.tid,
                      category: item.label ? [item.label] : undefined,
                  } satisfies DataItem)
                : ({
                      title: item.title,
                      pubDate: timezone(parseDate(item.publishTime), +8),
                      link: item.link.replace(/bbs\.hupu.com/, 'm.hupu.com/bbs'),
                      guid: item.tid,
                  } satisfies DataItem)
        );

        items = await Promise.all(items.filter((item) => item.link && !/subject/.test(item.link)).map((item) => getEntryDetails(item)));

        return {
            title: `虎扑 - ${categories[category].title}`,
            link: currentUrl,
            item: items,
        } as Data;
    },
};
