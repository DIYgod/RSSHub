import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { Route } from '@/types';

export const route: Route = {
    path: '/newlist',
    categories: ['study'],
    example: '/ncpssd/newlist',
    radar: [
        {
            source: ['ncpssd.cn/', 'ncpssd.cn/newlist'],
        },
    ],
    name: '最新文献',
    maintainers: ['LyleLee'],
    handler,
    url: 'ncpssd.cn/',
};

async function handler() {
    const baseUrl = 'https://www.ncpssd.cn';
    const argument = '/newlist?type=0';

    const response = await got({
        method: 'get',
        url: baseUrl + argument,
    });

    const data = response.data;
    const $ = load(data);
    const items = $('.news-list > li');

    const list = items.toArray().map((p) => {
        const title = $(p)
            .find('a')
            .text()
            .replaceAll(/(\r\n|\n|\r)/gm, '')
            .trim();
        const articleUrl =
            baseUrl +
            $(p)
                .find('a')
                .attr('onclick')
                ?.match(/\('(.*?)'\)/)?.[1];
        const parseUrl = new URL(articleUrl);

        return {
            title,
            link: articleUrl,
            lngid: parseUrl.searchParams.get('id'),
            type: parseUrl.searchParams.get('typename'),
            pageType: parseUrl.searchParams.get('nav'),
        };
    });

    const paper = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const url = 'https://www.ncpssd.cn/articleinfoHandler/getjournalarticletable'; // Adjust the URL accordingly
                const headers = {
                    Accept: 'application/json, text/javascript, */*; q=0.01',
                    'Content-Type': 'application/json; charset=UTF-8',
                };

                const requestBody = {
                    lngid: item.lngid,
                    type: item.type,
                    pageType: item.pageType,
                };

                const response = await got.post(url, {
                    headers,
                    json: requestBody,
                    responseType: 'json', // Set the expected response type
                });

                return {
                    title: item.title,
                    link: item.link,
                    author: response.data.data.showwriter,
                    description: response.data.data.remarkc,
                    pubDate: parseDate(response.data.data.publishDateTime),
                };
            })
        )
    );

    return {
        // 源标题
        title: '国家哲学社会科学文献中心',
        // 源链接
        link: baseUrl + argument,
        // 源文章
        item: paper,
    };
}
