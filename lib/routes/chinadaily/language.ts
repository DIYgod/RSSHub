import { type Data, type DataItem, type Route, ViewType } from '@/types';

import { art } from '@/utils/render';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { type CheerioAPI, type Cheerio, type Element, load } from 'cheerio';
import { type Context } from 'hono';
import path from 'node:path';

export const handler = async (ctx: Context): Promise<Data> => {
    const { category = 'thelatest' } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const baseUrl: string = 'https://language.chinadaily.com.cn';
    const targetUrl: string = new URL(category, baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = $('html').attr('lang') ?? 'zh-CN';

    let items: DataItem[] = [];

    items = $('div.gy_box, ul.content_list li')
        .slice(0, limit)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el);

            const $aEl: Cheerio<Element> = $el.find('a:not(.gy_box_img):not(.a_img)').first();

            const title: string = $aEl.text();
            const image: string | undefined = $el.find('a.gy_box_img img, a.a_img img').attr('src');
            const description: string | undefined = art(path.join(__dirname, 'templates/description.art'), {
                images: image
                    ? [
                          {
                              src: image,
                              alt: title,
                          },
                      ]
                    : undefined,
                intro: $el.find('p.gy_box_txt3 a').text(),
            });
            const linkUrl: string | undefined = $aEl.attr('href');

            const processedItem: DataItem = {
                title,
                description,
                link: linkUrl?.startsWith('//') ? `https:${linkUrl}` : linkUrl,
                content: {
                    html: description,
                    text: description,
                },
                image,
                banner: image,
                language,
            };

            return processedItem;
        });

    items = (
        await Promise.all(
            items.map((item) => {
                if (!item.link) {
                    return item;
                }

                return cache.tryGet(item.link, async (): Promise<DataItem> => {
                    const detailResponse = await ofetch(item.link);
                    const $$: CheerioAPI = load(detailResponse);

                    const title: string = $$('meta[ property="og:title"]').attr('content');
                    const pubDateStr: string | undefined = $$('p.main_title3').text().split(/\s/).pop();
                    const categories: string[] | undefined = $$('meta[name="keywords"]').attr('content')?.split(/,/);
                    const authorEls: Element[] = $$('meta[name="source"], meta[name="author"], meta[name="editor"]').toArray();
                    const authorNames: string[] = [
                        ...new Set(
                            authorEls
                                .map((authorEl) => {
                                    const $$authorEl: Cheerio<Element> = $$(authorEl);

                                    return $$authorEl.attr('content');
                                })
                                .filter((content): content is string => content !== undefined)
                        ),
                    ];
                    const authors: DataItem['author'] = authorNames.map((name) => ({
                        name,
                    }));
                    const image: string | undefined = $$('meta[property="og:image"]').attr('content');
                    const upDatedStr: string | undefined = pubDateStr;

                    let processedItem: DataItem = {
                        title,
                        pubDate: pubDateStr ? timezone(parseDate(pubDateStr), +8) : item.pubDate,
                        category: categories,
                        author: authors,
                        image,
                        banner: image,
                        updated: upDatedStr ? timezone(parseDate(upDatedStr), +8) : item.updated,
                        language,
                    };

                    const $enclosureEl: Cheerio<Element> = $$('iframe#playerFrame, audio').first();
                    const enclosureUrl: string | undefined = $enclosureEl.attr('src');

                    if (enclosureUrl) {
                        processedItem = {
                            ...processedItem,
                            enclosure_url: enclosureUrl?.startsWith('//') ? `https:${enclosureUrl}` : enclosureUrl,
                            enclosure_title: title,
                            enclosure_length: undefined,
                            itunes_duration: undefined,
                            itunes_item_image: image,
                        };
                    }

                    $$('div.urlShareArea').remove();

                    const description: string | undefined =
                        item.description +
                        art(path.join(__dirname, 'templates/description.art'), {
                            description: $$('div#Content').html(),
                        });

                    processedItem = {
                        ...processedItem,
                        description,
                        content: {
                            html: description,
                            text: description,
                        },
                    };

                    return {
                        ...item,
                        ...processedItem,
                    };
                });
            })
        )
    ).filter((_): _ is DataItem => true);

    const title: string = $('title').text();
    const author: string = title.split(/-\s/).pop();

    return {
        title,
        description: $('meta[name="description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('a.header2_logo1 img').attr('src'),
        author,
        language,
        itunes_author: author,
        itunes_category: 'Language',
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/language/:category{.+}?',
    name: '英语点津',
    url: 'language.chinadaily.com.cn',
    maintainers: ['nczitzk'],
    handler,
    example: '/chinadaily/language/thelatest',
    parameters: {
        category: {
            description: '分类，默认为 `thelatest`，即精彩推荐，可在对应分类页 URL 中找到, Category, `thelatest`，即精彩推荐  by default',
            options: [
                {
                    label: '精彩推荐',
                    value: 'thelatest',
                },
                {
                    label: '每日一词',
                    value: 'news_hotwords/word_of_the_day',
                },
                {
                    label: '双语新闻',
                    value: 'news_bilingual',
                },
                {
                    label: '新闻热词',
                    value: 'news_hotwords',
                },
                {
                    label: '实用口语',
                    value: 'practice_tongue',
                },
                {
                    label: '译词课堂',
                    value: 'trans_collect',
                },
                {
                    label: '图片新闻',
                    value: 'news_photo',
                },
                {
                    label: '视频精选',
                    value: 'video_links',
                },
                {
                    label: '新闻播报',
                    value: 'audio_cd',
                },
                {
                    label: '专栏作家',
                    value: 'columnist',
                },
                {
                    label: '权威发布',
                    value: '5af95d44a3103f6866ee845c',
                },
            ],
        },
    },
    description: `:::tip
若订阅 [精彩推荐](https://language.chinadaily.com.cn/thelatest)，网址为 \`https://language.chinadaily.com.cn/thelatest\`，请截取 \`https://language.chinadaily.com.cn/\` 到末尾的部分 \`thelatest\` 作为 \`category\` 参数填入，此时目标路由为 [\`/chinadaily/language/thelatest\`](https://rsshub.app/chinadaily/language/thelatest)。
:::

<details>
  <summary>更多分类</summary>

| 分类                                                                         | ID                                                                                                    |
| ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| [精彩推荐](https://language.chinadaily.com.cn/thelatest)                     | [thelatest](https://rsshub.app/chinadaily/language/thelatest)                                         |
| [每日一词](https://language.chinadaily.com.cn/news_hotwords/word_of_the_day) | [news_hotwords/word_of_the_day](https://rsshub.app/chinadaily/language/news_hotwords/word_of_the_day) |
| [双语新闻](https://language.chinadaily.com.cn/news_bilingual)                | [news_bilingual](https://rsshub.app/chinadaily/language/news_bilingual)                               |
| [新闻热词](https://language.chinadaily.com.cn/news_hotwords)                 | [news_hotwords](https://rsshub.app/chinadaily/language/news_hotwords)                                 |
| [实用口语](https://language.chinadaily.com.cn/practice_tongue)               | [practice_tongue](https://rsshub.app/chinadaily/language/practice_tongue)                             |
| [译词课堂](https://language.chinadaily.com.cn/trans_collect)                 | [trans_collect](https://rsshub.app/chinadaily/language/trans_collect)                                 |
| [图片新闻](https://language.chinadaily.com.cn/news_photo)                    | [news_photo](https://rsshub.app/chinadaily/language/news_photo)                                       |
| [视频精选](https://language.chinadaily.com.cn/video_links)                   | [video_links](https://rsshub.app/chinadaily/language/video_links)                                     |
| [新闻播报](https://language.chinadaily.com.cn/audio_cd)                      | [audio_cd](https://rsshub.app/chinadaily/language/audio_cd)                                           |
| [专栏作家](https://language.chinadaily.com.cn/columnist)                     | [audio_cd](https://rsshub.app/chinadaily/language/columnist)                                          |
| [权威发布](https://language.chinadaily.com.cn/5af95d44a3103f6866ee845c)      | [5af95d44a3103f6866ee845c](https://rsshub.app/chinadaily/language/5af95d44a3103f6866ee845c)           |

</details>
`,
    categories: ['traditional-media'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: true,
        supportScihub: false,
    },
    radar: [
        {
            source: ['language.chinadaily.com.cn/:category'],
            target: (params) => {
                const category: string = params.category;

                return `/chinadaily/language${category ? `/${category}` : ''}`;
            },
        },
        {
            title: '精彩推荐',
            source: ['language.chinadaily.com.cn/thelatest'],
            target: '/language/thelatest',
        },
        {
            title: '每日一词',
            source: ['language.chinadaily.com.cn/news_hotwords/word_of_the_day'],
            target: '/language/news_hotwords/word_of_the_day',
        },
        {
            title: '双语新闻',
            source: ['language.chinadaily.com.cn/news_bilingual'],
            target: '/language/news_bilingual',
        },
        {
            title: '新闻热词',
            source: ['language.chinadaily.com.cn/news_hotwords'],
            target: '/language/news_hotwords',
        },
        {
            title: '实用口语',
            source: ['language.chinadaily.com.cn/practice_tongue'],
            target: '/language/practice_tongue',
        },
        {
            title: '译词课堂',
            source: ['language.chinadaily.com.cn/trans_collect'],
            target: '/language/trans_collect',
        },
        {
            title: '图片新闻',
            source: ['language.chinadaily.com.cn/news_photo'],
            target: '/language/news_photo',
        },
        {
            title: '视频精选',
            source: ['language.chinadaily.com.cn/video_links'],
            target: '/language/video_links',
        },
        {
            title: '新闻播报',
            source: ['language.chinadaily.com.cn/audio_cd'],
            target: '/language/audio_cd',
        },
        {
            title: '专栏作家',
            source: ['language.chinadaily.com.cn/columnist'],
            target: '/language/columnist',
        },
        {
            title: '权威发布',
            source: ['language.chinadaily.com.cn/5af95d44a3103f6866ee845c'],
            target: '/language/5af95d44a3103f6866ee845c',
        },
    ],
    view: ViewType.Articles,
};
