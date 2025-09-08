import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/shaanxi/kjt/:id?',
    categories: ['government'],
    example: '/gov/shaanxi/kjt',
    parameters: { id: '分类，见下表，默认为通知公告' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '省科学技术厅',
    maintainers: ['nczitzk'],
    handler,
    description: `| 科技头条 | 工作动态 | 基层科技 | 科技博览 | 媒体聚焦 | 通知公告 |
| -------- | -------- | -------- | -------- | -------- | -------- |
| 1061     | 24       | 27       | 25       | 28       | 221      |`,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? '221';

    const rootUrl = 'https://kjt.shaanxi.gov.cn';
    const currentUrl = `${rootUrl}/view/iList.jsp?cat_id=${id}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.textlist li a')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href')}`,
                pubDate: parseDate(item.prev().text()),
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

                item.description = content('.info_content').html();
                item.author = content('meta[name="Author"]').attr('content');
                item.pubDate = timezone(parseDate(content('meta[name="PubDate"]').attr('content')), +8);

                return item;
            })
        )
    );

    return {
        title: `陕西省科学技术厅 - ${$('.catnm').text()}`,
        link: currentUrl,
        item: items,
    };
}
