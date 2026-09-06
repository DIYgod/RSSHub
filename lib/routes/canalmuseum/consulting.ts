import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { namespace } from './namespace';

interface SectionConfig {
    sectionId: string;
    sectionName: string;
    listSelector: string;
}

const TYPE_CONFIG: Record<string, SectionConfig> = {
    tzgg: {
        sectionId: 'tzgg',
        sectionName: '通知公告',
        listSelector: '.consulting5 .news_chose .list .item',
    },
    xwdt: {
        sectionId: 'xwdt',
        sectionName: '新闻动态',
        listSelector: '.consulting2 .public-list .public-item',
    },
};

export const route: Route = {
    path: '/consulting/:type',
    categories: ['travel'],
    example: '/canalmuseum/consulting/tzgg',
    parameters: {
        type: 'News type, supported values: tzgg（通知公告）, xwdt（新闻动态）',
    },
    radar: [
        {
            source: ['www.canalmuseum.org.cn/consulting.html'],
            target: '/consulting/tzgg',
        },
    ],
    name: 'NEWS',
    maintainers: ['magazian'],
    handler: async (ctx: Context) => {
        const type = ctx.req.param('type') ?? '';
        const config = TYPE_CONFIG[type];

        const baseUrl = 'https://www.canalmuseum.org.cn';
        const listUrl = `${baseUrl}/consulting.html`;
        const response = await ofetch(listUrl);
        const $ = load(response);

        const items = $(config.listSelector)
            .toArray()
            .map((el) => {
                const $el = $(el);
                const $a = $el.find('a');
                const title = $a.find('.t1').text();
                const dateText = $a.find('.date1').text();
                const pubDate = parseDate(dateText);
                const href = $a.attr('href') ?? '';
                const link = new URL(href, baseUrl).href;

                return {
                    title,
                    link,
                    pubDate,
                };
            });

        return {
            title: `${namespace.zh?.name || namespace.name} - ${config.sectionName}`,
            link: `${listUrl}#${config.sectionId}`,
            language: 'zh-CN',
            item: items,
        };
    },
};
