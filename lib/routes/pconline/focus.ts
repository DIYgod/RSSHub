import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

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

const getContent = (item) =>
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

    const resString = response.data
        .replace(/Module\.callback\((.*)\)/s, '$1')
        .split('\n')
        .filter((e) => e.indexOf('"tags":') !== 0)
        .join('\n')
        .replaceAll("'", '"');
    const tinyData = resString.replaceAll(/[\n\r]/g, '');
    const dataString = tinyData.replaceAll(',}', '}');
    const data = JSON.parse(dataString || '');
    const { articleList } = data;
    const list = articleList.map((item: Item) => ({
        id: item.id,
        title: item.title,
        author: [
            {
                name: item.authorname,
                avatar: item.authorImg,
            },
        ],
        pubDate: parseDate(item.pc_pubDate),
        link: item.url,
        description: item.summary,
        category: item.channelName,
        image: item.cover,
    }));

    const items = await Promise.all(list.map((item) => getContent(item)));

    return {
        title: `太平洋科技-${cate.title}`,
        link: currentUrl,
        item: items,
    };
};

export const route: Route = {
    path: '/focus/:category?',
    categories: ['new-media', 'popular'],
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
| 全部 | 科技 | 财经 | 生活 | 公司 | 人物 |
| --- | --- | --- | --- | --- | --- |
| all | tech | finance | life | company | character |
:::`,
};
