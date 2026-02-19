import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { renderDescription } from './templates/description';

export const handler = async (ctx: Context): Promise<Data> => {
    const { category } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const baseUrl = 'http://www.duozhi.com';
    const targetUrl: string = new URL(category && category.endsWith('/') ? category : category ? `${category}/` : '', baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = $('html').attr('lang') ?? 'zh';

    let items: DataItem[] = $('div.post-item')
        .slice(0, limit)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el);
            const $aEl: Cheerio<Element> = $el.find('a.post-title');

            const title: string = $aEl.text();
            const image: string | undefined = $el
                .find('a.post-img')
                .attr('style')
                ?.match(/url\(['"]?(.*?)['"]?\)?/)?.[1];
            const description: string | undefined = renderDescription({
                images: image
                    ? [
                          {
                              src: image,
                              alt: title,
                          },
                      ]
                    : undefined,
            });
            const pubDateStr: string | undefined = $el.find('div.post-attr').text().split(/\|/)[0]?.trim();
            const linkUrl: string | undefined = $aEl.attr('href');
            const categoryEls: Element[] = $el.find('span.post-tag a.link-tag').toArray();
            const categories: string[] = [...new Set(categoryEls.map((el) => $(el).text()).filter(Boolean))];
            const authors: DataItem['author'] = $el
                .find('div.post-attr')
                .text()
                .split(/by/)
                ?.pop()
                ?.split(/\s+/)
                .filter(Boolean)
                .map((author) => ({
                    name: author,
                    url: undefined,
                    avatar: undefined,
                }));
            const upDatedStr: string | undefined = pubDateStr;

            const processedItem: DataItem = {
                title,
                description,
                pubDate: pubDateStr ? parseDate(pubDateStr) : undefined,
                link: linkUrl,
                category: categories,
                author: authors,
                content: {
                    html: description,
                    text: description,
                },
                image,
                banner: image,
                updated: upDatedStr ? parseDate(upDatedStr) : undefined,
                language,
            };

            return processedItem;
        });

    items = await Promise.all(
        items.map((item) => {
            if (!item.link) {
                return item;
            }

            return cache.tryGet(item.link, async (): Promise<DataItem> => {
                const detailResponse = await ofetch(item.link);
                const $$: CheerioAPI = load(detailResponse);

                const title: string = $$('h1.subject-title').text();
                const image: string | undefined = $$('div.subject-banner img').attr('src');
                const description: string | undefined = renderDescription({
                    images: image
                        ? [
                              {
                                  src: image,
                                  alt: title,
                              },
                          ]
                        : undefined,
                    intro: $$('div.subject-desc').text(),
                    description: $$('div.subject-content').html(),
                });
                const pubDateStr: string | undefined = $$('div.subject-meta')
                    .text()
                    ?.split(/发布/)[0];
                const categories: string[] = [
                    ...new Set([
                        ...(item.category ?? []),
                        ...($$('meta[name="keywords"]')
                            .attr('content')
                            ?.split(',')
                            .map((c) => c.trim()) ?? []),
                    ]),
                ];
                const authors: DataItem['author'] = $$('div.subject-meta')
                    .text()
                    .split(/作者：/)
                    ?.pop()
                    ?.split(/\s+/)
                    .filter(Boolean)
                    .map((author) => ({
                        name: author,
                        url: undefined,
                        avatar: undefined,
                    }));
                const upDatedStr: string | undefined = pubDateStr;

                const processedItem: DataItem = {
                    title,
                    description,
                    pubDate: pubDateStr ? timezone(parseDate(pubDateStr), +8) : item.pubDate,
                    category: categories,
                    author: authors,
                    content: {
                        html: description,
                        text: description,
                    },
                    image,
                    banner: image,
                    updated: upDatedStr ? timezone(parseDate(upDatedStr), +8) : item.updated,
                    language,
                };

                return {
                    ...item,
                    ...processedItem,
                };
            });
        })
    );

    return {
        title: $('title').text(),
        description: $('meta[name="description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: new URL('static/images/logo.png', baseUrl).href,
        author: $('meta[property="og:site_name"]').attr('content'),
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/:category{.+}?',
    name: '分类',
    url: 'www.duozhi.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/duozhi/industry',
    parameters: {
        category: {
            description: '分类，默认为 `industry`，即行业，可在对应分类页 URL 中找到',
            options: [
                {
                    label: '行业',
                    value: 'industry',
                },
                {
                    label: '多知商学院',
                    value: 'DBS',
                },
                {
                    label: 'OpenTalk',
                    value: 'opentalk',
                },
                {
                    label: '行业 - 观察',
                    value: 'industry/insight',
                },
                {
                    label: '行业 - 早幼教',
                    value: 'industry/preschool',
                },
                {
                    label: '行业 - 家庭教育',
                    value: 'industry/jiatingjiaoyu',
                },
                {
                    label: '行业 - K12',
                    value: 'industry/K12',
                },
                {
                    label: '行业 - 素质教育',
                    value: 'industry/qualityedu',
                },
                {
                    label: '行业 - 职教/大学生',
                    value: 'industry/adult',
                },
                {
                    label: '行业 - 教育信息化',
                    value: 'industry/EduInformatization',
                },
                {
                    label: '行业 - 财报',
                    value: 'industry/earnings',
                },
                {
                    label: '行业 - 民办学校',
                    value: 'industry/privateschools',
                },
                {
                    label: '行业 - 留学',
                    value: 'industry/overseas',
                },
            ],
        },
    },
    description: `:::tip
订阅 [行业](http://www.duozhi.com/industry/)，其源网址为 \`http://www.duozhi.com/industry/\`，请参考该 URL 指定部分构成参数，此时路由为 [\`/duozhi/industry\`](http://rsshub.app/duozhi/industry)。
:::

  | [行业](http://www.duozhi.com/industry/)        | [多知商学院](http://www.duozhi.com/DBS/) | [OpenTalk](http://www.duozhi.com/opentalk/)    |
  | ---------------------------------------------- | ---------------------------------------- | ---------------------------------------------- |
  | [industry](https://rsshub.app/duozhi/industry) | [DBS](https://rsshub.app/duozhi/DBS)     | [opentalk](https://rsshub.app/duozhi/opentalk) |

  #### [行业](http://www.duozhi.com/industry/)

  | [观察](http://www.duozhi.com/industry/insight/)                | [早幼教](http://www.duozhi.com/industry/preschool/)                | [家庭教育](http://www.duozhi.com/industry/jiatingjiaoyu/)                  | [K12](http://www.duozhi.com/industry/K12/)             | [素质教育](http://www.duozhi.com/industry/qualityedu/)               |
  | -------------------------------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------------- |
  | [industry/insight](https://rsshub.app/duozhi/industry/insight) | [industry/preschool](https://rsshub.app/duozhi/industry/preschool) | [industry/jiatingjiaoyu](https://rsshub.app/duozhi/industry/jiatingjiaoyu) | [industry/K12](https://rsshub.app/duozhi/industry/K12) | [industry/qualityedu](https://rsshub.app/duozhi/industry/qualityedu) |

  | [职教/大学生](http://www.duozhi.com/industry/adult/)       | [教育信息化](http://www.duozhi.com/industry/EduInformatization/)                     | [财报](http://www.duozhi.com/industry/earnings/)                 | [民办学校](http://www.duozhi.com/industry/privateschools/)                   | [留学](http://www.duozhi.com/industry/overseas/)                 |
  | ---------------------------------------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------- |
  | [industry/adult](https://rsshub.app/duozhi/industry/adult) | [industry/EduInformatization](https://rsshub.app/duozhi/industry/EduInformatization) | [industry/earnings](https://rsshub.app/duozhi/industry/earnings) | [industry/privateschools](https://rsshub.app/duozhi/industry/privateschools) | [industry/overseas](https://rsshub.app/duozhi/industry/overseas) |

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
            source: ['www.duozhi.com/:category'],
            target: '/:category',
        },
        {
            title: '行业',
            source: ['www.duozhi.com/industry/'],
            target: '/industry',
        },
        {
            title: '多知商学院',
            source: ['www.duozhi.com/DBS/'],
            target: '/DBS',
        },
        {
            title: 'OpenTalk',
            source: ['www.duozhi.com/opentalk/'],
            target: '/opentalk',
        },
        {
            title: '行业 - 观察',
            source: ['www.duozhi.com/industry/insight/'],
            target: '/industry/insight',
        },
        {
            title: '行业 - 早幼教',
            source: ['www.duozhi.com/industry/preschool/'],
            target: '/industry/preschool',
        },
        {
            title: '行业 - 家庭教育',
            source: ['www.duozhi.com/industry/jiatingjiaoyu/'],
            target: '/industry/jiatingjiaoyu',
        },
        {
            title: '行业 - K12',
            source: ['www.duozhi.com/industry/K12/'],
            target: '/industry/K12',
        },
        {
            title: '行业 - 素质教育',
            source: ['www.duozhi.com/industry/qualityedu/'],
            target: '/industry/qualityedu',
        },
        {
            title: '行业 - 职教/大学生',
            source: ['www.duozhi.com/industry/adult/'],
            target: '/industry/adult',
        },
        {
            title: '行业 - 教育信息化',
            source: ['www.duozhi.com/industry/EduInformatization/'],
            target: '/industry/EduInformatization',
        },
        {
            title: '行业 - 财报',
            source: ['www.duozhi.com/industry/earnings/'],
            target: '/industry/earnings',
        },
        {
            title: '行业 - 民办学校',
            source: ['www.duozhi.com/industry/privateschools/'],
            target: '/industry/privateschools',
        },
        {
            title: '行业 - 留学',
            source: ['www.duozhi.com/industry/overseas/'],
            target: '/industry/overseas',
        },
    ],
    view: ViewType.Articles,
};
