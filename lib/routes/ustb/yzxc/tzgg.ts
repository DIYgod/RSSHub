import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const host = 'https://yzxc.ustb.edu.cn';
const url = `${host}/tzgg/index.htm`;

export const route: Route = {
    path: '/yzxc/tzgg',
    categories: ['university'],
    example: '/ustb/yzxc/tzgg',
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
            source: ['yzxc.ustb.edu.cn/'],
        },
    ],
    name: '研究生招生信息网',
    maintainers: ['yanbot-team'],
    handler,
    url: 'yzxc.ustb.edu.cn/',
};

async function handler() {
    const response = await got(url);
    const $ = load(response.data);
    const list = $('.page_content .ul-inline .box');
    const items = await Promise.all(
        list.map((i, item) => {
            const $item = $(item);
            const time = $item.find('.time').text();
            const titleDom = $item.find('.title a');
            const titleText = titleDom.text();
            const path = titleDom.last().attr('href');
            let itemUrl = '';
            if (path.startsWith('http')) {
                itemUrl = path;
            } else if (path.startsWith('..')) {
                itemUrl = path.replaceAll('..', host);
            } else {
                itemUrl = host + path;
            }
            return cache.tryGet(itemUrl, async () => {
                let description = titleText;
                const result = await got(itemUrl);
                const $ = load(result.data);
                if ($('.article') && $('.article').html()) {
                    description = $('.article').html().trim();
                }
                return {
                    title: titleText,
                    link: itemUrl,
                    pubDate: parseDate(time),
                    description,
                };
            });
        })
    );
    return {
        title: '北京科技大学研究生招生信息网 - 通知公告',
        link: url,
        description: '北京科技大学研究生招生信息网 - 通知公告',
        item: items,
    };
}
