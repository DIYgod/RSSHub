import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/hr/:category?',
    categories: ['university'],
    example: '/pku/hr',
    parameters: { category: '分类，见下方说明，默认为首页最新公告' },
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
            source: ['hr.pku.edu.cn/'],
        },
    ],
    name: '人事处',
    maintainers: ['nczitzk'],
    handler,
    url: 'hr.pku.edu.cn/',
    description: `:::tip
  分类字段处填写的是对应北京大学人事处分类页网址中介于 **\`http://hr.pku.edu.cn/\`** 和 **/index.htm** 中间的一段，并将其中的 \`/\` 修改为 \`-\`。

  如 [北京大学人事处 - 人才招聘 - 教师 - 教学科研人员](https://hr.pku.edu.cn/rczp/js/jxkyry/index.htm) 的网址为 \`https://hr.pku.edu.cn/rczp/js/jxkyry/index.htm\` 其中介于 **\`http://hr.pku.edu.cn/\`** 和 **\`/index.ht\`** 中间的一段为 \`rczp/js/jxkyry\`。随后，并将其中的 \`/\` 修改为 \`-\`，可以得到 \`rczp-js-jxkyry\`。所以最终我们的路由为 [\`/pku/hr/rczp-js-jxkyry\`](https://rsshub.app/pku/hr/rczp-js-jxkyry)
  :::`,
};

async function handler(ctx) {
    const category = ctx.req.param('category')?.replace(/-/g, '/') ?? 'zxgg';

    const rootUrl = 'https://hr.pku.edu.cn/';
    const currentUrl = `${rootUrl}/${category}/index.htm`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const list = $('.item-list li a')
        .map((_, item) => {
            item = $(item);

            return {
                title: item.text().replace(/\d+、/, ''),
                link: `${rootUrl}/${category}/${item.attr('href')}`,
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                content('.title').remove();

                item.description = content('.article').html();
                item.pubDate = parseDate(content('#date').text());

                return item;
            })
        )
    );

    return {
        title: `${$('h2').text()} - ${$('title').text()}`,
        link: currentUrl,
        item: items,
    };
}
