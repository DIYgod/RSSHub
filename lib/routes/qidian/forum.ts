// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseRelativeDate } from '@/utils/parse-date';

export default async (ctx) => {
    const id = ctx.req.param('id');

    const url = `https://forum.qidian.com/NewForum/List.aspx?BookId=${id}`;

    const forum_response = await got(url, {
        headers: {
            Referer: `https://book.qidian.com/info/${id}`,
        },
    });

    const $ = load(forum_response.data);
    const name = $('.main-header>h1').text();
    const cover_url = $('img.forum_book').attr('src');
    const list = $('li.post-wrap>.post');

    const items = [];
    for (const el of list) {
        const title = $(el).children().eq(1).find('a');
        items.push({
            title: title.text(),
            link: `https:${title.attr('href')}`,
            description: $(el).text(),
            pubDate: parseRelativeDate($(el).find('.post-info>span').text()),
        });
    }

    ctx.set('data', {
        title: `起点 《${name}》讨论区`,
        link: url,
        image: cover_url,
        item: items,
    });
};
