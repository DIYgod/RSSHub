import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: '/scientific',
    categories: ['new-media'],
    example: '/guokr/scientific',
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
            source: ['guokr.com/scientific', 'guokr.com/'],
        },
    ],
    name: '科学人',
    maintainers: ['alphardex', 'nczitzk'],
    handler,
    url: 'guokr.com/scientific',
};

async function handler() {
    const response = await got('https://www.guokr.com/apis/minisite/article.json?retrieve_type=by_subject&limit=20&offset=0');

    const result = response.data.result;

    return {
        title: '果壳网 科学人',
        link: 'https://www.guokr.com/scientific',
        description: '果壳网 科学人',
        item: await Promise.all(
            result.map((item) =>
                cache.tryGet(item.url, async () => {
                    const res = await got(item.url);
                    const $ = load(res.data);
                    item.description = $('.eflYNZ #js_content').css('visibility', 'visible').html() ?? $('.bxHoEL').html();
                    return {
                        title: item.title,
                        description: item.description,
                        pubDate: item.date_published,
                        link: item.url,
                        author: item.author.nickname,
                    };
                })
            )
        ),
    };
}
