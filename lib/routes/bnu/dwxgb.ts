import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/dwxgb/:category/:type',
    categories: ['university'],
    example: '/bnu/dwxgb/xwzx/tzgg',
    parameters: { category: '大分类', type: '子分类，例子如下' },
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
            source: ['dwxgb.bnu.edu.cn/:category/:type/index.html'],
        },
    ],
    name: '党委学生工作部',
    maintainers: ['Fatpandac'],
    handler,
    description: `\`https://dwxgb.bnu.edu.cn/xwzx/tzgg/index.html\` 则对应为 \`/bnu/dwxgb/xwzx/tzgg`,
};

async function handler(ctx) {
    const { category, type } = ctx.req.param();

    const rootUrl = 'https://dwxgb.bnu.edu.cn';
    const currentUrl = `${rootUrl}/${category}/${type}/index.html`;

    let response;
    try {
        response = await got(currentUrl);
    } catch {
        try {
            response = await got(`${rootUrl}/${category}/${type}/index.htm`);
        } catch {
            return;
        }
    }

    const $ = load(response.data);

    const list = $('ul.container.list > li')
        .toArray()
        .map((item) => {
            const link = $(item).find('a').attr('href');
            const absoluteLink = new URL(link, currentUrl).href;
            return {
                title: $(item).find('a').text().trim(),
                pubDate: parseDate($(item).find('span').text()),
                link: absoluteLink,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = load(detailResponse.data);
                item.description = content('div.article.typo').html();
                return item;
            })
        )
    );

    return {
        title: `${$('div.breadcrumb1 > a:nth-child(3)').text()} - ${$('div.breadcrumb1 > a:nth-child(4)').text()}`,
        link: currentUrl,
        item: items,
    };
}
