import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import routes from './routes';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:type?/:category?/:subCategory?',
    categories: ['new-media'],
    example: '/oilchem/list/140/18263',
    parameters: { type: '类别 id，可在对应类别页中找到，默认为首页', category: '分类 id，可在对应分类页中找到', subCategory: '子分类 id，可在对应分类页中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '资讯',
    maintainers: ['nczitzk'],
    handler,
    description: `以下是几个例子：

  [**化工**](https://chem.oilchem.net) \`https://chem.oilchem.net\` 中，类别 id 为 \`chem\`，分类 id 为空，子分类 id 为空，对应路由即为 [\`/oilchem/chem\`](https://rsshub.app/oilchem/list/140/18263)

  [**甲醇**](https://chem.oilchem.net/chemical/methanol.shtml) 的相关资讯有两个页面入口：其一 \`https://chem.oilchem.net/chemical/methanol.shtml\` 中，类别 id 为 \`chem\`，分类 id 为 \`chemical\`，子分类 id 为 \`methanol\`，对应路由即为 [\`/oilchem/chem/chemical/methanol\`](https://rsshub.app/oilchem/chem/chemical/methanol) 或其二 \`https://list.oilchem.net/140\` 中，类别 id 为 \`list\`，分类 id 为 \`140\`，子分类 id 为空，对应路由即为 [\`/oilchem/list/140\`](https://rsshub.app/oilchem/list/140)；

  [**甲醇热点聚焦**](https://list.oilchem.net/140/18263) \`https://list.oilchem.net/140/18263\` 中，类别 id 为 \`list\`，分类 id 为 \`140\`，子分类 id 为 \`18263\`，对应路由即为 [\`/oilchem/list/140/18263\`](https://rsshub.app/oilchem/list/140/18263)`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') ?? '';
    const category = ctx.req.param('category') ?? '';
    const subCategory = ctx.req.param('subCategory') ?? '';

    const route = category === '' ? '' : `/${category}${subCategory === '' ? '' : `/${subCategory}`}`;

    const rootUrl = `https://${type === '' ? 'www' : 'list'}.oilchem.net`;
    const currentUrl = `${rootUrl}${type === '' ? '/1/' : type === 'list' ? route : `/${routes[`/${type}${route}`]}`}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const list = $('.list ul ul li a')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: item.attr('href'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = load(detailResponse.data);

                item.description = content('#content').html();
                item.pubDate = timezone(
                    parseDate(
                        content('.xq-head')
                            .find('span')
                            .text()
                            .match(/发布时间：\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}/)[0],
                        'YYYY-MM-DD HH:mm'
                    ),
                    +8
                );

                return item;
            })
        )
    );

    return {
        title: `${$('.hdbox h3').text()} - 隆众资讯`,
        link: currentUrl,
        item: items,
    };
}
