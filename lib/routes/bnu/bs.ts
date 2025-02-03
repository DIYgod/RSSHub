import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/bs/:category?',
    categories: ['university'],
    example: '/bnu/bs',
    parameters: { category: '分类，见下表，默认为学院新闻' },
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
            source: ['bs.bnu.edu.cn/:category/index.html'],
            target: '/bs/:category',
        },
    ],
    name: '经济与工商管理学院',
    maintainers: ['nczitzk'],
    handler,
    description: `| 学院新闻 | 通知公告 | 学术成果 | 学术讲座 | 教师观点 | 人才招聘 |
| -------- | -------- | -------- | -------- | -------- | -------- |
| xw       | zytzyyg  | xzcg     | xzjz     | xz       | bshzs    |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'xw';

    const rootUrl = 'http://bs.bnu.edu.cn';
    const currentUrl = `${rootUrl}/${category}/index.html`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const list = $('a[title]')
        .map((_, item) => {
            item = $(item);

            return {
                title: item.attr('title'),
                pubDate: parseDate(item.prev().text()),
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

                item.description = content('.right-c-content-con').html();

                return item;
            })
        )
    );

    return {
        title: `${$('.right-c-title').text()} - ${$('title').text()}`,
        link: currentUrl,
        item: items,
    };
}
