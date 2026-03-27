import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { renderDescription } from './templates/description';

const cleanHtml = (html: string, preservedTags: string[]): string => {
    const $ = load(html);

    $('div.informationbox').remove();
    $('div.contributors').remove();

    $('*')
        .not(preservedTags.join(', '))
        .contents()
        .filter((_, el) => el.type === 'text')
        .remove();

    $('*')
        .not(preservedTags.join(', '))
        .filter((_, el) => $(el).children().length === 0)
        .remove();

    return $.html() || '';
};

export const handler = async (ctx: Context): Promise<Data> => {
    const { language: lang = 'zh', category = 'trends-and-insights' } = ctx.req.param();
    // default limit is 12
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '12', 10);

    const rootUrl = 'https://www.joneslanglasalle.com.cn';
    const targetUrl: string = new URL(`${lang}/${category}`, rootUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language: string = $('html').prop('lang') ?? 'en';

    let items: DataItem[] = $('div.ti-title')
        .slice(0, limit)
        .toArray()
        .map((item): DataItem => {
            const $item: Cheerio<Element> = $(item);
            const aEl = $item.closest('a');

            const title: string = $item.text();
            const link: string | undefined = aEl.prop('href');

            const description: string = renderDescription({
                intro: aEl.find('p.ti-teaser').text(),
            });

            const image: string | undefined = aEl.find('div.ti-image-container img').prop('src') ? new URL(aEl.find('div.ti-image-container img').prop('src') as string, rootUrl).href : undefined;

            return {
                title,
                description,
                pubDate: parseDate(aEl.find('span.ti-date').text(), ['MM月DD日', 'MMMM DD']),
                link: link ? new URL(link, rootUrl).href : undefined,
                category: [aEl.find('span.ti-type').text()].filter(Boolean),
                content: {
                    html: description,
                    text: aEl.find('p.ti-teaser').text(),
                },
                image,
                banner: image,
                language,
            };
        });

    items = (
        await Promise.all(
            items.map((item) => {
                if (!item.link && typeof item.link !== 'string') {
                    return item;
                }

                return cache.tryGet(item.link, async (): Promise<DataItem> => {
                    try {
                        const detailResponse = await ofetch(item.link);
                        const $$: CheerioAPI = load(detailResponse);

                        const title: string = $$('meta[property="og:title"]').prop('content');
                        const guid: string = $$('meta[property="og:url"]').prop('content');
                        const image: string | undefined = $$('meta[property="og:image"]').prop('content');

                        const pubDate: Date = parseDate($$('div.publicationdate').text().trim(), ['YYYY 年MM 月DD 日', 'MMMM DD, YYYY']);

                        const author: DataItem['author'] = $$('div.contributors ul li')
                            .toArray()
                            .map((el) => ({
                                name: $$(el).text(),
                            }));

                        const media: Record<string, Record<string, string>> = {};

                        $$('picture').each((_, el) => {
                            const $$el = $$(el);

                            const src = $$el.find('source').last().prop('srcset') ? new URL($$el.find('source').last().prop('srcset') as string, rootUrl).href : undefined;

                            if (src) {
                                $$el.replaceWith(
                                    renderDescription({
                                        images: [
                                            {
                                                src,
                                            },
                                        ],
                                    })
                                );

                                const mediaType: string | undefined = src.split(/\./).pop();

                                if (mediaType) {
                                    media[mediaType] = { url: src };
                                }
                            }
                        });

                        const extraLinks = $$('div.related-content a.content-card')
                            .toArray()
                            .map((el) => {
                                const $$el: Cheerio<Element> = $$(el);

                                return {
                                    url: new URL($$el.prop('href') as string, rootUrl).href,
                                    type: 'related',
                                    content_html: $$el.find('div.content-card__body').html(),
                                };
                            })
                            .filter((_link): _link is { url: string; type: string; content_html: string } => true);

                        const description: string = renderDescription({
                            description: cleanHtml($$('div.page-section').eq(1).html() ?? $$('div.copy-block').html() ?? '', ['div.richtext p', 'h3', 'h4', 'h5', 'h6', 'figure', 'img', 'ul', 'li', 'span', 'b']),
                        });

                        return {
                            title,
                            description,
                            pubDate,
                            category: $$('meta[property="article:tag"]').prop('content').split(/,\s/),
                            author,
                            guid,
                            id: guid,
                            content: {
                                html: description,
                                text: description,
                            },
                            image,
                            banner: image,
                            language,
                            media: Object.keys(media).length > 0 ? media : undefined,
                            _extra: {
                                links: extraLinks.length > 0 ? extraLinks : undefined,
                            },
                        };
                    } catch {
                        return item;
                    }
                });
            })
        )
    ).filter((_): _ is DataItem => true);

    const title = $('title').text();
    const feedImage = $('img.logo').prop('src') ? new URL($('img.logo').prop('src') as string, rootUrl).href : undefined;

    return {
        title,
        description: $('meta[property="og:description"]').prop('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: feedImage,
        author: title.split(/\|/).pop(),
        language,
        id: $('meta[property="og:url"]').prop('content'),
    };
};

export const route: Route = {
    path: '/:language?/:category{.+}?',
    name: 'Trends & Insights',
    url: 'joneslanglasalle.com.cn',
    maintainers: ['nczitzk', 'pseudoyu'],
    handler,
    example: '/joneslanglasalle/en/trends-and-insights',
    parameters: {
        language: 'Language, `zh` by default',
        category: 'Category, `trends-and-insights` by default',
    },
    description: `::: tip
If you subscribe to [Trends & Insights](https://www.joneslanglasalle.com.cn/en/trends-and-insights)，where the URL is \`https://www.joneslanglasalle.com.cn/en/trends-and-insights\`, extract the part \`https://joneslanglasalle.com.cn/\` to the end. Use \`zh\` and \`trends-and-insights\` as the parameters to fill in. Therefore, the route will be [\`/joneslanglasalle/en/trends-and-insights\`](https://rsshub.app/joneslanglasalle/en/trends-and-insights).
:::

| Category  | ID                            |
| --------- | ----------------------------- |
| Latest    | trends-and-insights           |
| Workplace | trends-and-insights/workplace |
| Investor  | trends-and-insights/investor  |
| Cities    | trends-and-insights/cities    |
| Research  | trends-and-insights/research  |
`,
    categories: ['new-media'],
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
            source: ['joneslanglasalle.com.cn/:language/:category'],
            target: (params) => {
                const language = params.language;
                const category = params.category;

                return language ? `/${language}${category ? `/${category}` : ''}` : '';
            },
        },
        {
            title: 'Latest',
            source: ['joneslanglasalle.com.cn/en/trends-and-insights'],
            target: '/en/trends-and-insights',
        },
        {
            title: 'Workplace',
            source: ['joneslanglasalle.com.cn/en/trends-and-insights/workplace'],
            target: '/en/trends-and-insights/workplace',
        },
        {
            title: 'Investor',
            source: ['joneslanglasalle.com.cn/en/trends-and-insights/investor'],
            target: '/en/trends-and-insights/investor',
        },
        {
            title: 'Cities',
            source: ['joneslanglasalle.com.cn/en/trends-and-insights/cities'],
            target: '/en/trends-and-insights/cities',
        },
        {
            title: 'Research',
            source: ['joneslanglasalle.com.cn/en/trends-and-insights/research'],
            target: '/en/trends-and-insights/research',
        },
        {
            title: '房地产趋势与洞察',
            source: ['joneslanglasalle.com.cn/zh/trends-and-insights'],
            target: '/zh/trends-and-insights',
        },
        {
            title: '办公空间',
            source: ['joneslanglasalle.com.cn/zh/trends-and-insights/workplace'],
            target: '/zh/trends-and-insights/workplace',
        },
        {
            title: '投资者',
            source: ['joneslanglasalle.com.cn/zh/trends-and-insights/investor'],
            target: '/zh/trends-and-insights/investor',
        },
        {
            title: '城市',
            source: ['joneslanglasalle.com.cn/zh/trends-and-insights/cities'],
            target: '/zh/trends-and-insights/cities',
        },
        {
            title: '研究报告',
            source: ['joneslanglasalle.com.cn/zh/trends-and-insights/research'],
            target: '/zh/trends-and-insights/research',
        },
    ],
    view: ViewType.Articles,

    zh: {
        path: '/:language?/:category{.+}?',
        name: '房地产趋势与洞察',
        url: 'joneslanglasalle.com.cn',
        maintainers: ['nczitzk'],
        handler,
        example: '/joneslanglasalle/zh/trends-and-insights',
        parameters: {
            language: '语言，默认为 `zh`，可在对应分类页 URL 中找到',
            category: '分类，默认为 `trends-and-insights`，可在对应分类页 URL 中找到',
        },
        description: `::: tip
若订阅 [房地产趋势与洞察](https://www.joneslanglasalle.com.cn/zh/trends-and-insights)，网址为 \`https://www.joneslanglasalle.com.cn/zh/trends-and-insights\`，请截取 \`https://joneslanglasalle.com.cn/\` 到末尾的部分 \`zh\` 和 \`trends-and-insights\` 作为 \`language\` 和 \`category\` 参数填入，此时目标路由为 [\`/joneslanglasalle/zh/trends-and-insights\`](https://rsshub.app/joneslanglasalle/zh/trends-and-insights)。
:::

| 分类名称   | 分类 ID                       |
| ---------- | ----------------------------- |
| 趋势及洞察 | trends-and-insights           |
| 办公空间   | trends-and-insights/workplace |
| 投资者     | trends-and-insights/investor  |
| 城市       | trends-and-insights/cities    |
| 研究报告   | trends-and-insights/research  |
`,
    },
};
