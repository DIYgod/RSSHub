import { load } from 'cheerio';
import pMap from 'p-map';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
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
    $('form > div > ul a').each((_, el) => {
        $(el).appendTo(content);
        $('<br>').appendTo(content);
    });
    return {
        author: info[0] || undefined,
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
    const listResponse = await ofetch(url);
    const $ = load(listResponse);
    const subName = $('#ny-main > div.ny-tit > div > span')
        .toArray()
        .map((item) => $(item).text())
        .join(' - ');
    const list = $('#ny-main > div.ny.wp > ul > li')
        .toArray()
        .filter((item) => $(item).find('a').attr('href'))
        .map((item: any) => {
            const $item = $(item);
            const title = $item.find('a').text();
            const link = new URL($item.find('a').attr('href')!, url).href;
            return {
                title,
                link,
                category: $item
                    .find('a i')
                    .toArray()
                    .map((category) =>
                        $(category)
                            .text()
                            .replaceAll(/^\[|\]$/g, '')
                    )
                    .filter(Boolean),
                pubDate: timezone(parseDate($item.find('span').text(), 'YYYY-MM-DD'), 8),
            };
        });
    const out = await pMap(
        list,
        async (item: DataItem) => {
            try {
                const detail = await cache.tryGet(`xjtu:dean:content:v2:${item.link}`, async () => {
                    const response = await ofetch(item.link!);
                    const result = parseContent(response);
                    if (!result.description?.trim()) {
                        throw new Error(`Unable to find article content at ${item.link}`);
                    }
                    return result;
                });
                return { ...item, ...detail };
            } catch {
                return item;
            }
        },
        { concurrency: 3, stopOnError: false }
    );
    return {
        title: `西安交大教务处 - ${subName}`,
        link: url,
        item: out,
    } satisfies Data;
}
