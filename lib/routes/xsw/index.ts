import { load } from 'cheerio';

import { config } from '@/config';
import type { Data, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { namespace } from './namespace';

export const route: Route = {
    path: '/:bookId',
    categories: ['reading'],
    example: '/xsw/17301350',
    parameters: { bookId: '书籍编号，见网址如 /17301350/ 中的数字' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['m.xsw.tw/:bookId/'],
        },
    ],
    name: '章节目录',
    maintainers: ['xbpk3t'],
    handler,
};

async function handler(ctx): Promise<Data> {
    const { bookId } = ctx.req.param();
    // 该站 HTTPS 证书链不完整，http 直连可用且不跳转
    const link = `http://m.xsw.tw/${bookId}/`;

    // 页面 meta 谎报 big5，实际字节为 UTF-8：ofetch/undici 默认按 UTF-8 解码，勿按 meta 转码
    const html = await ofetch(link, { headers: { 'User-Agent': config.trueUA } });
    const $ = load(html);

    // 全书无逐章时间戳，站点唯一提供的时间是书页的「更新：…」行（东八区）
    const block = $('.block_txt2');
    const updatedAt = block
        .find('p:contains("更新")')
        .text()
        .match(/更新：([0-9/]+ [0-9:]+)/)?.[1];
    const pubDate = timezone(parseDate(updatedAt ?? '', 'YYYY/M/D H:mm:ss'), 8);

    // 书页内嵌「最新章节预览」10 条，完整目录为 /pages/{n}.html
    const items = $('.chapter li a')
        .toArray()
        .map((el) => {
            const a = $(el);
            return {
                title: a.text(),
                link: new URL(a.attr('href')!, link).href,
                pubDate,
            };
        });

    return {
        title: `${block.find('h2').text()} - ${namespace.name}`,
        link,
        item: items,
    };
}
