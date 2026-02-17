import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const BASE_URL = 'http://www.sme.buaa.edu.cn';

export const route: Route = {
    path: '/sme/:path{.+}?',
    name: '集成电路科学与工程学院',
    url: 'www.sme.buaa.edu.cn',
    maintainers: ['MeanZhang'],
    handler,
    example: '/buaa/sme/tzgg',
    parameters: {
        path: '版块路径，默认为 `tzgg`（通知公告）',
    },
    description: `::: tip

版块路径（\`path\`）应填写板块 URL 中 \`http://www.sme.buaa.edu.cn/\` 和 \`.htm\` 之间的字段。

示例：

1. [通知公告](http://www.sme.buaa.edu.cn/tzgg.htm) 页面的 URL 为 \`http://www.sme.buaa.edu.cn/tzgg.htm\`，对应的路径参数为 \`tzgg\`，完整路由为 \`/buaa/sme/tzgg\`；
2. [就业信息](http://www.sme.buaa.edu.cn/zsjy/jyxx.htm) 页面的 URL 为 \`http://www.sme.buaa.edu.cn/zsjy/jyxx.htm\`，对应的路径参数为 \`zsjy/jyxx\`，完整路由为 \`/buaa/sme/zsjy/jyxx\`。

:::

::: warning

部分页面（如[学院介绍](http://www.sme.buaa.edu.cn/xygk/xyjs.htm)、[微纳中心](http://www.sme.buaa.edu.cn/wnzx.htm)、[院学生会](http://www.sme.buaa.edu.cn/xsgz/yxsh.htm)）存在无内容、内容跳转至外站等情况，因此可能出现解析失败的现象。

:::`,
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

async function handler(ctx) {
    const { path = 'tzgg' } = ctx.req.param();
    const url = `${BASE_URL}/${path}.htm`;
    const { title, list } = await getList(url);
    return {
        // 源标题
        title,
        // 源链接
        link: url,
        // 源文章
        item: await getItems(list),
        // 语言
        language: 'zh-CN',
    };
}

async function getList(url) {
    const { data } = await got(url);
    const $ = load(data);
    const title = $('.nytit .fr a')
        .toArray()
        .slice(1)
        .map((item) => $(item).text().trim())
        .join(' - ');
    const list = $("div[class='Newslist'] > ul > li")
        .toArray()
        .map((item_) => {
            const item = $(item_);
            const $a = item.find('a');
            const link = $a.attr('href');
            return {
                title: item.find('a').text(),
                link: link?.startsWith('http') ? link : `${BASE_URL}/${link}`, // 有些链接是相对路径
                pubDate: timezone(parseDate(item.find('span').text()), +8),
            };
        });
    return {
        title,
        list,
    };
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
