import { load } from 'cheerio';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/time';

const ProcessImage = ($, e) => {
    const photo = $(e).find('figure').find('picture').find('img');

    let cover = `<figure><img src='${photo.attr('src')}'><br><figcaption>`;

    const caption = $(e).find('figcaption');

    cover += `${$(caption[0]).text().trim()}</figcaption></figure>`;

    return cover;
};

const PuppeterGetter = async (ctx, context, link) => {
    const result = await cache.tryGet(`nyt: ${link}`, async () => {
        const page = await context.newPage();
        try {
            await page.route('**/*', (route) => {
                const request = route.request();
                request.resourceType() === 'document' ? route.continue() : route.abort();
            });
            await page.goto(link, {
                waitUntil: 'domcontentloaded',
            });
            return await page.evaluate(() => document.querySelector('body')!.getHTML());
        } finally {
            await page.close();
        }
    });
    return result;
};

const ProcessFeed = (data, hasEnVersion = false) => {
    const $ = load(data);

    let content;
    const result: Pick<DataItem, 'description' | 'title' | 'author' | 'pubDate'> = { title: '' };

    // 处理 www.nytimes.com
    if (hasEnVersion) {
        content = $('section[name="articleBody"]');
        result.title = `「英」${$('h1').text()}`;
        result.author = $('article#story span[itemprop="name"]').text();

        // 处理封面图片
        $('article#story > header')
            .find('div[data-testid="photoviewer-wrapper"]')
            .each((i, e) => {
                const cover = ProcessImage($, e);

                $(cover).insertBefore(content[0].firstChild);
            });

        // 处理图片
        content.find('div[data-testid="photoviewer-wrapper"]').each((i, e) => {
            const cover = ProcessImage($, e);
            $(cover).insertBefore(e);
            $(e).remove();
        });

        // remove ad
        content.find('#CNB').remove();
        // remove useless DOMs
        content.find('aside').each((i, e) => {
            $(e).remove();
        });
    }
    // 处理 cn.nytimes.com
    else {
        content = $('section.article-body');

        // remove useless DOMs
        content.find('div.big_ad, div.article-body-aside').each((i, e) => {
            $(e).remove();
        });

        // divide paragraphs with <p>
        content.find('div.article-paragraph').each((i, e) => {
            $(e).html(`<p>${$(e).html()}</p>`);
        });

        if ($('figure.article-span-photo').length > 0) {
            // there is a cover photo
            const cover = $('figure.article-span-photo');
            $(cover).insertBefore(content[0].firstChild);
        }
    }

    const time = $('time').attr('datetime');
    if (time) {
        result.pubDate = parseDate(time);
    }

    result.description = content.html();

    return result;
};

export default { ProcessFeed, PuppeterGetter };
