import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { AnyNode, Element } from 'domhandler';
import type { Context } from 'hono';

import type { Data, DataItem, Language, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const handler = async (ctx: Context): Promise<Data> => {
    const { type = '92' } = ctx.req.param();
    const limit = Number(ctx.req.query('limit') ?? '20');

    const baseUrl = 'https://www.lhratings.com';
    const targetUrl: string = new URL(`lists/${type}.html`, baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = ($('html').attr('lang') ?? 'zh-CN') as Language;

    const items: DataItem[] = $('div.xlistNr ul li a, div.hgjjNr ul li a')
        .slice(0, limit)
        .toArray()
        .map((el) => {
            const $el: Cheerio<Element> = $(el);

            const title: string = $el.find('h2').text();
            const pubDateStr: string | undefined = $el.find('p').text().split('：', 2)[1];
            const href: string | undefined = $el.attr('href');
            const linkUrl: string | undefined = href ? new URL(href, baseUrl).href : undefined;
            const categoryEls: Array<Cheerio<AnyNode>> = [$el.find('h3').contents()].filter(Boolean);
            const categories: string[] = [...new Set(categoryEls.map((el) => $(el).text()).filter(Boolean))];
            const imageSrc: string | undefined = $el.find('div.xylist_img img').attr('src');
            const image: string | undefined = imageSrc ? new URL(imageSrc, baseUrl).href : undefined;
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

            const enclosureUrl: string | undefined = linkUrl?.endsWith('.pdf') ? linkUrl : undefined;

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

    const author = '联合资信评估股份有限公司';
    const logoSrc: string | undefined = $('h1.logo a img').attr('src');

    return {
        title: `${author} - ${$('title').text()}`,
        description: $('li.active').text(),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: logoSrc ? new URL(logoSrc, baseUrl).href : undefined,
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
    example: '/lhratings/research/92',
    parameters: {
        type: '分类，默认为 `92`，即宏观经济，可在对应分类页 URL 中找到',
    },
    description: `::: tip
若订阅 [宏观经济](https://www.lhratings.com/research.html?type=92)，网址为 \`https://www.lhratings.com/research.html?type=92\`，请截取 \`https://www.lhratings.com/research.html?type=\` 到末尾的部分 \`92\` 作为 \`type\` 参数填入，此时目标路由为 [\`/lhratings/research/92\`](https://rsshub.app/lhratings/research/92)。
:::

| 宏观经济 | 债券市场 | 行业研究 | 每日资讯 | 其他 |
| -------- | -------- | -------- | -------- | ---- |
| 92       | 93       | 94       | 95       | 96   |`,
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
            source: ['www.lhratings.com/research.html?type=92'],
            target: '/research/92',
        },
        {
            title: '债券市场',
            source: ['www.lhratings.com/research.html?type=93'],
            target: '/research/93',
        },
        {
            title: '行业研究',
            source: ['www.lhratings.com/research.html?type=94'],
            target: '/research/94',
        },
        {
            title: '每日资讯',
            source: ['www.lhratings.com/research.html?type=95'],
            target: '/research/95',
        },
        {
            title: '其他',
            source: ['www.lhratings.com/research.html?type=96'],
            target: '/research/96',
        },
    ],
    view: ViewType.Articles,
};
