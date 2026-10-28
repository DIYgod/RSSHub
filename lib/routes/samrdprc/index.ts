import { type Cheerio, type CheerioAPI, load } from 'cheerio';
import { type AnyNode, cloneNode, Document, type Element } from 'domhandler';
import type { Context } from 'hono';
import pMap from 'p-map';

import { type Data, type DataItem, type Language, type Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

import { baseUrl, loadList } from './utils';

export const handler = async (ctx: Context): Promise<Data> => {
    const { id = 'gnxw' } = ctx.req.param();
    const limit = getRouteLimit(ctx, 17);

    const targetUrl = `${baseUrl}/${id.endsWith('/') ? id : `${id}/`}`;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = ($('html').attr('lang') ?? 'zh') as Language;

    const $list: CheerioAPI = await loadList($);

    let items: DataItem[] = $list('.page-content ul li')
        .slice(0, limit)
        .toArray()
        .map((el) => {
            const $el: Cheerio<Element> = $list(el);
            const $aEl: Cheerio<Element> = $el.find('a').first();

            const title: string = $aEl.text();
            const pubDateStr: string | undefined = $el.find('span').text();
            const linkUrl: string | undefined = $aEl.attr('href');

            const processedItem: DataItem = {
                title,
                pubDate: pubDateStr ? parseDate(`${pubDateStr.trim()}T00:00:00Z`) : undefined,
                link: linkUrl ? new URL(linkUrl, targetUrl).href : undefined,
                language,
            };

            return processedItem;
        });

    items = await pMap(
        items,
        (item) => {
            if (!item.link) {
                return item;
            }

            return cache.tryGet(item.link, async (): Promise<DataItem> => {
                const detailResponse = await ofetch(item.link!);
                const $$: CheerioAPI = load(detailResponse);

                const title: string = $$('div.content_title').text();
                const body = $$('#zoom');
                const description = body.html();
                const textBody = copyNodes(body);
                textBody.find('script, style').remove();
                const pubDateStr: string | undefined = $$('div.gyj_ly')
                    .text()
                    .match(/发布时间：\s*([\d-]+\s+[\d:]+)/)?.[1];
                const categories: string[] = $$('meta[name="keywords"]').attr('content')?.split(/,/) ?? [];

                const processedItem: DataItem = {
                    title,
                    description,
                    pubDate: pubDateStr ? timezone(parseDate(pubDateStr), 8) : item.pubDate,
                    category: categories,
                    content: {
                        html: description,
                        text: textBody.text(),
                    },
                    language,
                };

                return {
                    ...item,
                    ...processedItem,
                };
            });
        },
        { concurrency: 3 }
    );

    return {
        title: $('title').text(),
        description: $('meta[name="description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: new URL('cms_files/filemanager/1669542092/picture/20261/BE4DC8B229D69CCE5E71DEE3DB440FA4.png', baseUrl).href,
        author: $('meta[name="keyword"]').attr('content')?.split(/,/, 1)[0],
        language,
        id: $('meta[property="og:url"]').attr('content'),
    };
};

export const route: Route = {
    path: '/:id{.+}?',
    name: '栏目',
    url: 'www.samrdprc.org.cn',
    maintainers: ['nczitzk'],
    handler,
    example: '/samrdprc/gnxw',
    parameters: {
        id: {
            description: '栏目 id，默认为 `gnxw`，即中心新闻，可在对应分类页 URL 中找到',
            options: [
                {
                    label: '中心新闻',
                    value: 'gnxw',
                },
                {
                    label: '公告',
                    value: 'gsgg/gg',
                },
                {
                    label: '汽车召回',
                    value: 'zhxx/jdczh/jdczh',
                },
                {
                    label: '消费品召回',
                    value: 'xfpzh',
                },
                {
                    label: '科技成果',
                    value: 'kxyj/kjcg',
                },
                {
                    label: '科技动态',
                    value: 'kxyj/kjdt',
                },
                {
                    label: '安全知识',
                    value: 'aqjy/aqzs',
                },
                {
                    label: '消费提示',
                    value: 'aqjy/xfts',
                },
                {
                    label: '国内法规',
                    value: 'fgbz/gnfg',
                },
                {
                    label: '国外法规',
                    value: 'fgbz/gwfg',
                },
            ],
        },
    },
    description: `::: tip
订阅 [公告](https://www.samrdprc.org.cn/gsgg/gg/index.html)，其源网址为 \`https://www.samrdprc.org.cn/gsgg/gg/index.html\`，请参考该 URL 指定部分构成参数，此时路由为 [\`/samrdprc/gsgg/gg\`](https://rsshub.app/samrdprc/gsgg/gg)。
:::

<details>
  <summary>更多分类</summary>

#### 新闻公告

| [中心新闻](https://www.samrdprc.org.cn/gnxw/index.html) | [公告](https://www.samrdprc.org.cn/gsgg/gg/index.html) |
| ------------------------------------------------------- | ------------------------------------------------------ |
| [gnxw](https://rsshub.app/samrdprc/gnxw)                | [gsgg/gg](https://rsshub.app/samrdprc/gsgg/gg)         |

#### 安全信息

| [汽车召回](https://www.samrdprc.org.cn/zhxx/jdczh/jdczh/index.html) | [消费品召回](https://www.samrdprc.org.cn/xfpzh/index.html) |
| ------------------------------------------------------------------- | ---------------------------------------------------------- |
| [zhxx/jdczh/jdczh](https://rsshub.app/samrdprc/zhxx/jdczh/jdczh)    | [xfpzh](https://rsshub.app/samrdprc/xfpzh)                 |

#### 科学研究

| [科技成果](https://www.samrdprc.org.cn/kxyj/kjcg/index.html) | [科技动态](https://www.samrdprc.org.cn/kxyj/kjdt/index.html) |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| [kxyj/kjcg](https://rsshub.app/samrdprc/kxyj/kjcg)           | [kxyj/kjdt](https://rsshub.app/samrdprc/kxyj/kjdt)           |

#### 安全教育

| [安全知识](https://www.samrdprc.org.cn/aqjy/aqzs/index.html) | [消费提示](https://www.samrdprc.org.cn/aqjy/xfts/index.html) |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| [aqjy/aqzs](https://rsshub.app/samrdprc/aqjy/aqzs)           | [aqjy/xfts](https://rsshub.app/samrdprc/aqjy/xfts)           |

#### 法规标准

| [国内法规](https://www.samrdprc.org.cn/fgbz/gnfg/index.html) | [国外法规](https://www.samrdprc.org.cn/fgbz/gwfg/index.html) |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| [fgbz/gnfg](https://rsshub.app/samrdprc/fgbz/gnfg)           | [fgbz/gwfg](https://rsshub.app/samrdprc/fgbz/gwfg)           |

</details>`,
    categories: ['government'],
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
            source: ['www.samrdprc.org.cn/:id'],
            target: '/:id',
        },
        {
            title: '新闻公告 - 中心新闻',
            source: ['www.samrdprc.org.cn/gnxw/index.html'],
            target: '/gnxw',
        },
        {
            title: '新闻公告 - 公告',
            source: ['www.samrdprc.org.cn/gsgg/gg/index.html'],
            target: '/gsgg/gg',
        },
        {
            title: '安全信息 - 汽车召回',
            source: ['www.samrdprc.org.cn/zhxx/jdczh/jdczh/index.html'],
            target: '/zhxx/jdczh/jdczh',
        },
        {
            title: '安全信息 - 消费品召回',
            source: ['www.samrdprc.org.cn/xfpzh/index.html'],
            target: '/xfpzh',
        },
        {
            title: '科学研究 - 科技成果',
            source: ['www.samrdprc.org.cn/kxyj/kjcg/index.html'],
            target: '/kxyj/kjcg',
        },
        {
            title: '科学研究 - 科技动态',
            source: ['www.samrdprc.org.cn/kxyj/kjdt/index.html'],
            target: '/kxyj/kjdt',
        },
        {
            title: '安全教育 - 安全知识',
            source: ['www.samrdprc.org.cn/aqjy/aqzs/index.html'],
            target: '/aqjy/aqzs',
        },
        {
            title: '安全教育 - 消费提示',
            source: ['www.samrdprc.org.cn/aqjy/xfts/index.html'],
            target: '/aqjy/xfts',
        },
        {
            title: '法规标准 - 国内法规',
            source: ['www.samrdprc.org.cn/fgbz/gnfg/index.html'],
            target: '/fgbz/gnfg',
        },
        {
            title: '法规标准 - 国外法规',
            source: ['www.samrdprc.org.cn/fgbz/gwfg/index.html'],
            target: '/fgbz/gwfg',
        },
    ],
    view: ViewType.Articles,
};

function copyNodes<T extends AnyNode>(selection: Cheerio<T>): Cheerio<T> {
    const copy = selection.map((_, node) => cloneNode(node, true));
    const root = new Document(copy.toArray());
    for (const node of copy) {
        node.parent = root;
    }
    return copy;
}
