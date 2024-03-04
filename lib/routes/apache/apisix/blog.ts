// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

async function getArticles() {
    const url = 'https://apisix.apache.org/zh/blog/';
    const { data: res } = await got(url);
    const $ = load(res);
    const articles = $('section.sec_gjjg').eq(1).find('article');
    return articles.toArray().map((elem) => {
        const a = $(elem).find('header > a');
        return {
            title: a.find('h2').text(),
            description: a.find('p').text(),
            link: a.attr('href'),
            pubDate: parseDate($(elem).find('footer').find('time').attr('datetime')),
            category: $(elem)
                .find('header div a')
                .toArray()
                .map((elem) => $(elem).text()),
        };
    });
}

export default async (ctx) => {
    const articles = await getArticles();
    ctx.set('data', {
        title: 'Blog | Apache APISIX',
        link: 'https://apisix.apache.org/zh/blog/',
        item: articles,
    });
};
