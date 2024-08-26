import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/jwgg',
    categories: ['university'],
    example: '/cdu/jwgg',
    parameters: {},
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
            source: ['jw.cdu.edu.cn/'],
        },
    ],
    name: '教务公告--教务处',
    maintainers: ['MR.Mai'],
    handler,
    url: 'jw.cdu.edu.cn/',
};

async function handler() {
    const url = 'https://jw.cdu.edu.cn/jwgg.htm';
    const response = await got.get(url);
    const data = response.data;
    const $ = load(data);
    const list = $('.itemList li')
        .slice(0, 10)
        .toArray()
        .map((e) => {
            const element = $(e);
            const title = element.find('li a').attr('title');
            const link = element.find('li a').attr('href');
            const date = element
                .find('li a')
                .text()
                .match(/\d{4}-\d{2}-\d{2}/);
            const pubDate = timezone(parseDate(date), 8);

            return {
                title,
                link: 'https://jw.cdu.edu.cn/info/' + link,
                author: '成都大学教务处--公告',
                pubDate,
            };
        });

    const result = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const itemReponse = await got.get(item.link);
                const data = itemReponse.data;
                const itemElement = load(data);

                item.description = itemElement('.articleTxt').html();

                return item;
            })
        )
    );

    return {
        title: '成大教务处公告',
        link: url,
        item: result,
    };
}
