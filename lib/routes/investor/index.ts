import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

// Collected from https://www.investor.org.cn/images/docSearchData.js.

const channelIds = {
    63: 298519,
    958: 244863,
    3966: 244863,
};

export const handler = async (ctx) => {
    const { category = 'information_release/news_release_from_authorities/zjhfb' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 15;

    const rootUrl = 'https://www.investor.org.cn';
    const apiUrl = new URL('was5/web/search', rootUrl).href;
    const currentUrl = new URL(category.endsWith('/') ? category : `${category}/`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const language = 'zh';

    let items = [];

    if ($('div.hotlist dd').length === 0) {
        const channelId = response.match(/params.channelId='(\d+)';/)?.[1] ?? undefined;

        const {
            data: { rows },
        } = await got.post(apiUrl, {
            form: {
                channelid: channelIds?.[channelId] ?? undefined,
                searchword: `CHANNELID=${channelId}`,
                page: 1,
                perpage: limit,
            },
        });

        items = rows.map((item) => ({
            title: item.DOCTITLE,
            pubDate: parseDate(item.DOCPUBTIME),
            link: item.DOCURL,
            language,
        }));
    } else {
        items = $('div.hotlist dd')
            .slice(0, limit)
            .toArray()
            .map((item) => {
                item = $(item);

                const href = item.find('a').prop('href');

                return {
                    title: item.find('a').prop('title'),
                    pubDate: parseDate(item.find('span.date').text()),
                    link: new URL(href, currentUrl).href,
                    language,
                };
            });
    }

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                if (!item.link.endsWith('html')) {
                    return item;
                }

                const { data: detailResponse } = await got(item.link);

                const $$ = load(detailResponse);

                const title = $$('div.contentText h2').text();
                const description = $$('div.TRS_Editor').html();

                item.title = title || item.title;
                item.description = description;
                item.author = $$('span.timeSpan')
                    .text()
                    .trim()
                    .split(/来源：/)
                    .pop();
                item.content = {
                    html: description,
                    text: $$('div.TRS_Editor').text(),
                };
                item.language = language;

                return item;
            })
        )
    );

    const image = $('div.img_cursor a img').prop('src');

    return {
        title: $('title').text(),
        description: $('meta[name="apple-mobile-web-app-title"]').prop('content'),
        link: currentUrl,
        item: items,
        allowEmpty: true,
        image,
        author: $('meta[name="author"]').prop('content'),
        language,
    };
};

export const route: Route = {
    path: '/:category{.+}?',
    name: '分类',
    url: 'investor.org.cn',
    maintainers: ['nczitzk'],
    handler,
    example: '/investor/information_release/news_release_from_authorities/zjhfb',
    parameters: { category: '分类，默认为证监会发布 `information_release/news_release_from_authorities/zjhfb`，可在对应分类页 URL 中找到' },
    description: `:::tip
  若订阅 [证监会发布](https://www.investor.org.cn/information_release/news_release_from_authorities/zjhfb/)，网址为 \`https://www.investor.org.cn/information_release/news_release_from_authorities/zjhfb/\`。截取 \`https://www.investor.org.cn/\` 到末尾 \`/\` 的部分 \`information_release/news_release_from_authorities/zjhfb\` 作为参数填入，此时路由为 [\`/investor/information_release/news_release_from_authorities/zjhfb\`](https://rsshub.app/investor/information_release/news_release_from_authorities/zjhfb)。
  :::

  #### [权威发布](https://www.investor.org.cn/information_release/news_release_from_authorities/)

  | [证监会发布](https://www.investor.org.cn/information_release/news_release_from_authorities/zjhfb/)                                                                  | [证券交易所发布](https://www.investor.org.cn/information_release/news_release_from_authorities/hsjysfb/)                                                                | [期货交易所发布](https://www.investor.org.cn/information_release/news_release_from_authorities/qhjysfb/)                                                                | [行业协会发布](https://www.investor.org.cn/information_release/news_release_from_authorities/hyxhfb/)                                                                 | [其他](https://www.investor.org.cn/information_release/news_release_from_authorities/otner/)                                                                        |
  | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | [/investor/information_release/news_release_from_authorities/zjhfb/](https://rsshub.app/investor/investor/information_release/news_release_from_authorities/zjhfb/) | [/investor/information_release/news_release_from_authorities/hsjysfb/](https://rsshub.app/investor/investor/information_release/news_release_from_authorities/hsjysfb/) | [/investor/information_release/news_release_from_authorities/qhjysfb/](https://rsshub.app/investor/investor/information_release/news_release_from_authorities/qhjysfb/) | [/investor/information_release/news_release_from_authorities/hyxhfb/](https://rsshub.app/investor/investor/information_release/news_release_from_authorities/hyxhfb/) | [/investor/information_release/news_release_from_authorities/otner/](https://rsshub.app/investor/investor/information_release/news_release_from_authorities/otner/) |

  #### [市场资讯](https://www.investor.org.cn/information_release/market_news/)

  | [市场资讯](https://www.investor.org.cn/information_release/market_news/)                                   |
  | ---------------------------------------------------------------------------------------------------------- |
  | [/investor/information_release/market_news/](https://rsshub.app/investor/information_release/market_news/) |

  #### [政策解读](https://www.investor.org.cn/information_release/policy_interpretation/)

  | [政策解读](https://www.investor.org.cn/information_release/policy_interpretation/)                                  |
  | ------------------------------------------------------------------------------------------------------------------- |
  | [/investorinformation_release/policy_interpretation/](https://rsshub.appinformation_release/policy_interpretation/) |

  #### [国际交流](https://www.investor.org.cn/information_release/international_communication/)

  | [国际交流](https://www.investor.org.cn/information_release/international_communication/)                                          |
  | --------------------------------------------------------------------------------------------------------------------------------- |
  | [/investor/information_release/international_communication/](https://rsshub.app/information_release/international_communication/) |
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
            source: ['investor.org.cn/:category'],
            target: (params) => {
                const category = params.category;

                return `/investor${category ? `/${category}` : ''}`;
            },
        },
        {
            title: '权威发布 - 证监会发布',
            source: ['www.investor.org.cn/information_release/news_release_from_authorities/zjhfb/'],
            target: '/information_release/news_release_from_authorities/zjhfb/',
        },
        {
            title: '权威发布 - 证券交易所发布',
            source: ['www.investor.org.cn/information_release/news_release_from_authorities/hsjysfb/'],
            target: '/information_release/news_release_from_authorities/hsjysfb/',
        },
        {
            title: '权威发布 - 期货交易所发布',
            source: ['www.investor.org.cn/information_release/news_release_from_authorities/qhjysfb/'],
            target: '/information_release/news_release_from_authorities/qhjysfb/',
        },
        {
            title: '权威发布 - 行业协会发布',
            source: ['www.investor.org.cn/information_release/news_release_from_authorities/hyxhfb/'],
            target: '/information_release/news_release_from_authorities/hyxhfb/',
        },
        {
            title: '权威发布 - 其他',
            source: ['www.investor.org.cn/information_release/news_release_from_authorities/otner/'],
            target: '/information_release/news_release_from_authorities/otner/',
        },
        {
            title: '市场资讯',
            source: ['www.investor.org.cn/information_release/market_news/'],
            target: '/information_release/market_news/',
        },
        {
            title: '政策解读',
            source: ['www.investor.org.cn/information_release/policy_interpretation/'],
            target: '/information_release/policy_interpretation/',
        },
        {
            title: '国际交流',
            source: ['www.investor.org.cn/information_release/international_communication/'],
            target: '/information_release/international_communication/',
        },
    ],
};
