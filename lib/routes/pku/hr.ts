import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
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
    description: `::: tip
分类字段处填写的是对应北京大学人事处分类页网址中介于 **\`https://hr.pku.edu.cn/\`** 和 **/index.htm** 中间的一段，并将其中的 \`/\` 修改为 \`-\`。

如 [北京大学人事部 - 人才招聘 - 教学科研](https://hr.pku.edu.cn/rczp/jxky/index.htm) 的网址为 \`https://hr.pku.edu.cn/rczp/jxky/index.htm\` 其中介于 **\`https://hr.pku.edu.cn/\`** 和 **\`/index.htm\`** 中间的一段为 \`rczp/jxky\`。随后，并将其中的 \`/\` 修改为 \`-\`，可以得到 \`rczp-jxky\`。所以最终我们的路由为 [\`/pku/hr/rczp-jxky\`](https://rsshub.app/pku/hr/rczp-jxky)
:::`,
};

const rootUrl = 'https://hr.pku.edu.cn/';

async function getArticle(item: DataItem) {
    const article = await cache.tryGet(`pku:hr:article:v2:${item.link}`, async () => {
        const response = await got(item.link!);
        const $ = load(response.data);
        const date = $('meta[name="PubDate"]').attr('content');
        return {
            description: $('.gp-article').html(),
            pubDate: date ? parseDate(`${date.replace(' ', 'T')}+08:00`) : undefined,
        };
    });
    return { ...item, ...article, pubDate: article.pubDate ?? item.pubDate };
}

async function handler(ctx) {
    const category = ctx.req.param('category')?.replaceAll('-', '/');
    const currentUrl = category ? new URL(`${category}/index.htm`, rootUrl).href : rootUrl;
    const response = await got(currentUrl);
    const $ = load(response.data);
    const list = $(category ? 'ul.talentUl > li' : 'ul.mode1Ul > li')
        .toArray()
        .flatMap((element): DataItem[] => {
            const $item = $(element);
            const href = $item.find('a').attr('href');
            if (!href) {
                return [];
            }
            const date = $item.find('.date2').text().trim();
            return [{ title: $item.find('p').text(), link: new URL(href, currentUrl).href, pubDate: date ? parseDate(`${date}T00:00:00Z`) : undefined }];
        });

    return {
        title: `${category ? $('h2').text() : '最新公告'} - ${$('title').text()}`,
        link: currentUrl,
        item: await pMap(list, getArticle, { concurrency: 3 }),
    };
}
