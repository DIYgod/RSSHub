import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/zhengce/govall/:advance?',
    categories: ['government'],
    example: '/gov/zhengce/govall/orpro=555&notpro=2&search_field=title',
    parameters: { advance: '高级搜索选项，将作为请求参数直接添加到url后。目前已知的选项及其意义如下。' },
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
            source: ['www.gov.cn/'],
            target: '/zhengce/govall',
        },
    ],
    name: '信息稿件',
    maintainers: ['ciaranchen'],
    handler,
    url: 'www.gov.cn/',
    description: `|               选项              |                       意义                       |              备注              |
| :-----------------------------: | :----------------------------------------------: | :----------------------------: |
|              orpro              |             包含以下任意一个关键词。             |          用空格分隔。          |
|              allpro             |                包含以下全部关键词                |                                |
|              notpro             |                 不包含以下关键词                 |                                |
|              inpro              |                完整不拆分的关键词                |                                |
|           searchfield           | title: 搜索词在标题中；content: 搜索词在正文中。 |  默认为空，即网页的任意位置。  |
| pubmintimeYear, pubmintimeMonth |                    从某年某月                    | 单独使用月份参数无法只筛选月份 |
| pubmaxtimeYear, pubmaxtimeMonth |                    到某年某月                    | 单独使用月份参数无法只筛选月份 |
|              colid              |                       栏目                       |      比较复杂，不建议使用      |`,
};

async function handler(ctx) {
    const advance = ctx.req.param('advance');
    const link = `http://sousuo.gov.cn/list.htm`;
    const params = new URLSearchParams({
        n: 20,
        t: 'govall',
        sort: 'pubtime',
        advance: 'true',
    });
    const query = `${params.toString()}&${advance}`;
    const res = await got.get(link, {
        searchParams: query.replaceAll(/([\u4E00-\u9FA5])/g, (str) => encodeURIComponent(str)),
    });
    const $ = load(res.data);

    const list = $('body > div.dataBox > table > tbody > tr')
        .slice(1)
        .toArray()
        .map((elem) => {
            elem = $(elem);
            return {
                title: elem.find('td:nth-child(2) > a').text(),
                link: elem.find('td:nth-child(2) > a').attr('href'),
                pubDate: timezone(parseDate(elem.find('td:nth-child(5)').text()), 8),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                let description: string;
                try {
                    const contentData = await got(item.link);
                    const $ = load(contentData.data);
                    description = $('#UCAP-CONTENT').html();
                } catch {
                    description = '文章已被删除';
                }
                item.description = description;
                return item;
            })
        )
    );

    return {
        title: '信息稿件 - 中国政府网',
        link: `${link}?${query}`,
        item: items,
    };
}
