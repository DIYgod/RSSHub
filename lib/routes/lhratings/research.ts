import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const handler = async (ctx: Context): Promise<Data> => {
    const { type = '1' } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '20', 10);

    const baseUrl = 'https://www.lhratings.com';
    const targetUrl: string = new URL(`research.html?type=${type}`, baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = $('html').attr('lang') ?? 'zh-CN';

    const items: DataItem[] = $('table.list-table tbody tr')
        .slice(0, limit)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el);
            const $aEl: Cheerio<Element> = $el.find('a').first();

            const title: string = $aEl.text();
            const pubDateStr: string | undefined = $aEl.parent().next().next().text();
            const linkUrl: string | undefined = $aEl.attr('href');
            const categoryEls: Element[] = [$aEl.parent().next()].filter(Boolean);
            const categories: string[] = [...new Set(categoryEls.map((el) => $(el).text()).filter(Boolean))];
            const image: string | undefined = $el.find('img').attr('src');
            const upDatedStr: string | undefined = pubDateStr;

            let processedItem: DataItem = {
                title,
                pubDate: pubDateStr ? parseDate(pubDateStr) : undefined,
                link: linkUrl,
                category: categories,
                image,
                banner: image,
                updated: upDatedStr ? parseDate(upDatedStr) : undefined,
                language,
            };

            const enclosureUrl: string | undefined = linkUrl;

            if (enclosureUrl) {
                processedItem = {
                    ...processedItem,
                    enclosure_url: enclosureUrl,
                    enclosure_type: `application/${enclosureUrl.split(/\./).pop()}`,
                    enclosure_title: title,
                };
            }

            return processedItem;
        });

    const author: string = $('title').text();

    return {
        title: `${author} - ${$('li.active').text()}`,
        description: $('li.active').text(),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('a#logo img').attr('src'),
        author,
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/research/:type?',
    name: '研究报告',
    url: 'www.lhratings.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/lhratings/research/1',
    parameters: {
        type: '分类，默认为 `1`，即宏观经济，可在对应分类页 URL 中找到',
    },
    description: `::: tip
若订阅 [宏观经济](https://www.lhratings.com/research.html?type=1)，网址为 \`https://www.lhratings.com/research.html?type=1\`，请截取 \`https://www.lhratings.com/research.html?type=\` 到末尾的部分 \`1\` 作为 \`type\` 参数填入，此时目标路由为 [\`/lhratings/research/1\`](https://rsshub.app/lhratings/research/1)。
:::

| 宏观经济 | 债券市场 | 行业研究 | 评级理论与方法 | 国际债券市场与评级 | 评级表现 |
| -------- | -------- | -------- | -------------- | ------------------ | -------- |
| 1        | 2        | 3        | 4              | 5                  | 6        |
`,
    categories: ['finance'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.lhratings.com/research.html'],
            target: (_, url) => {
                const urlObj: URL = new URL(url);
                const type: string | undefined = urlObj.searchParams.get('type') ?? undefined;

                return `/lhratings/research/${type ? `/${type}` : ''}`;
            },
        },
        {
            title: '宏观经济',
            source: ['www.lhratings.com/research.html?type=1'],
            target: '/research/1',
        },
        {
            title: '债券市场',
            source: ['www.lhratings.com/research.html?type=2'],
            target: '/research/2',
        },
        {
            title: '行业研究',
            source: ['www.lhratings.com/research.html?type=3'],
            target: '/research/3',
        },
        {
            title: '评级理论与方法',
            source: ['www.lhratings.com/research.html?type=4'],
            target: '/research/4',
        },
        {
            title: '国际债券市场与评级',
            source: ['www.lhratings.com/research.html?type=5'],
            target: '/research/5',
        },
        {
            title: '评级表现',
            source: ['www.lhratings.com/research.html?type=6'],
            target: '/research/6',
        },
    ],
    view: ViewType.Articles,
};
