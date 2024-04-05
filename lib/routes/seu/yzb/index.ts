import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/yzb/:type',
    categories: ['university'],
    example: '/seu/yzb/6676',
    parameters: { type: '分类名，见下表' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['yzb.seu.edu.cn/:type/list.htm'],
        },
    ],
    name: '研究生招生网通知公告',
    maintainers: ['fuzy112'],
    handler,
    description: `| 硕士招生 | 博士招生 | 港澳台及中外合作办学 |
  | -------- | -------- | -------------------- |
  | 6676     | 6677     | 6679                 |`,
};

async function handler(ctx) {
    const host = 'https://yzb.seu.edu.cn';

    const map = {
        6676: { id: 1 },
        6677: { id: 2 },
        6679: { id: 3 },
    };

    const type = ctx.req.param('type');
    const id = type.length === 1 ? Object.keys(map).find((key) => map[key].id === Number.parseInt(type)) : Number.parseInt(type); // backward compatible
    const url = new URL(`${id}/list.htm`, host).href;

    const { data: response } = await got(url);
    const $ = load(response);

    const list = $('#wp_news_w3 td tbody tr')
        .toArray()
        .map((elem) => {
            elem = $(elem);
            const a = elem.find('td a');
            return {
                title: a.attr('title'),
                link: new URL(a.attr('href'), host).href,
                pubDate: parseDate(elem.find('td div').text()),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);

                item.description = $('.Article_Content').html();

                return item;
            })
        )
    );

    return {
        link: url,
        title: `东南大学研究生招生网 -- ${$('head title').text()}`,
        item: items,
    };
}
