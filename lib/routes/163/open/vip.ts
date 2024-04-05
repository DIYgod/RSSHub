import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/open/vip',
    categories: ['study'],
    example: '/163/open/vip',
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
            source: ['vip.open.163.com/'],
        },
    ],
    name: '精品课程',
    maintainers: ['hoilc'],
    handler,
    url: 'vip.open.163.com/',
};

async function handler() {
    const url = 'https://vip.open.163.com';

    const list_response = await got(url);
    const $ = load(list_response.data);
    const initialState = JSON.parse(
        $('script')
            .text()
            .match(/window\.__INITIAL_STATE__=(.*);\(function\(\){var/)[1]
    );

    const list = Object.values(initialState.courseindex.myModules).flatMap((mod) =>
        mod.contents.map((item) => ({
            title: `${item.title} - ${item.subtitle}`,
            author: item.authorName,
            pubDate: parseDate(item.publishTime, 'x'),
            link: `${url}/courses/${item.courseUid}/`,
            courseUid: item.courseUid,
            category: mod.name,
        }))
    );

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const {
                    data: { data },
                } = await got.post(`${url}/open/trade/pc/course/getCourseInfo.do`, {
                    form: {
                        courseUid: item.courseUid,
                        version: 1,
                    },
                });

                const $ = load(data.courseInfo.description, null, false);
                $('img').each((_, img) => {
                    img.attribs.src = img.attribs.src.split('?')[0];
                    delete img.attribs.width;
                });

                item.category = [item.category, data.courseInfo.firstClassifyName, data.courseInfo.secondClassifyName];
                item.description = art(path.join(__dirname, '../templates/open.art'), {
                    data,
                    description: $.html(),
                });

                return item;
            })
        )
    );

    return {
        title: '网易公开课 - 精品课程',
        link: url,
        item: items,
    };
}
