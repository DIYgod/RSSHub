import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

export const handler = async (ctx) => {
    const { category = 'news' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 10;

    const rootUrl = 'https://www.78dm.net';
    const currentUrl = new URL(category.includes('/') ? `${category}.html` : category, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const language = $('html').prop('lang');

    let items = $('section.box-content div.card a.card-title')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item).parent();

            const title = item.find('a.card-title').text();

            const src = item.find('a.card-image img').prop('data-src');
            const image = src?.startsWith('//') ? `https:${src}` : src;

            const description = art(path.join(__dirname, 'templates/description.art'), {
                images: image
                    ? [
                          {
                              src: image,
                              alt: title,
                          },
                      ]
                    : undefined,
            });
            const pubDate = item.find('div.card-info span.item').last().text();

            const href = item.find('a.card-title').prop('href');

            return {
                title,
                description,
                pubDate: pubDate && /\d{4}(?:\.\d{2}){2}\s\d{2}:\d{2}/.test(pubDate) ? timezone(parseDate(pubDate, 'YYYY.MM.DD HH:mm'), +8) : undefined,
                link: href?.startsWith('//') ? `https:${href}` : href,
                category: [
                    ...new Set([
                        ...item
                            .find('span.tag-title')
                            .toArray()
                            .map((c) => $(c).text()),
                        item.find('div.card-info span.item').first().text(),
                    ]),
                ].filter(Boolean),
                image,
                banner: image,
                language,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const $$ = load(detailResponse);

                $$('i.p-status').remove();

                $$('div.image-text-content p img.lazy').each((_, el) => {
                    el = $$(el);

                    const src = el.prop('data-src');
                    const image = src?.startsWith('//') ? `https:${src}` : src;

                    el.parent().replaceWith(
                        art(path.join(__dirname, 'templates/description.art'), {
                            images: image
                                ? [
                                      {
                                          src: image,
                                          alt: el.prop('title') ?? '',
                                      },
                                  ]
                                : undefined,
                        })
                    );
                });

                const title = $$('h2.title').text();
                const description =
                    item.description +
                    art(path.join(__dirname, 'templates/description.art'), {
                        description: $$('div.image-text-content').first().html(),
                    });

                item.title = title;
                item.description = description;
                item.pubDate = timezone(parseDate($$('p.push-time').text().split(/：/).pop()), +8);
                item.author = $$('a.push-username').contents().first().text();
                item.content = {
                    html: description,
                    text: $$('div.image-text-content').first().text(),
                };
                item.language = language;

                return item;
            })
        )
    );

    const title = $('title').text();
    const image = new URL($('a.logo img').prop('src'), rootUrl).href;

    return {
        title: `${title} | ${$('div.actived').text()}`,
        description: $('meta[name="description"]').prop('content'),
        link: currentUrl,
        item: items,
        allowEmpty: true,
        image,
        author: $('meta[property="og:site_name"]').prop('content'),
        language,
    };
};

