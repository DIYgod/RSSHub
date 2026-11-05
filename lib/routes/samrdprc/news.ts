import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { baseUrl, loadList } from './utils';

// The site redesign moved the recall lists, so keep the documented IDs pointing at their new columns
const columns: Record<string, string> = {
    'qczh/gnzhqc': 'zhxx/jdczh/jdczh',
    'qczh/qczhgg1': 'fzlm/zhgg/qczhgg',
    'xfpzh/xfpgnzh': 'xfpzh',
};

export const route: Route = {
    path: '/news/:type1/:type2',
    categories: ['government'],
    example: '/samrdprc/news/xfpzh/xfpgnzh',
    parameters: {
        type1: '召回类型ID1，见下表',
        type2: '召回类型ID2，见下表',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    description: `| 类型中文     | 召回类型 ID1 | 召回类型 ID2 |
| ------------ | ------------ | ------------ |
| 消费品召回   | xfpzh        | xfpgnzh      |
| 汽车召回     | qczh         | gnzhqc       |
| 汽车召回公告 | qczh         | qczhgg1      |

其他召回栏目（如摩托车召回）请使用栏目路由，例如 \`/samrdprc/zhxx/jdczh/mtczh\`。`,
    name: '召回信息',
    maintainers: ['a180285'],
    radar: [
        {
            source: ['www.samrdprc.org.cn/xfpzh/index.html'],
            target: '/news/xfpzh/xfpgnzh',
        },
        {
            source: ['www.samrdprc.org.cn/zhxx/jdczh/jdczh/index.html'],
            target: '/news/qczh/gnzhqc',
        },
        {
            source: ['www.samrdprc.org.cn/fzlm/zhgg/qczhgg/index.html'],
            target: '/news/qczh/qczhgg1',
        },
    ],
    handler: async (ctx) => {
        const type1 = ctx.req.param('type1');
        const type2 = ctx.req.param('type2');

        const id = `${type1}/${type2}`;
        const url = `${baseUrl}/${columns[id] ?? id}/`;
        const response = await got(url);
        const $ = load(response.body);

        const typeName = $('meta[name="ColumnName"]').attr('content');

        const $list = await loadList($);
        const listSelector = $list('.page-content ul li');
        const items: DataItem[] = await pMap(
            listSelector.toArray(),
            (el) => {
                const item = $list(el);
                const anchor = item.find('a').first();

                const title = anchor.text();
                const link = new URL(anchor.attr('href')!, baseUrl).href;
                const date = item.find('span').text().trim();
                const pubDate = date ? parseDate(`${date}T00:00:00Z`) : undefined;

                return cache.tryGet(link, async () => {
                    const detail = await got(link);
                    const $ = load(detail.body);

                    const articleHTML = $('#zoom').html();

                    return {
                        title,
                        link,
                        pubDate,
                        description: articleHTML,
                    };
                });
            },
            { concurrency: 3 }
        );

        return {
            title: `${typeName} - 国家市场监督管理总局`,
            link: url,
            item: items,
        };
    },
};
