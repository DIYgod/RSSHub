import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseRelativeDate } from '@/utils/parse-date';

const host = 'https://guangdiu.com';

export const route: Route = {
    path: '/:query?',
    categories: ['shopping'],
    example: '/guangdiu/k=daily',
    parameters: { query: '链接参数，对应网址问号后的内容' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '国内折扣 / 海外折扣',
    maintainers: ['Fatpandac'],
    handler,
    description: `::: tip
  海外折扣: [\`/guangdiu/k=daily&c=us\`](https://rsshub.app/guangdiu/k=daily\&c=us)
:::`,
};

async function handler(ctx) {
    const query = ctx.req.param('query') ?? '';
    const url = query === 'c=us' ? `${host}/?c=us` : `${host}/${query ? `cate.php?${query}` : ''}`;

    const response = await got(url);
    const $ = load(response.data);
    const list = $('#mainleft > div.zkcontent > div.gooditem')
        .toArray()
        .map((item) => ({
            title: $(item).find('a.goodname').text().trim(),
            link: new URL($(item).find('div.iteminfoarea > h2 > a').attr('href'), host).href,
        }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const $ = load(detailResponse.data);

                item.description = $('#dabstract').html() + $('a.dgotobutton').html('前往购买');
                item.pubDate = parseRelativeDate($('span.latesttime').text());

                return item;
            })
        )
    );

    return {
        title: `逛丢 - ${query.includes('c=us') ? '海外' : '国内'}`,
        link: url,
        item: items,
    };
}