export const route: Route = {
    path: '/:category{.+}?',
    name: '分类',
    url: '78dm.net',
    maintainers: ['nczitzk'],
    handler,
    example: '/78dm/news',
    parameters: { category: '分类，默认为 `news`，即新品速递，可在对应分类页 URL 中找到' },
    description: `::: tip
  若订阅 [新品速递](https://www.78dm.net/news)，网址为 \`https://www.78dm.net/news\`。截取 \`https://www.78dm.net/\` 到末尾的部分 \`news\` 作为参数填入，此时路由为 [\`/78dm/news\`](https://rsshub.app/78dm/news)。

  若订阅 [精彩评测 - 变形金刚](https://www.78dm.net/eval_list/109/0/0/1.html)，网址为 \`https://www.78dm.net/eval_list/109/0/0/1.html\`。截取 \`https://www.78dm.net/\` 到末尾 \`.html\` 的部分 \`eval_list/109/0/0/1\` 作为参数填入，此时路由为 [\`/78dm/eval_list/109/0/0/1\`](https://rsshub.app/78dm/eval_list/109/0/0/1)。
:::

<details>
<summary>更多分类</summary>

#### [新品速递](https://www.78dm.net/news)

| 分类                                                           | ID                                                                     |
| -------------------------------------------------------------- | ---------------------------------------------------------------------- |
| [全部](https://www.78dm.net/news/0/0/0/0/0/0/0/1.html)         | [news/0/0/0/0/0/0/0/1](https://rsshub.app/78dm/news/0/0/0/0/0/0/0/1)   |
| [变形金刚](https://www.78dm.net/news/3/0/0/0/0/0/0/1.html)     | [news/3/0/0/0/0/0/0/1](https://rsshub.app/78dm/news/3/0/0/0/0/0/0/1)   |
| [高达](https://www.78dm.net/news/4/0/0/0/0/0/0/1.html)         | [news/4/0/0/0/0/0/0/1](https://rsshub.app/78dm/news/4/0/0/0/0/0/0/1)   |
| [圣斗士](https://www.78dm.net/news/2/0/0/0/0/0/0/1.html)       | [news/2/0/0/0/0/0/0/1](https://rsshub.app/78dm/news/2/0/0/0/0/0/0/1)   |
| [海贼王](https://www.78dm.net/news/8/0/0/0/0/0/0/1.html)       | [news/8/0/0/0/0/0/0/1](https://rsshub.app/78dm/news/8/0/0/0/0/0/0/1)   |
| [PVC 手办](https://www.78dm.net/news/0/5/0/0/0/0/0/1.html)     | [news/0/5/0/0/0/0/0/1](https://rsshub.app/78dm/news/0/5/0/0/0/0/0/1)   |
| [拼装模型](https://www.78dm.net/news/0/1/0/0/0/0/0/1.html)     | [news/0/1/0/0/0/0/0/1](https://rsshub.app/78dm/news/0/1/0/0/0/0/0/1)   |
| [机甲成品](https://www.78dm.net/news/0/2/0/0/0/0/0/1.html)     | [news/0/2/0/0/0/0/0/1](https://rsshub.app/78dm/news/0/2/0/0/0/0/0/1)   |
| [特摄](https://www.78dm.net/news/0/3/0/0/0/0/0/1.html)         | [news/0/3/0/0/0/0/0/1](https://rsshub.app/78dm/news/0/3/0/0/0/0/0/1)   |
| [美系](https://www.78dm.net/news/0/4/0/0/0/0/0/1.html)         | [news/0/4/0/0/0/0/0/1](https://rsshub.app/78dm/news/0/4/0/0/0/0/0/1)   |
| [GK](https://www.78dm.net/news/0/6/0/0/0/0/0/1.html)           | [news/0/6/0/0/0/0/0/1](https://rsshub.app/78dm/news/0/6/0/0/0/0/0/1)   |
| [扭蛋盒蛋食玩](https://www.78dm.net/news/0/7/0/0/0/0/0/1.html) | [news/0/7/0/0/0/0/0/1](https://rsshub.app/78dm/news/0/7/0/0/0/0/0/1)   |
| [其他](https://www.78dm.net/news/0/8/0/0/0/0/0/1.html)         | [news/0/8/0/0/0/0/0/1](https://rsshub.app/78dm/news/0/8/0/0/0/0/0/1)   |
| [综合](https://www.78dm.net/news/0/9/0/0/0/0/0/1.html)         | [news/0/9/0/0/0/0/0/1](https://rsshub.app/78dm/news/0/9/0/0/0/0/0/1)   |
| [军模](https://www.78dm.net/news/0/10/0/0/0/0/0/1.html)        | [news/0/10/0/0/0/0/0/1](https://rsshub.app/78dm/news/0/10/0/0/0/0/0/1) |
| [民用](https://www.78dm.net/news/0/11/0/0/0/0/0/1.html)        | [news/0/11/0/0/0/0/0/1](https://rsshub.app/78dm/news/0/11/0/0/0/0/0/1) |
| [配件](https://www.78dm.net/news/0/12/0/0/0/0/0/1.html)        | [news/0/12/0/0/0/0/0/1](https://rsshub.app/78dm/news/0/12/0/0/0/0/0/1) |
| [工具](https://www.78dm.net/news/0/13/0/0/0/0/0/1.html)        | [news/0/13/0/0/0/0/0/1](https://rsshub.app/78dm/news/0/13/0/0/0/0/0/1) |

#### [精彩评测](https://www.78dm.net/eval_list)

| 分类                                                      | ID                                                                 |
| --------------------------------------------------------- | ------------------------------------------------------------------ |
| [全部](https://www.78dm.net/eval_list/0/0/0/1.html)       | [eval_list/0/0/0/1](https://rsshub.app/78dm/eval_list/0/0/0/1)     |
| [变形金刚](https://www.78dm.net/eval_list/109/0/0/1.html) | [eval_list/109/0/0/1](https://rsshub.app/78dm/eval_list/109/0/0/1) |
| [高达](https://www.78dm.net/eval_list/110/0/0/1.html)     | [eval_list/110/0/0/1](https://rsshub.app/78dm/eval_list/110/0/0/1) |
| [圣斗士](https://www.78dm.net/eval_list/111/0/0/1.html)   | [eval_list/111/0/0/1](https://rsshub.app/78dm/eval_list/111/0/0/1) |
| [海贼王](https://www.78dm.net/eval_list/112/0/0/1.html)   | [eval_list/112/0/0/1](https://rsshub.app/78dm/eval_list/112/0/0/1) |
| [PVC 手办](https://www.78dm.net/eval_list/115/0/0/1.html) | [eval_list/115/0/0/1](https://rsshub.app/78dm/eval_list/115/0/0/1) |
| [拼装模型](https://www.78dm.net/eval_list/113/0/0/1.html) | [eval_list/113/0/0/1](https://rsshub.app/78dm/eval_list/113/0/0/1) |
| [机甲成品](https://www.78dm.net/eval_list/114/0/0/1.html) | [eval_list/114/0/0/1](https://rsshub.app/78dm/eval_list/114/0/0/1) |
| [特摄](https://www.78dm.net/eval_list/116/0/0/1.html)     | [eval_list/116/0/0/1](https://rsshub.app/78dm/eval_list/116/0/0/1) |
| [美系](https://www.78dm.net/eval_list/117/0/0/1.html)     | [eval_list/117/0/0/1](https://rsshub.app/78dm/eval_list/117/0/0/1) |
| [GK](https://www.78dm.net/eval_list/118/0/0/1.html)       | [eval_list/118/0/0/1](https://rsshub.app/78dm/eval_list/118/0/0/1) |
| [综合](https://www.78dm.net/eval_list/120/0/0/1.html)     | [eval_list/120/0/0/1](https://rsshub.app/78dm/eval_list/120/0/0/1) |

#### [好贴推荐](https://www.78dm.net/ht_list)

| 分类                                                    | ID                                                             |
| ------------------------------------------------------- | -------------------------------------------------------------- |
| [全部](https://www.78dm.net/ht_list/0/0/0/1.html)       | [ht_list/0/0/0/1](https://rsshub.app/78dm/ht_list/0/0/0/1)     |
| [变形金刚](https://www.78dm.net/ht_list/95/0/0/1.html)  | [ht_list/95/0/0/1](https://rsshub.app/78dm/ht_list/95/0/0/1)   |
| [高达](https://www.78dm.net/ht_list/96/0/0/1.html)      | [ht_list/96/0/0/1](https://rsshub.app/78dm/ht_list/96/0/0/1)   |
| [圣斗士](https://www.78dm.net/ht_list/98/0/0/1.html)    | [ht_list/98/0/0/1](https://rsshub.app/78dm/ht_list/98/0/0/1)   |
| [海贼王](https://www.78dm.net/ht_list/99/0/0/1.html)    | [ht_list/99/0/0/1](https://rsshub.app/78dm/ht_list/99/0/0/1)   |
| [PVC 手办](https://www.78dm.net/ht_list/100/0/0/1.html) | [ht_list/100/0/0/1](https://rsshub.app/78dm/ht_list/100/0/0/1) |
| [拼装模型](https://www.78dm.net/ht_list/101/0/0/1.html) | [ht_list/101/0/0/1](https://rsshub.app/78dm/ht_list/101/0/0/1) |
| [机甲成品](https://www.78dm.net/ht_list/102/0/0/1.html) | [ht_list/102/0/0/1](https://rsshub.app/78dm/ht_list/102/0/0/1) |
| [特摄](https://www.78dm.net/ht_list/103/0/0/1.html)     | [ht_list/103/0/0/1](https://rsshub.app/78dm/ht_list/103/0/0/1) |
| [美系](https://www.78dm.net/ht_list/104/0/0/1.html)     | [ht_list/104/0/0/1](https://rsshub.app/78dm/ht_list/104/0/0/1) |
| [GK](https://www.78dm.net/ht_list/105/0/0/1.html)       | [ht_list/105/0/0/1](https://rsshub.app/78dm/ht_list/105/0/0/1) |
| [综合](https://www.78dm.net/ht_list/107/0/0/1.html)     | [ht_list/107/0/0/1](https://rsshub.app/78dm/ht_list/107/0/0/1) |
| [装甲战车](https://www.78dm.net/ht_list/131/0/0/1.html) | [ht_list/131/0/0/1](https://rsshub.app/78dm/ht_list/131/0/0/1) |
| [舰船模型](https://www.78dm.net/ht_list/132/0/0/1.html) | [ht_list/132/0/0/1](https://rsshub.app/78dm/ht_list/132/0/0/1) |
| [飞机模型](https://www.78dm.net/ht_list/133/0/0/1.html) | [ht_list/133/0/0/1](https://rsshub.app/78dm/ht_list/133/0/0/1) |
| [民用模型](https://www.78dm.net/ht_list/134/0/0/1.html) | [ht_list/134/0/0/1](https://rsshub.app/78dm/ht_list/134/0/0/1) |
| [兵人模型](https://www.78dm.net/ht_list/135/0/0/1.html) | [ht_list/135/0/0/1](https://rsshub.app/78dm/ht_list/135/0/0/1) |
</details>
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
            source: ['www.78dm.net/:category?'],
            target: (params) => {
                const category = params.category?.replace(/\.html$/, '');

                return `/78dm${category ? `/${category}` : ''}`;
            },
        },
        {
            title: '新品速递 - 全部',
            source: ['www.78dm.net/news/0/0/0/0/0/0/0/1.html'],
            target: '/news/0/0/0/0/0/0/0/1',
        },
        {
            title: '新品速递 - 变形金刚',
            source: ['www.78dm.net/news/3/0/0/0/0/0/0/1.html'],
            target: '/news/3/0/0/0/0/0/0/1',
        },
        {
            title: '新品速递 - 高达',
            source: ['www.78dm.net/news/4/0/0/0/0/0/0/1.html'],
            target: '/news/4/0/0/0/0/0/0/1',
        },
        {
            title: '新品速递 - 圣斗士',
            source: ['www.78dm.net/news/2/0/0/0/0/0/0/1.html'],
            target: '/news/2/0/0/0/0/0/0/1',
        },
        {
            title: '新品速递 - 海贼王',
            source: ['www.78dm.net/news/8/0/0/0/0/0/0/1.html'],
            target: '/news/8/0/0/0/0/0/0/1',
        },
        {
            title: '新品速递 - PVC手办',
            source: ['www.78dm.net/news/0/5/0/0/0/0/0/1.html'],
            target: '/news/0/5/0/0/0/0/0/1',
        },
        {
            title: '新品速递 - 拼装模型',
            source: ['www.78dm.net/news/0/1/0/0/0/0/0/1.html'],
            target: '/news/0/1/0/0/0/0/0/1',
        },
        {
            title: '新品速递 - 机甲成品',
            source: ['www.78dm.net/news/0/2/0/0/0/0/0/1.html'],
            target: '/news/0/2/0/0/0/0/0/1',
        },
        {
            title: '新品速递 - 特摄',
            source: ['www.78dm.net/news/0/3/0/0/0/0/0/1.html'],
            target: '/news/0/3/0/0/0/0/0/1',
        },
        {
            title: '新品速递 - 美系',
            source: ['www.78dm.net/news/0/4/0/0/0/0/0/1.html'],
            target: '/news/0/4/0/0/0/0/0/1',
        },
        {
            title: '新品速递 - GK',
            source: ['www.78dm.net/news/0/6/0/0/0/0/0/1.html'],
            target: '/news/0/6/0/0/0/0/0/1',
        },
        {
            title: '新品速递 - 扭蛋盒蛋食玩',
            source: ['www.78dm.net/news/0/7/0/0/0/0/0/1.html'],
            target: '/news/0/7/0/0/0/0/0/1',
        },
        {
            title: '新品速递 - 其他',
            source: ['www.78dm.net/news/0/8/0/0/0/0/0/1.html'],
            target: '/news/0/8/0/0/0/0/0/1',
        },
        {
            title: '新品速递 - 综合',
            source: ['www.78dm.net/news/0/9/0/0/0/0/0/1.html'],
            target: '/news/0/9/0/0/0/0/0/1',
        },
        {
            title: '新品速递 - 军模',
            source: ['www.78dm.net/news/0/10/0/0/0/0/0/1.html'],
            target: '/news/0/10/0/0/0/0/0/1',
        },
        {
            title: '新品速递 - 民用',
            source: ['www.78dm.net/news/0/11/0/0/0/0/0/1.html'],
            target: '/news/0/11/0/0/0/0/0/1',
        },
        {
            title: '新品速递 - 配件',
            source: ['www.78dm.net/news/0/12/0/0/0/0/0/1.html'],
            target: '/news/0/12/0/0/0/0/0/1',
        },
        {
            title: '新品速递 - 工具',
            source: ['www.78dm.net/news/0/13/0/0/0/0/0/1.html'],
            target: '/news/0/13/0/0/0/0/0/1',
        },
        {
            title: '精彩评测 - 全部',
            source: ['www.78dm.net/eval_list/0/0/0/1.html'],
            target: '/eval_list/0/0/0/1',
        },
        {
            title: '精彩评测 - 变形金刚',
            source: ['www.78dm.net/eval_list/109/0/0/1.html'],
            target: '/eval_list/109/0/0/1',
        },
        {
            title: '精彩评测 - 高达',
            source: ['www.78dm.net/eval_list/110/0/0/1.html'],
            target: '/eval_list/110/0/0/1',
        },
        {
            title: '精彩评测 - 圣斗士',
            source: ['www.78dm.net/eval_list/111/0/0/1.html'],
            target: '/eval_list/111/0/0/1',
        },
        {
            title: '精彩评测 - 海贼王',
            source: ['www.78dm.net/eval_list/112/0/0/1.html'],
            target: '/eval_list/112/0/0/1',
        },
        {
            title: '精彩评测 - PVC手办',
            source: ['www.78dm.net/eval_list/115/0/0/1.html'],
            target: '/eval_list/115/0/0/1',
        },
        {
            title: '精彩评测 - 拼装模型',
            source: ['www.78dm.net/eval_list/113/0/0/1.html'],
            target: '/eval_list/113/0/0/1',
        },
        {
            title: '精彩评测 - 机甲成品',
            source: ['www.78dm.net/eval_list/114/0/0/1.html'],
            target: '/eval_list/114/0/0/1',
        },
        {
            title: '精彩评测 - 特摄',
            source: ['www.78dm.net/eval_list/116/0/0/1.html'],
            target: '/eval_list/116/0/0/1',
        },
        {
            title: '精彩评测 - 美系',
            source: ['www.78dm.net/eval_list/117/0/0/1.html'],
            target: '/eval_list/117/0/0/1',
        },
        {
            title: '精彩评测 - GK',
            source: ['www.78dm.net/eval_list/118/0/0/1.html'],
            target: '/eval_list/118/0/0/1',
        },
        {
            title: '精彩评测 - 综合',
            source: ['www.78dm.net/eval_list/120/0/0/1.html'],
            target: '/eval_list/120/0/0/1',
        },
        {
            title: '好贴推荐 - 全部',
            source: ['www.78dm.net/ht_list/0/0/0/1.html'],
            target: '/ht_list/0/0/0/1',
        },
        {
            title: '好贴推荐 - 变形金刚',
            source: ['www.78dm.net/ht_list/95/0/0/1.html'],
            target: '/ht_list/95/0/0/1',
        },
        {
            title: '好贴推荐 - 高达',
            source: ['www.78dm.net/ht_list/96/0/0/1.html'],
            target: '/ht_list/96/0/0/1',
        },
        {
            title: '好贴推荐 - 圣斗士',
            source: ['www.78dm.net/ht_list/98/0/0/1.html'],
            target: '/ht_list/98/0/0/1',
        },
        {
            title: '好贴推荐 - 海贼王',
            source: ['www.78dm.net/ht_list/99/0/0/1.html'],
            target: '/ht_list/99/0/0/1',
        },
        {
            title: '好贴推荐 - PVC手办',
            source: ['www.78dm.net/ht_list/100/0/0/1.html'],
            target: '/ht_list/100/0/0/1',
        },
        {
            title: '好贴推荐 - 拼装模型',
            source: ['www.78dm.net/ht_list/101/0/0/1.html'],
            target: '/ht_list/101/0/0/1',
        },
        {
            title: '好贴推荐 - 机甲成品',
            source: ['www.78dm.net/ht_list/102/0/0/1.html'],
            target: '/ht_list/102/0/0/1',
        },
        {
            title: '好贴推荐 - 特摄',
            source: ['www.78dm.net/ht_list/103/0/0/1.html'],
            target: '/ht_list/103/0/0/1',
        },
        {
            title: '好贴推荐 - 美系',
            source: ['www.78dm.net/ht_list/104/0/0/1.html'],
            target: '/ht_list/104/0/0/1',
        },
        {
            title: '好贴推荐 - GK',
            source: ['www.78dm.net/ht_list/105/0/0/1.html'],
            target: '/ht_list/105/0/0/1',
        },
        {
            title: '好贴推荐 - 综合',
            source: ['www.78dm.net/ht_list/107/0/0/1.html'],
            target: '/ht_list/107/0/0/1',
        },
        {
            title: '好贴推荐 - 装甲战车',
            source: ['www.78dm.net/ht_list/131/0/0/1.html'],
            target: '/ht_list/131/0/0/1',
        },
        {
            title: '好贴推荐 - 舰船模型',
            source: ['www.78dm.net/ht_list/132/0/0/1.html'],
            target: '/ht_list/132/0/0/1',
        },
        {
            title: '好贴推荐 - 飞机模型',
            source: ['www.78dm.net/ht_list/133/0/0/1.html'],
            target: '/ht_list/133/0/0/1',
        },
        {
            title: '好贴推荐 - 民用模型',
            source: ['www.78dm.net/ht_list/134/0/0/1.html'],
            target: '/ht_list/134/0/0/1',
        },
        {
            title: '好贴推荐 - 兵人模型',
            source: ['www.78dm.net/ht_list/135/0/0/1.html'],
            target: '/ht_list/135/0/0/1',
        },
    ],
};
