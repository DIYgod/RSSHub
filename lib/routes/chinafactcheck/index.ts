import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

import utils from './utils';

export const route: Route = {
    path: '/',
    categories: ['other'],
    example: '/chinafactcheck',
    radar: [
        {
            source: ['chinafactcheck.com/'],
            target: '',
        },
    ],
    name: '最新文章列表',
    maintainers: ['kdanfly'],
    handler,
    url: 'chinafactcheck.com/',
};

async function handler() {
    const response = await got(utils.siteLink, {
        headers: {
            'user-agent': utils.trueUA,
        },
    });
    const $ = load(response.data);

    const articlesLink = $('.post-info-box .post-thumb a')
        .toArray()
        .map(
            (item): DataItem => ({
                link: $(item).attr('href'),
                title: '',
            })
        );

    const articles = await Promise.all(
        articlesLink.map((item) =>
            cache.tryGet(item.link!, async () => {
                const { title, author, pubDate, description, category } = await utils.getArticleDetail(item.link);

                item.title = title;
                item.author = author;
                item.pubDate = pubDate;
                item.description = description;
                item.category = category;
                return item;
            })
        )
    );

    return {
        title: $('head title').text(),
        link: utils.siteLink,
        item: articles,
    };
}
