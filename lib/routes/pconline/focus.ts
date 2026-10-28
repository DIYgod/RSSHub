import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

const rootUrl = 'https://www.pconline.com.cn';
interface Item {
    id: string;
    title: string;
    channelName: string;
    wap_3g_url: string;
    bigImage: string;
    cover: string;
    largeImage: string;
    authorname: string;
    authorImg: string;
    pc_pubDate: string;
    artType: string;
    summary: string;
    url: string;
}

const categories = {
    all: {
        title: '全部',
        path: '',
    },
    tech: {
        title: '科技',
        path: 'tech/',
    },
    finance: {
        title: '财经',
        path: 'finance/',
    },
    life: {
        title: '生活',
        path: 'life/',
    },
    company: {
        title: '公司',
        path: 'company/',
    },
    character: {
        title: '人物',
        path: 'character/',
    },
};

const parseArticles = (response: string): { articleList: Item[] } => {
    const payload = response.match(/^\s*Module\.callback\(([\s\S]*)\);?\s*$/)?.[1];
    if (!payload) {
        throw new Error('PConline returned an unexpected article list response.');
    }
    const tokens = payload.match(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|[^"']+/gs) || [];
    if (tokens.join('') !== payload) {
        throw new Error('PConline returned malformed article list strings.');
    }
    const json = tokens
        .map((token) => {
            if (token.startsWith('"')) {
                return token;
            }
            if (token.startsWith("'")) {
                let value = '';
                for (let index = 1; index < token.length - 1; index++) {
                    const character = token[index];
                    if (character === '\\') {
                        const next = token[++index];
                        value += next === "'" ? "'" : `\\${next}`;
                    } else {
                        value += character === '"' ? String.raw`\"` : character;
                    }
                }
                return JSON.stringify(JSON.parse(`"${value}"`));
            }
            return token.replaceAll(/,\s*(?=[}\]])/g, '');
        })
        .join('');
    return JSON.parse(json);
};

const getContent = (item: DataItem & { link: string }) =>
    cache.tryGet(item.link, async () => {
        const detailResponse = await got({
            method: 'get',
            url: `https:${item.link}`,
            responseType: 'arrayBuffer',
        });

        const utf8decoder = new TextDecoder('GBK');
        const html = utf8decoder.decode(detailResponse.data);
        const $ = load(html);
        item.description = $('.context-box .context-table tbody td').html();
        return item;
    });

export const handler = async (ctx) => {
    const { category = 'all' } = ctx.req.param();
    const cate = categories[category] || categories.all;
    const currentUrl = `${rootUrl}/3g/other/focus/${cate.path}index.html`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const { articleList } = parseArticles(response.data);
    const list: Array<DataItem & { link: string }> = articleList.map((item: Item) => ({
        id: item.id,
        title: item.title,
        author: [
            {
                name: item.authorname,
                avatar: item.authorImg,
            },
        ],
        pubDate: parseDateInTimezone(item.pc_pubDate, 8),
        link: item.url,
        description: item.summary,
        category: item.channelName,
        image: item.cover,
    }));

    const items = await pMap(list, getContent, { concurrency: 3 });

    return {
        title: `太平洋科技-${cate.title}`,
        link: `${rootUrl}/focus/`,
        item: items,
    };
};

export const route: Route = {
    path: '/focus/:category?',
    categories: ['new-media'],
    example: '/pconline/focus',
    parameters: {
        category: {
            description: '科技新闻的类别，获取最新的一页，分别：all, tech, finance, life, company, character',
            default: 'all',
        },
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['pconline.com.cn/focus/', 'pconline.com.cn/'],
            target: '/focus',
        },
    ],
    name: '科技新闻',
    maintainers: ['CH563'],
    handler,
    description: `::: tip

| 全部 | 科技 | 财经    | 生活 | 公司    | 人物      |
| ---- | ---- | ------- | ---- | ------- | --------- |
| all  | tech | finance | life | company | character |

:::`,
};
