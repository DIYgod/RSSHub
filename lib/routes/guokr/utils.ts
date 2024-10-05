import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';
import got from '@/utils/got';
import * as cheerio from 'cheerio';

export const parseList = (result) =>
    result.map((item) => ({
        title: item.title,
        description: item.summary,
        pubDate: parseDate(item.date_published),
        link: `https://www.guokr.com/article/${item.id}/`,
        author: item.author.nickname,
        category: item.subject?.name,
        id: item.id,
        channels: item.channels,
    }));

export const parseItem = (item) =>
    cache.tryGet(item.link, async () => {
        const { data: res } = await got(`https://apis.guokr.com/minisite/article/${item.id}.json`);
        const $ = cheerio.load(res.result.content);

        $('#meta_content').remove();
        $('div').each((_, elem) => {
            const $elem = $(elem);
            $elem.attr('style', $elem.attr('style')?.replaceAll(/(?:display:\s*none|visibility:\s*hidden|opacity:\s*0);?/g, ''));
        });
        $('img').each((_, elem) => {
            const $elem = $(elem);
            if ($elem.attr('data-src')) {
                $elem.attr('src', $elem.attr('data-src'));
            }
        });
        item.description = $.html();

        return item;
    });
