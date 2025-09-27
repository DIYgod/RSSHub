import { type Data, type DataItem, type Route, ViewType } from '@/types';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { type CheerioAPI, type Cheerio, load } from 'cheerio';
import type { Element } from 'domhandler';
import { type Context } from 'hono';
import iconv from 'iconv-lite';

export const handler = async (ctx: Context): Promise<Data> => {
    const { category = 'dy' } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '25', 10);

    const encoding: string = 'gb2312';

    const baseUrl: string = 'https://www.hao6v.me';
    const targetUrl: string = new URL(category.startsWith('gvod') ? `${category}.html` : category, baseUrl).href;

    const response = await ofetch(targetUrl, {
        responseType: 'arrayBuffer',
    });
    const $: CheerioAPI = load(iconv.decode(Buffer.from(response), encoding));
    const language = $('html').attr('lang') ?? 'zh';

    let items: DataItem[] = [];

    items = $('ul.list li')
        .slice(0, limit)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el);

            const title: string = $el.find('a').text();
            const pubDateStr: string | undefined = $el
                .find('span')
                .text()
                .replaceAll(/(\[|\])/g, '');
            const linkUrl: string | undefined = $el.find('a').attr('href');
            const guid: string = `${linkUrl}#${title}`;
            const upDatedStr: string | undefined = pubDateStr;

            const processedItem: DataItem = {
                title,
                pubDate: pubDateStr ? parseDate(pubDateStr, ['MM-DD', 'YYYY-MM-DD']) : undefined,
                link: linkUrl ? new URL(linkUrl, baseUrl).href : undefined,
                guid,
                id: guid,
                updated: upDatedStr ? parseDate(upDatedStr, ['MM-DD', 'YYYY-MM-DD']) : undefined,
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
                const detailResponse = await ofetch(item.link, {
                    responseType: 'arrayBuffer',
                });
                const $$: CheerioAPI = load(iconv.decode(Buffer.from(detailResponse), encoding));

                $$('div#endText div.fl').remove();
                $$('div#endText div.fr').remove();
                $$('div#endText div.cr').remove();

                $$('div#endText div.tps').remove();
                $$('div#endText div.downtps').remove();

                const title: string = $$('h1').text();
                const description: string | undefined = $$('div#endText').html() ?? undefined;
                const pubDateStr: string | undefined = item.link?.match(/\/(\d{4}-\d{2}-\d{2})\/\d+\.html/)?.[1];
                const categoryEls: Element[] = $$('div#endText p a').toArray();
                const categories: string[] = [...new Set(categoryEls.map((el) => $$(el).text()?.trim()).filter(Boolean))];
                const image: string | undefined = $$('div#endText p img').attr('src');
                const upDatedStr: string | undefined = pubDateStr;

                let processedItem: DataItem = {
                    title,
                    description,
                    pubDate: pubDateStr ? parseDate(pubDateStr) : item.pubDate,
                    category: categories,
                    content: {
                        html: description,
                        text: description,
                    },
                    image,
                    banner: image,
                    updated: upDatedStr ? parseDate(upDatedStr) : item.updated,
                    language,
                };

                const $enclosureEl: Cheerio<Element> = $$('td a[href^="magnet"]').last();
                const enclosureUrl: string | undefined = $enclosureEl.attr('href');

                if (enclosureUrl) {
                    const enclosureType: string = 'application/x-bittorrent';
                    const enclosureTitle: string = $enclosureEl.text();

                    processedItem = {
                        ...processedItem,
                        enclosure_url: enclosureUrl,
                        enclosure_type: enclosureType,
                        enclosure_title: enclosureTitle || title,
                    };
                }

                return {
                    ...item,
                    ...processedItem,
                };
            });
        })
    );

    return {
        title: `${$('title').text().split(/，/).pop()} - ${$('div.t a').last().text()}`,
        description: $('meta[name="description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: new URL('images/logo.gif', baseUrl).href,
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/:category{.+}?',
    name: '分类',
    url: 'www.hao6v.me',
    maintainers: ['nczitzk'],
    handler,
    example: '/6v123/dy',
    parameters: {
        category: {
            description: '分类，默认为 `dy`，即最新电影，可在对应分类页 URL 中找到',
            options: [
                {
                    label: '最新电影',
                    value: 'dy',
                },
                {
                    label: '国语配音电影',
                    value: 'gydy',
                },
                {
                    label: '动漫新番',
                    value: 'zydy',
                },
                {
                    label: '经典高清',
                    value: 'gq',
                },
                {
                    label: '动画电影',
                    value: 'jddy',
                },
                {
                    label: '3D 电影',
                    value: '3D',
                },
                {
                    label: '真人秀',
                    value: 'shoujidianyingmp4',
                },
                {
                    label: '国剧',
                    value: 'dlz',
                },
                {
                    label: '日韩剧',
                    value: 'rj',
                },
                {
                    label: '欧美剧',
                    value: 'mj',
                },
                {
                    label: '综艺节目',
                    value: 'zy',
                },
                {
                    label: '港台电影',
                    value: 's/gangtaidianying',
                },
                {
                    label: '日韩电影',
                    value: 's/jingdiandianying',
                },
                {
                    label: '喜剧',
                    value: 's/xiju',
                },
                {
                    label: '动作',
                    value: 's/dongzuo',
                },
                {
                    label: '爱情',
                    value: 's/aiqing',
                },
                {
                    label: '科幻',
                    value: 's/kehuan',
                },
                {
                    label: '奇幻',
                    value: 's/qihuan',
                },
                {
                    label: '神秘',
                    value: 's/shenmi',
                },
                {
                    label: '幻想',
                    value: 's/huanxiang',
                },
                {
                    label: '恐怖',
                    value: 's/kongbu',
                },
                {
                    label: '战争',
                    value: 's/zhanzheng',
                },
                {
                    label: '冒险',
                    value: 's/maoxian',
                },
                {
                    label: '惊悚',
                    value: 's/jingsong',
                },
                {
                    label: '剧情',
                    value: 's/juqingpian',
                },
                {
                    label: '传记',
                    value: 's/zhuanji',
                },
                {
                    label: '历史',
                    value: 's/lishi',
                },
                {
                    label: '纪录',
                    value: 's/jilu',
                },
                {
                    label: '印度电影',
                    value: 's/yindudianying',
                },
                {
                    label: '国产电影',
                    value: 's/guochandianying',
                },
                {
                    label: '欧洲电影',
                    value: 's/xijudianying',
                },
            ],
        },
    },
    description: `::: tip
订阅 [最新电影](https://www.hao6v.me/dy/)，其源网址为 \`https://www.hao6v.me/dy/\`，请参考该 URL 指定部分构成参数，此时路由为 [\`/6v123/dy\`](https://rsshub.app/6v123/dy)。
:::

<details>
  <summary>更多分类</summary>

| 分类                                                 | ID                                                                |
| ---------------------------------------------------- | ----------------------------------------------------------------- |
| [最新电影](https://www.hao6v.me/dy/)                 | [dy](https://rsshub.app/6v123/dy)                                 |
| [国语配音电影](https://www.hao6v.me/gydy/)           | [gydy](https://rsshub.app/6v123/gydy)                             |
| [动漫新番](https://www.hao6v.me/zydy/)               | [zydy](https://rsshub.app/6v123/zydy)                             |
| [经典高清](https://www.hao6v.me/gq/)                 | [gq](https://rsshub.app/6v123/gq)                                 |
| [动画电影](https://www.hao6v.me/jddy/)               | [jddy](https://rsshub.app/6v123/jddy)                             |
| [3D 电影](https://www.hao6v.me/3D/)                  | [3D](https://rsshub.app/6v123/3D)                                 |
| [真人秀](https://www.hao6v.me/shoujidianyingmp4/)    | [shoujidianyingmp4](https://rsshub.app/6v123/shoujidianyingmp4)   |
| [国剧](https://www.hao6v.me/dlz/)                    | [dlz](https://rsshub.app/6v123/dlz)                               |
| [日韩剧](https://www.hao6v.me/rj/)                   | [rj](https://rsshub.app/6v123/rj)                                 |
| [欧美剧](https://www.hao6v.me/mj/)                   | [mj](https://rsshub.app/6v123/mj)                                 |
| [综艺节目](https://www.hao6v.me/zy/)                 | [zy](https://rsshub.app/6v123/zy)                                 |
| [港台电影](https://www.hao6v.me/s/gangtaidianying/)  | [s/gangtaidianying](https://rsshub.app/6v123/s/gangtaidianying)   |
| [日韩电影](https://www.hao6v.me/s/jingdiandianying/) | [s/jingdiandianying](https://rsshub.app/6v123/s/jingdiandianying) |
| [喜剧](https://www.hao6v.me/s/xiju/)                 | [s/xiju](https://rsshub.app/6v123/s/xiju)                         |
| [动作](https://www.hao6v.me/s/dongzuo/)              | [s/dongzuo](https://rsshub.app/6v123/s/dongzuo)                   |
| [爱情](https://www.hao6v.me/s/aiqing/)               | [s/aiqing](https://rsshub.app/6v123/s/aiqing)                     |
| [科幻](https://www.hao6v.me/s/kehuan/)               | [s/kehuan](https://rsshub.app/6v123/s/kehuan)                     |
| [奇幻](https://www.hao6v.me/s/qihuan/)               | [s/qihuan](https://rsshub.app/6v123/s/qihuan)                     |
| [神秘](https://www.hao6v.me/s/shenmi/)               | [s/shenmi](https://rsshub.app/6v123/s/shenmi)                     |
| [幻想](https://www.hao6v.me/s/huanxiang/)            | [s/huanxiang](https://rsshub.app/6v123/s/huanxiang)               |
| [恐怖](https://www.hao6v.me/s/kongbu/)               | [s/kongbu](https://rsshub.app/6v123/s/kongbu)                     |
| [战争](https://www.hao6v.me/s/zhanzheng/)            | [s/zhanzheng](https://rsshub.app/6v123/s/zhanzheng)               |
| [冒险](https://www.hao6v.me/s/maoxian/)              | [s/maoxian](https://rsshub.app/6v123/s/maoxian)                   |
| [惊悚](https://www.hao6v.me/s/jingsong/)             | [s/jingsong](https://rsshub.app/6v123/s/jingsong)                 |
| [剧情](https://www.hao6v.me/s/juqingpian/)           | [s/juqingpian](https://rsshub.app/6v123/s/juqingpian)             |
| [传记](https://www.hao6v.me/s/zhuanji/)              | [s/zhuanji](https://rsshub.app/6v123/s/zhuanji)                   |
| [历史](https://www.hao6v.me/s/lishi/)                | [s/lishi](https://rsshub.app/6v123/s/lishi)                       |
| [纪录](https://www.hao6v.me/s/jilu/)                 | [s/jilu](https://rsshub.app/6v123/s/jilu)                         |
| [印度电影](https://www.hao6v.me/s/yindudianying/)    | [s/yindudianying](https://rsshub.app/6v123/s/yindudianying)       |
| [国产电影](https://www.hao6v.me/s/guochandianying/)  | [s/guochandianying](https://rsshub.app/6v123/s/guochandianying)   |
| [欧洲电影](https://www.hao6v.me/s/xijudianying/)     | [s/xijudianying](https://rsshub.app/6v123/s/xijudianying)         |

</details>
`,
    categories: ['multimedia'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: true,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.hao6v.me/:category'],
            target: '/:category',
        },
        {
            title: '最新电影',
            source: ['www.hao6v.me/dy/'],
            target: '/dy',
        },
        {
            title: '国语配音电影',
            source: ['www.hao6v.me/gydy/'],
            target: '/gydy',
        },
        {
            title: '动漫新番',
            source: ['www.hao6v.me/zydy/'],
            target: '/zydy',
        },
        {
            title: '经典高清',
            source: ['www.hao6v.me/gq/'],
            target: '/gq',
        },
        {
            title: '动画电影',
            source: ['www.hao6v.me/jddy/'],
            target: '/jddy',
        },
        {
            title: '3D电影',
            source: ['www.hao6v.me/3D/'],
            target: '/3D',
        },
        {
            title: '真人秀',
            source: ['www.hao6v.me/shoujidianyingmp4/'],
            target: '/shoujidianyingmp4',
        },
        {
            title: '国剧',
            source: ['www.hao6v.me/dlz/'],
            target: '/dlz',
        },
        {
            title: '日韩剧',
            source: ['www.hao6v.me/rj/'],
            target: '/rj',
        },
        {
            title: '欧美剧',
            source: ['www.hao6v.me/mj/'],
            target: '/mj',
        },
        {
            title: '综艺节目',
            source: ['www.hao6v.me/zy/'],
            target: '/zy',
        },
        {
            title: '港台电影',
            source: ['www.hao6v.me/s/gangtaidianying/'],
            target: '/s/gangtaidianying',
        },
        {
            title: '日韩电影',
            source: ['www.hao6v.me/s/jingdiandianying/'],
            target: '/s/jingdiandianying',
        },
        {
            title: '喜剧',
            source: ['www.hao6v.me/s/xiju/'],
            target: '/s/xiju',
        },
        {
            title: '动作',
            source: ['www.hao6v.me/s/dongzuo/'],
            target: '/s/dongzuo',
        },
        {
            title: '爱情',
            source: ['www.hao6v.me/s/aiqing/'],
            target: '/s/aiqing',
        },
        {
            title: '科幻',
            source: ['www.hao6v.me/s/kehuan/'],
            target: '/s/kehuan',
        },
        {
            title: '奇幻',
            source: ['www.hao6v.me/s/qihuan/'],
            target: '/s/qihuan',
        },
        {
            title: '神秘',
            source: ['www.hao6v.me/s/shenmi/'],
            target: '/s/shenmi',
        },
        {
            title: '幻想',
            source: ['www.hao6v.me/s/huanxiang/'],
            target: '/s/huanxiang',
        },
        {
            title: '恐怖',
            source: ['www.hao6v.me/s/kongbu/'],
            target: '/s/kongbu',
        },
        {
            title: '战争',
            source: ['www.hao6v.me/s/zhanzheng/'],
            target: '/s/zhanzheng',
        },
        {
            title: '冒险',
            source: ['www.hao6v.me/s/maoxian/'],
            target: '/s/maoxian',
        },
        {
            title: '惊悚',
            source: ['www.hao6v.me/s/jingsong/'],
            target: '/s/jingsong',
        },
        {
            title: '剧情',
            source: ['www.hao6v.me/s/juqingpian/'],
            target: '/s/juqingpian',
        },
        {
            title: '传记',
            source: ['www.hao6v.me/s/zhuanji/'],
            target: '/s/zhuanji',
        },
        {
            title: '历史',
            source: ['www.hao6v.me/s/lishi/'],
            target: '/s/lishi',
        },
        {
            title: '纪录',
            source: ['www.hao6v.me/s/jilu/'],
            target: '/s/jilu',
        },
        {
            title: '印度电影',
            source: ['www.hao6v.me/s/yindudianying/'],
            target: '/s/yindudianying',
        },
        {
            title: '国产电影',
            source: ['www.hao6v.me/s/guochandianying/'],
            target: '/s/guochandianying',
        },
        {
            title: '欧洲电影',
            source: ['www.hao6v.me/s/xijudianying/'],
            target: '/s/xijudianying',
        },
    ],
    view: ViewType.Articles,
};
