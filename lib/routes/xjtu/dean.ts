// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const parseContent = (htmlString) => {
    const $ = load(htmlString);

    const info = $('.detail_main_content > h1')
        .contents()
        .filter(function () {
            return this.nodeType === 3;
        })
        .map(function () {
            return $(this).text().trim();
        })
        .get();

    const content = $('[id^="vsb_content"]');
    $('form > div > ul a').each(function () {
        $(this).appendTo(content);
        $('<br>').appendTo(content);
    });

    return {
        author: info[0] || '教务处',
        description: content.html(),
    };
};

export default async (ctx) => {
    const subpath = ctx.req.param('subpath');

    const url = `http://dean.xjtu.edu.cn/${subpath.replaceAll('.htm', '')}.htm`;
    const base = url.split('/').slice(0, -1).join('/');

    const list_response = await got(url);
    const $ = load(list_response.data);

    const subname = $('em.ma-nav a')
        .slice(1)
        .map(function () {
            return $(this).text();
        })
        .get()
        .join(' - ');

    const list = $('.list_main_content > .list-li')
        .toArray()
        .map((item) => {
            item = $(item);
            const title = item.find('a').attr('title');
            const link = new URL(item.find('a').attr('href'), base).href;
            return {
                title,
                link,
                pubDate: timezone(parseDate(item.find('.list_time').text(), 'YYYY-MM-DD'), +8),
            };
        });

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const response = await got(item.link);
                    const result = parseContent(response.data);

                    item.description = result.description;
                    item.author = result.author;
                } catch {
                    return item;
                }
                return item;
            })
        )
    );

    ctx.set('data', {
        title: `西安交大教务处 - ${subname}`,
        link: url,
        item: out.filter((item) => item !== ''),
    });
};
