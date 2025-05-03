import { Route, Data, DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const parseContent = (htmlString) => {
    const $ = load(htmlString);

    const info = $('.detail_main_content > h1')
        .contents()
        .filter((_, element) => element.nodeType === 3)
        .toArray()
        .map((element) => $(element).text().trim());

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

export const route: Route = {
    path: '/dean/:subpath{.+}',
    name: '教务处',
    maintainers: ['hoilc'],
    example: '/xjtu/dean/jxxx/jxtz2',
    description: '打开一个类似 <https://dean.xjtu.edu.cn/jxxx/jxtz2.htm> 的网址，在 `.cn` 后的内容就是 subpath，此例中是 `jxxx/jxtz2`',
    handler,
};

async function handler(ctx) {
    const subpath = ctx.req.param('subpath');

    const url = `http://dean.xjtu.edu.cn/${subpath.replaceAll('.htm', '')}.htm`;
    const base = url.split('/').slice(0, -1).join('/');

    const list_response = await ofetch(url);
    const $ = load(list_response);

    const subName = $('#ny-main > div.ny-tit > div > span')
        .toArray()
        .map((item) => $(item).text())
        .join(' - ');

    const list = $('#ny-main > div.ny.wp > ul > li')
        .toArray()
        .map((item: any) => {
            item = $(item);
            const title = item.find('a').text();
            const link = new URL(item.find('a').attr('href'), base).href;
            return {
                title,
                link,
                pubDate: timezone(parseDate(item.find('span').text(), 'YYYY-MM-DD'), +8),
            };
        });

    const out = await Promise.all(
        list.map((item: DataItem) =>
            cache.tryGet(item.link!, async () => {
                try {
                    const response = await ofetch(item.link!);
                    const result = parseContent(response);

                    item.description = result.description ?? undefined;
                    item.author = result.author;
                } catch {
                    return item;
                }
                return item;
            })
        )
    );

    return {
        title: `西安交大教务处 - ${subName}`,
        link: url,
        item: out.filter((item) => item !== ''),
    } as Data;
}
