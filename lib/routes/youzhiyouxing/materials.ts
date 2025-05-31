import { Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/materials/:id?',
    categories: ['finance'],
    view: ViewType.Articles,
    example: '/youzhiyouxing/materials',
    parameters: {
        id: {
            description: '分类',
            options: [
                { value: '0', label: '全部' },
                { value: '4', label: '知行小酒馆' },
                { value: '2', label: '知行黑板报' },
                { value: '10', label: '无人知晓' },
                { value: '1', label: '孟岩专栏' },
                { value: '3', label: '知行读书会' },
                { value: '11', label: '你好，同路人' },
            ],
            default: '0',
        },
    },
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
            source: ['youzhiyouxing.cn/materials'],
            target: '/materials',
        },
    ],
    name: '有知文章',
    maintainers: ['broven', 'Fatpandac', 'nczitzk'],
    handler,
    url: 'youzhiyouxing.cn/materials',
    description: `| 全部 | 知行小酒馆 | 知行黑板报 | 无人知晓 | 孟岩专栏 | 知行读书会 | 你好，同路人 |
| :--: | :--------: | :--------: | :------: | :------: | :--------: | :----------: |
|   0  |      4     |      2     |    10    |     1    |      3     |      11      |`,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? '';

    const rootUrl = 'https://youzhiyouxing.cn';
    const currentUrl = `${rootUrl}/materials?column_id=${id}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('li[id*="material"]')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `${rootUrl}${item.find('a').attr('href')}`,
                pubDate: parseDate(item.find('.tw-text-t-muted').text(), ['YYYY年M月D日', 'M月D日']),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                item.author = content('.tw-inline').text().replace('·', '');
                item.description = content('#zx-material-marker-root')
                    .html()
                    .replaceAll(/(<img.*?) src(=.*?>)/g, '$1 data$2')
                    .replaceAll(/(<img.*?) data-src(=.*?>)/g, '$1 src$2');

                return item;
            })
        )
    );

    return {
        title: `有知有行 - ${$(`a[phx-value-column_id="${id === '' ? 0 : id}"]`).text()}`,
        link: currentUrl,
        item: items,
    };
}
