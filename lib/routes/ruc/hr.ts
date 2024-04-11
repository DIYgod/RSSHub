import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/hr/:category?',
    categories: ['university'],
    example: '/ruc/hr',
    parameters: { category: '分类，见下方说明，默认为首页通知公告' },
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
            source: ['hr.ruc.edu.cn/'],
        },
    ],
    name: '人事处',
    maintainers: ['nczitzk'],
    handler,
    url: 'hr.ruc.edu.cn/',
    description: `:::tip
  分类字段处填写的是对应中国人民大学人事处分类页网址中介于 **\`http://hr.ruc.edu.cn/\`** 和 **/index.htm** 中间的一段，并将其中的 \`/\` 修改为 \`-\`。

  如 [中国人民大学人事处 - 办事机构 - 教师事务办公室 - 教师通知公告](http://hr.ruc.edu.cn/bsjg/bsjsswbgs/jstzgg/index.htm) 的网址为 \`http://hr.ruc.edu.cn/bsjg/bsjsswbgs/jstzgg/index.htm\` 其中介于 **\`http://hr.ruc.edu.cn/\`** 和 **/index.htm** 中间的一段为 \`bsjg/bsjsswbgs/jstzgg\`。随后，并将其中的 \`/\` 修改为 \`-\`，可以得到 \`bsjg-bsjsswbgs-jstzgg\`。所以最终我们的路由为 [\`/ruc/hr/bsjg-bsjsswbgs-jstzgg\`](https://rsshub.app/ruc/hr/bsjg-bsjsswbgs-jstzgg)
  :::`,
};

async function handler(ctx) {
    const category = ctx.req.param('category')?.replace(/-/g, '/') ?? 'tzgg';

    const rootUrl = 'http://hr.ruc.edu.cn';
    const currentUrl = `${rootUrl}/${category}/index.htm`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('a[title]')
        .toArray()
        .map((item) => {
            item = $(item);

            const link = item.attr('href');

            return {
                title: item.text(),
                link: `${rootUrl}${link.indexOf('..') === 0 ? link.replace(/\.\./, '') : `/${category}/${link}`}`,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    const content = load(detailResponse.data);

                    item.description = content('.neirong').html();
                    item.pubDate = parseDate(detailResponse.data.match(/日期：(\d{4}-\d{2}-\d{2})/)[1]);
                } catch {
                    item.description = 'Not Found';
                }

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
