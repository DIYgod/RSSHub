import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const link = 'https://computer.hdu.edu.cn';
const host = 'https://computer.hdu.edu.cn/6738/list.htm';

const getSingleRecord = async () => {
    const res = await got(host);

    const $ = load(res.data);
    const list = $('.posts-list').find('li');

    return (
        list &&
        list
            .map((index, item) => {
                item = $(item);
                const dateTxt = item.find('.date').text();
                const date = dateTxt.slice(1, -1);
                return {
                    title: item.find('a').text(),
                    pubDate: parseDate(date),
                    link: link + item.find('a').attr('href'),
                };
            })
            .get()
    );
};

export const route: Route = {
    path: '/cs',
    categories: ['university'],
    example: '/hdu/cs',
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
            source: ['computer.hdu.edu.cn/6738/list.htm'],
        },
    ],
    name: '计算机学院 - 通知公告',
    maintainers: ['legr4ndk'],
    handler,
    url: 'computer.hdu.edu.cn/6738/list.htm',
};

async function handler() {
    const items = await getSingleRecord();
    const out = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = load(response.data);
                return {
                    title: item.title,
                    link: item.link,
                    description: $('.wp_articlecontent').html(),
                    pubDate: item.pubDate,
                };
            })
        )
    );

    return {
        title: '杭电计算机-通知公告',
        description: '杭州电子科技大学计算机学院-通知公告',
        link: host,
        item: out,
    };
}
