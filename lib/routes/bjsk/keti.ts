import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/keti/:id?',
    categories: ['government'],
    example: '/bjsk/keti',
    parameters: { id: '分类 id，见下表，默认为通知公告' },
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
            source: ['keti.bjsk.org.cn/indexAction!to_index.action', 'keti.bjsk.org.cn/'],
            target: '/keti/:id',
        },
    ],
    name: '基金项目管理平台',
    maintainers: ['nczitzk'],
    handler,
    url: 'keti.bjsk.org.cn/indexAction!to_index.action',
    description: `| 通知公告                         | 资料下载                         |
  | -------------------------------- | -------------------------------- |
  | 402881027cbb8c6f017cbb8e17710002 | 2c908aee818e04f401818e08645c0002 |`,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? '402881027cbb8c6f017cbb8e17710002';
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 100;

    const rootUrl = 'https://keti.bjsk.org.cn';
    const currentUrl = `${rootUrl}/articleAction!to_moreList.action?entity.columnId=${id}&pagination.pageSize=${limit}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('a.news')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.find('.zizizi').text(),
                link: `${rootUrl}${item.attr('href')}`,
                pubDate: parseDate(item.find('.date').text()),
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

                item.description = content('.d_text').html();
                item.author = content('div.d_information p span').last().text();

                return item;
            })
        )
    );

    return {
        title: `北京社科基金项目管理平台 - ${$('.noticetop').text()}`,
        link: currentUrl,
        item: items,
    };
}
