import { load } from 'cheerio';
import type { Context } from 'hono';
import iconv from 'iconv-lite';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const base = 'https://sexinsex.net';
const section = '/bbs/forumdisplay.php?fid=';

const fetchGbk = (url: string, referer: string) =>
    ofetch(url, {
        headers: { Referer: referer },
        responseType: 'arrayBuffer',
    });

export const route: Route = {
    path: '/:id/:type?',
    categories: ['multimedia'],
    example: '/sexinsex/230/634',
    parameters: { id: '分区 id, 可在分区页 URL 中找到', type: '类型 id, 可在分区类型过滤后的 URL 中找到' },
    radar: [{ source: ['sexinsex.net/bbs/:path'] }],
    name: '分区帖子',
    maintainers: ['cnzgray'],
    description: `> 注意：并非所有的分区都有子类型，可以参考亚洲成人有码原创区的 \`字幕\` 这一子类型。

| 亚洲成人无码原创区 | 亚洲成人有码原创区 | 欧美无码原创区 | 欧美无码区 | 亚洲有码薄码区 |
| ------------------ | ------------------ | -------------- | ---------- | -------------- |
| 143                | 230                | 229            | 77         | 58             |`,
    handler,
};

function parseContent(buffer: ArrayBuffer) {
    const htmlString = iconv.decode(Buffer.from(buffer), 'gbk');
    let $ = load(htmlString);
    const author = $('#wrapper > div:nth-child(1) > form > div:nth-child(2) > table > tbody > tr:nth-child(1) > td.postauthor > cite > a').text();
    const regRes = /\d{4}(?:-\d{1,2}){2} \d{1,2}:\d{1,2}/.exec($('.postinfo').text());

    const content = $('.postmessage').html() ?? '';
    $ = load(content);
    $('.postratings').remove();
    $('div.quote').remove();

    return {
        author,
        description: $('body').html(),
        pubDate: regRes ? timezone(parseDate(regRes[0]), 8) : undefined,
    };
}

async function handler(ctx: Context) {
    const { id, type } = ctx.req.param();
    const typefilter = type ? `&filter=type&typeid=${type}` : '';
    const pageUrl = new URL(`${section}${id}${typefilter}`, base).href;

    const res = await fetchGbk(pageUrl, base);
    const data = iconv.decode(Buffer.from(res), 'gbk');
    const $ = load(data);
    const title = (type ? `[${$('.threadlist .headactions strong').text()}]` : '') + $('title').text();
    const list = $('tbody[id^="normalthread_"] tr th').toArray();

    const rawItems = await Promise.all(
        list.map((item) => {
            const $item = $(item);
            const guid = $item.find('span[id^="thread_"]').attr('id')!; // thread_7836473
            const itemTitle = $item.find('span a').text();
            const catalog = $item.find('em').text();
            const link = new URL(`/bbs/${guid.replace('_', '-')}-1-1.html`, base).href;

            return cache.tryGet(link, async () => {
                try {
                    const response = await fetchGbk(link, pageUrl);
                    return {
                        title: `${catalog} ${itemTitle}`,
                        link,
                        guid,
                        ...parseContent(response),
                    };
                } catch {
                    return '';
                }
            });
        })
    );

    return {
        title,
        link: pageUrl,
        item: rawItems.filter((item) => item !== ''),
    };
}
