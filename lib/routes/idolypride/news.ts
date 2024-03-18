import { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/news',
    categories: ['anime'],
    example: '/idolypride/news',
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
            source: ['idolypride.jp/news'],
        },
    ],
    name: 'News',
    maintainers: ['Mingxia1'],
    handler,
    url: 'idolypride.jp/news',
};

async function handler() {
    const response = await got({
        method: 'get',
        url: 'https://idolypride.jp/wp-json/wp/v2/news',
    });
    const list = response.data;

    return {
        title: '偶像荣耀-新闻',
        link: 'https://idolypride.jp/news',
        item: list.map((item) => {
            const title = item.title.rendered;
            const link = item.link;
            const pubDate = timezone(parseDate(item.date_gmt), 0);
            const rendered = item.content.rendered;

            return {
                title,
                link,
                pubDate,
                description: rendered,
            };
        }),
    };
}
