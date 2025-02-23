import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/journals/society/current',
    categories: ['journal'],
    example: '/journals/society/current',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '《社会》杂志当期目录',
    maintainers: ['CNYoki'],
    handler,
};

async function handler() {
    const url = 'https://www.society.shu.edu.cn/CN/1004-8804/current.shtml';
    const response = await got(url);
    const $ = load(response.body);

    // 提取刊出日期
    const pubDateText = $('.dqtab .njq')
        .text()
        .match(/刊出日期：(\d{4}-\d{2}-\d{2})/);
    const pubDate = pubDateText ? parseDate(pubDateText[1]) : null;

    const items = $('.wenzhanglanmu')
        .nextAll('.noselectrow')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const titles = $item.find('.biaoti').text().trim();
            const links = $item.find('.biaoti').attr('href');
            const authors = $item.find('.zuozhe').text().trim();
            const abstract = $item.find('div[id^="Abstract"]').text().trim();

            if (titles && links) {
                return {
                    title: titles,
                    link: links,
                    description: abstract,
                    author: authors,
                    pubDate,
                };
            }
            return null;
        })
        .filter((item) => item !== null);

    return {
        title: '《社会》当期目录',
        link: url,
        item: items,
    };
}
