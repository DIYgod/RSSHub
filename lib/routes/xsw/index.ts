import { load } from 'cheerio';

import type { Data, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { namespace } from './namespace';

const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

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
    const html = await ofetch(link, { headers: { 'User-Agent': UA } });
    const $ = load(html);

    // 全书无逐章时间戳，站点唯一提供的时间是书页的「更新：…」行（东八区）
    const block = $('.block_txt2');
    const updatedAt = block
        .find('p:contains("更新")')
        .first()
        .text()
        .match(/更新：([0-9/]+ [0-9:]+)/)?.[1];
    const pubDate = timezone(parseDate(updatedAt ?? '', 'YYYY/M/D H:mm:ss'), 8);

    // 书页内嵌「最新章节预览」10 条，完整目录需翻 /page-N(-1).html
    const items = $('.chapter li a')
        .toArray()
        .map((el) => {
            const a = $(el);
            return {
                title: a.text().trim(),
                link: new URL(a.attr('href')!, link).href,
                pubDate,
            };
        });

    return {
        title: `${block.find('h2').first().text().trim()} - ${namespace.name}`,
        link,
        item: items,
    };
}
