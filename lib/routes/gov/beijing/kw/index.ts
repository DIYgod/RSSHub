import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootUrl = 'https://kw.beijing.gov.cn';
const refererUrl = 'https://www.beijing.gov.cn/';

const categories = {
    zcwj: {
        title: '科委政策文件',
        link: `${rootUrl}/zwgk/zcwj/`,
        listSelector: '.title-list-box ul.list li',
    },
    xwdt: {
        title: '科委新闻动态',
        link: `${rootUrl}/xwdt/`,
        listSelector: '.hot-news-list li',
    },
} as const;

type Category = keyof typeof categories;

function getHeaders(referer = refererUrl) {
    return {
        Referer: referer,
    };
}

function parseListPage(html: string, baseUrl: string, listSelector: string, limit: number) {
    const $ = load(html);
    const items: DataItem[] = [];
    const seen = new Set<string>();

    $(listSelector).each((_, element) => {
        if (items.length >= limit) {
            return false;
        }
        const item = $(element);
        const anchor = item.find('a').first();
        const href = anchor.attr('href');
        const title = anchor.attr('title')?.trim() || anchor.text().trim();
        if (!href || !title || !/\/t20\d{6}_\d+\.html/.test(href)) {
            return;
        }
        const link = new URL(href, baseUrl).href;
        if (seen.has(link)) {
            return;
        }
        seen.add(link);
        const dateText = item.find('span').last().text().trim();
        items.push({
            title,
            link,
            pubDate: dateText ? timezone(parseDate(dateText, 'YYYY-MM-DD'), 8) : undefined,
        });
    });

    return items;
}

async function enrichItems(items: DataItem[], referer: string) {
    return await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link, {
                    headers: getHeaders(referer),
                });
                const $ = load(detailResponse.data);

                const pubDate = $('meta[name="PubDate"]').attr('content');
                if (pubDate) {
                    item.pubDate = timezone(parseDate(pubDate.slice(0, 10), 'YYYY-MM-DD'), 8);
                }

                item.author = $('meta[name="ContentSource"]').attr('content');
                item.description = $('#zoom').html() ?? $('#mainText').html() ?? item.description;

                return item;
            })
        )
    );
}

async function handleCategory(category: Category, limit: number) {
    const config = categories[category];
    const response = await got(config.link, {
        headers: getHeaders(config.link),
    });
    let items = parseListPage(response.data, config.link, config.listSelector, limit);

    if (category === 'xwdt') {
        items = items.toSorted((a, b) => (b.pubDate?.getTime() ?? 0) - (a.pubDate?.getTime() ?? 0)).slice(0, limit);
    }

    items = await enrichItems(items, config.link);

    return {
        title: `北京市科学技术委员会、中关村科技园区管理委员会 - ${config.title}`,
        link: config.link,
        item: items,
    };
}

async function handleLegacyChannel(channel: string, limit: number) {
    const url = `${rootUrl}/col/${channel}/index.html`;

    const response = await got(url, {
        headers: getHeaders(refererUrl),
    });
    const $ = load(response.data);
    const title = $('a.bt_link').last().text().replace('>', '');
    const dataJs = $('div.left.zhengce_right > script[language="javascript"]').html() || $('div.centent_width > script[language="javascript"]').html();

    if (!dataJs) {
        throw new Error(`Invalid channel: ${channel}`);
    }

    let items = dataJs
        .match(/urls\[i\]='(.*?)';headers\[i\]="(.*?)";year\[i\]='(\d+)';month\[i\]='(\d+)';day\[i\]='(\d+)';/g)
        ?.slice(0, limit)
        .map((item) => {
            const result = item.match(/urls\[i\]='(.*?)';headers\[i\]="(.*?)";year\[i\]='(\d+)';month\[i\]='(\d+)';day\[i\]='(\d+)';/);
            if (!result) {
                return null;
            }
            return {
                title: load(result[2])('a').attr('title') || result[2],
                link: new URL(result[1], rootUrl).href,
                pubDate: timezone(parseDate(`${result[3]}-${result[4]}-${result[5]}`, 'YYYY-MM-DD'), 8),
            };
        })
        .filter(Boolean) as DataItem[];

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const content = await got(item.link, {
                    headers: getHeaders(refererUrl),
                });
                const $ = load(content.data);
                item.description = $('#zoom').html() || $('div.left.zhengce_right').html();

                return item;
            })
        )
    );

    return {
        title: `北京市科学技术委员会、中关村科技园区管理委员会 - ${title}`,
        link: url,
        item: items,
    };
}

export const route: Route = {
    path: '/kw/:channel',
    categories: ['government'],
    example: '/gov/beijing/kw/zcwj',
    parameters: { channel: '栏目，见下表' },
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
            source: ['kw.beijing.gov.cn/zwgk/zcwj/'],
            target: '/gov/beijing/kw/zcwj',
        },
        {
            source: ['kw.beijing.gov.cn/xwdt/'],
            target: '/gov/beijing/kw/xwdt',
        },
        {
            source: ['kw.beijing.gov.cn/col/:channel/index.html'],
        },
    ],
    name: '北京市科学技术委员会、中关村科技园区管理委员会',
    maintainers: ['Fatpandac', 'zll17'],
    handler,
    description: `| 科委政策文件 | 科委新闻动态 |
| ------------ | ------------ |
| zcwj         | xwdt         |

其他 \`col\` 频道参数可在官网获取，如 \`http://kw.beijing.gov.cn/col/col736/index.html\` 对应 \`/gov/beijing/kw/col736\``,
};

async function handler(ctx) {
    const channel = ctx.req.param('channel');
    const limit = ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 30;

    if (Object.hasOwn(categories, channel)) {
        return await handleCategory(channel as Category, limit);
    }

    return await handleLegacyChannel(channel, limit);
}
