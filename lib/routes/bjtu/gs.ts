import { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const rootURL = 'https://gs.bjtu.edu.cn';
const urlCms = `${rootURL}/cms/item/?tag=`;
const urlZszt = `${rootURL}/cms/zszt/item/?cat=`;
const title = ' - 北京交通大学研究生院';
const zsztRegex = /_zszt/;
const struct = {
    noti_zs: {
        selector: {
            list: '.tab-content li',
        },
        tag: 1,
        name: '通知公告_招生',
    },
    noti: {
        selector: {
            list: '.tab-content li',
        },
        tag: 2,
        name: '通知公告',
    },
    news: {
        selector: {
            list: '.tab-content li',
        },
        tag: 3,
        name: '新闻动态',
    },
    zsxc: {
        selector: {
            list: '.tab-content li',
        },
        tag: 4,
        name: '招生宣传',
    },
    py: {
        selector: {
            list: '.tab-content li',
        },
        tag: 5,
        name: '培养',
    },
    zs: {
        selector: {
            list: '.tab-content li',
        },
        tag: 6,
        name: '招生',
    },
    xw: {
        selector: {
            list: '.tab-content li',
        },
        tag: 7,
        name: '学位',
    },
    ygb: {
        selector: {
            list: '.tab-content li',
        },
        tag: 8,
        name: '研工部',
    },
    ygbtzgg: {
        selector: {
            list: '.tab-content li',
        },
        tag: 9,
        name: '通知公告 - 研工部',
    },
    ygbnews: {
        selector: {
            list: '.tab-content li',
        },
        tag: 10,
        name: '新闻动态 - 研工部',
    },
    ygbnewscover: {
        selector: {
            list: '.tab-content li',
        },
        tag: 11,
        name: '新闻封面 - 研工部',
    },
    all: {
        selector: {
            list: '.tab-content li',
        },
        tag: 12,
        name: '文章列表',
    },
    bszs_zszt: {
        selector: {
            list: '.mainleft_box li',
        },
        tag: 2,
        name: '博士招生 - 招生专题',
    },
    sszs_zszt: {
        selector: {
            list: '.mainleft_box li',
        },
        tag: 3,
        name: '硕士招生 - 招生专题',
    },
    zsjz_zszt: {
        selector: {
            list: '.mainleft_box li',
        },
        tag: 4,
        name: '招生简章 - 招生专题',
    },
    zcfg_zszt: {
        selector: {
            list: '.mainleft_box li',
        },
        tag: 5,
        name: '政策法规 - 招生专题',
    },
};

const getItem = (item, selector) => {
    const newsInfo = item.find('a');
    const newsDate = item
        .find('span')
        .text()
        .match(/\d{4}(-|\/|.)\d{1,2}\1\d{1,2}/)[0];

    const infoTitle = newsInfo.text();
    const link = rootURL + newsInfo.attr('href');
    return cache.tryGet(link, async () => {
        const resp = await ofetch(link);
        const $$ = load(resp);
        const infoText = $$(selector).html();

        return {
            title: infoTitle,
            pubDate: parseDate(newsDate),
            link,
            description: infoText,
        };
    }) as any;
};

export const route: Route = {
    path: '/gs/:type?',
    categories: ['university'],
    example: '/bjtu/gs/noti',
    parameters: { type: 'Article type' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['gs.bjtu.edu.cn'],
        },
    ],
    name: '研究生院',
    maintainers: ['E1nzbern'],
    handler,
    description: `
| 文章来源           | 参数         |
| ----------------- | ------------ |
| 通知公告_招生      | noti_zs      |
| 通知公告           | noti         |
| 新闻动态           | news         |
| 招生宣传           | zsxc         |
| 培养               | py           |
| 招生               | zs           |
| 学位               | xw           |
| 研工部             | ygb          |
| 通知公告 - 研工部   | ygbtzgg      |
| 新闻动态 - 研工部   | ygbnews      |
| 新闻封面 - 研工部   | ygbnewscover |
| 文章列表           | all          |
| 博士招生 - 招生专题 | bszs_zszt    |
| 硕士招生 - 招生专题 | sszs_zszt    |
| 招生简章 - 招生专题 | zsjz_zszt    |
| 政策法规 - 招生专题 | zcfg_zszt    |

::: tip
  文章来源的命名均来自研究生院网站标题。
  最常用的几项有“通知公告_招生”、“通知公告”、“博士招生 - 招生专题”、“硕士招生 - 招生专题”。
:::`,
};

async function handler(ctx) {
    const { type = 'noti' } = ctx.req.param();
    let url = urlCms;
    let selectorArticle = 'div.main_left.main_left_list';
    if (zsztRegex.test(type)) {
        url = urlZszt;
        selectorArticle = 'div.mainleft_box';
    }
    const urlAddr = `${url}${struct[type].tag}`;
    const resp = await ofetch(urlAddr);
    const $ = load(resp);

    const list = $(struct[type].selector.list);

    const items = await Promise.all(
        list.toArray().map((i) => {
            const item = $(i);
            return getItem(item, selectorArticle);
        })
    );

    return {
        title: `${struct[type].name}${title}`,
        link: urlAddr,
        item: items,
        allowEmpty: true,
    };
}
