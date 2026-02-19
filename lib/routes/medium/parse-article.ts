import { load } from 'cheerio';

import { config } from '@/config';
import cache from '@/utils/cache';
import got from '@/utils/got';

async function parse(url, cookie = '') {
    const { data } = await got(url, {
        headers: {
            cookie,
        },
    });
    const $ = load(data);

    const publishedTime = $('meta[property="article:published_time"]').attr('content');
    const author = $('meta[name="author"]').attr('content');

    const article = $('body article');

    // remove header actions
    article.find('header').remove();

    // get and remove title
    const title = article.find('h1').first();
    const titleText = title.text();
    title.remove(); // remove title from html

    // get subtitle and remove author actions
    const subtitle = article.find('.pw-subtitle-paragraph');
    const subtitleText = subtitle.text();
    if (subtitle.length === 0) {
        // no subtitle
        article.find('.pw-post-body-paragraph').siblings().first().remove();
    } else {
        // preserve subtitle in html
        subtitle.siblings().remove();
    }

    return {
        title: titleText,
        subtitle: subtitleText,
        author,
        publishedTime,
        html: article.html(),
        url,
    };
}

export default function parseArticle(ctx, url) {
    return cache.tryGet(`medium:article:${url}`, async () => {
        const { title, author, publishedTime, html } = await parse(url, config.medium.articleCookie);

        return {
            title,
            author,
            link: url,
            description: html,
            pubDate: publishedTime,
        };
    });
}
