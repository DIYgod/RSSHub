import { load } from 'cheerio';

import type { Data, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseUrl = 'https://ic.buaa.edu.cn';

export const route: Route = {
    path: '/sme/:path{.+}?',
    name: '集成电路科学与工程学院',
    url: 'ic.buaa.edu.cn',
    maintainers: ['MeanZhang'],
    handler,
    example: '/buaa/sme/tzgg',
    parameters: {
        path: '版块路径，默认为 `tzgg`（通知公告）',
    },
    description: `版块路径（\`path\`）填写官网 URL 中 \`https://ic.buaa.edu.cn/\` 和 \`.htm\` 之间的字段。

示例：

1. [通知公告](https://ic.buaa.edu.cn/tzgg.htm)：\`/buaa/sme/tzgg\`；
2. [就业信息](https://ic.buaa.edu.cn/zsjy/jyxx.htm)：\`/buaa/sme/zsjy/jyxx\`。

请使用栏目列表页；学院介绍等单篇页面不提供文章列表。`,
    categories: ['university'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
};

async function handler(ctx): Promise<Data> {
    const { path = 'tzgg' } = ctx.req.param();
    const url = `${baseUrl}/${path}.htm`;
    const { title, list } = await getList(url);
    const orderedList = list;
    const entries = orderedList;
    return {
        title,
        link: url,
        item: await getItems(entries),
        language: 'zh-CN',
    };
}

async function getList(url: string) {
    const { data } = await got(url);
    const $ = load(data);
    const title = $('title').text();
    const list = $('.lt18 > li')
        .toArray()
        .map((element) => {
            const $item = $(element);
            const $link = $item.find('a');
            const href = $link.attr('href');
            if (!href) {
                return;
            }
            const year = $item.find('.time small').text().match(/\d{4}/)?.[0];
            return {
                title: $link.find('h4').text(),
                link: new URL(href, url).href,
                pubDate: year ? timezone(parseDate(`${year}-${$item.find('.time big').text()}`, 'YYYY-MM-DD'), 8) : undefined,
            };
        })
        .filter((item) => item !== undefined);
    return { title, list };
}

function getItems(list) {
    return Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: descrptionResponse } = await got(item.link);
                const $descrption = load(descrptionResponse);
                item.description = $descrption('div[class="v_news_content"]').html();
                return item;
            })
        )
    );
}
