// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';

const gixBaseURL = 'https://gixnetwork.org';

export default async (ctx) => {
    const category = ctx.req.param('category');

    let newsURL = gixBaseURL + '/news';
    let feedTitle = 'UW GIX News - ';
    let listSelector = 'body > div.site > div.site-content > div.content-area > main.site-main > ';

    switch (category) {
        case 'blog':
            newsURL += '/blog/';
            feedTitle += 'Blogs';
            listSelector += 'div.blog-wrapper > section.blog-list > article';
            break;
        case 'inthenews':
            newsURL += '/inthenews/';
            feedTitle += 'In The News';
            listSelector += 'div.news-wrapper > section.news-list > article';
            break;
    }

    const response = await got(newsURL);

    const data = response.data;

    const $ = load(data);

    const list = $(listSelector)
        .map((index, item) => {
            item = $(item);
            const content = item.find('header').find('h2').find('a');
            const time = item.find('header').find('span.h4').text();

            return {
                // title: content.text(),
                time,
                link: content.attr('href'),
            };
        })
        .get();

    const itemContent = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const descriptionResponse = await got(item.link);

                const content = load(descriptionResponse.data);

                item.title = content('header.entry-header').find('h1').text();
                item.description = content('div.entry-content').html();
                item.pubDate = Date.parse(item.time);

                return item;
            })
        )
    );

    ctx.set('data', {
        title: feedTitle,
        link: newsURL,
        item: itemContent,
    });
};
