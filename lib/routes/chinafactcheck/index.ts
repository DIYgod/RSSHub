// @ts-nocheck
import cache from '@/utils/cache';
const utils = require('./utils');
import { load } from 'cheerio';
import got from '@/utils/got';

export default async (ctx) => {
    const response = await got(utils.siteLink, {
        headers: {
            'user-agent': utils.trueUA,
        },
    });
    const $ = load(response.data);

    const articlesLink = $('.post-info-box .post-thumb a')
        .toArray()
        .map((item) => ({ link: $(item).attr('href') }));

    const articles = await Promise.all(
        articlesLink.map((item) =>
            cache.tryGet(item.link, async () => {
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

    ctx.set('data', {
        title: $('head title').text(),
        link: utils.siteLink,
        item: articles,
    });
};
