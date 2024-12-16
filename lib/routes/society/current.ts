import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: '/current',
    categories: ['journal'],
    example: '/current',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '《社会》期刊当期目录',
    maintainers: ['CNYoki'],
    handler,
};

async function handler() {
    const url = `https://www.society.shu.edu.cn/CN/1004-8804/current.shtml`;
    const response = await got(url);
    const $ = load(response.body);

    const items = $('.wenzhanglanmu')
        .nextAll('.noselectrow')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const titles = $item.find('.biaoti').text().trim();
            const links = $item.find('.biaoti').attr('href');
            const authors = $item.find('.zuozhe').text().trim();
            const date = $item.find('.kmnjq').text().trim();
            const abstract = $item.find('div[id^="Abstract"]').text().trim();

            if (titles && links) {
                return {
                    title: titles,
                    link: links,
                    description: abstract,
                    author: authors,
                    date,
                };
            }
            return null;
        })
        .filter((item) => item !== null);

    return {
        title: `《社会》期刊当期目录`,
        link: url,
        item: items,
    };
}
