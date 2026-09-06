import { load } from 'cheerio';
import { decodeXML } from 'entities';
import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/newbook/:count?',
    categories: ['reading'],
    example: '/aozora/newbook/10',
    parameters: { count: '更新数量. 设置每次下载列表大小. 范围是 1 到 50.' },
    description: '书籍网站每日一更。信息更新时间为书籍最初出版时间，排序可能不符合网络发表时间，请认准未读消息.',
    name: '新着リスト',
    maintainers: ['sgqy'],
    handler,
};

const baseUrl = 'https://www.aozora.gr.jp/index_pages/';

async function handler(ctx: Context) {
    const listUrl = `${baseUrl}whatsnew1.html`;
    const response = await ofetch(listUrl);

    const $ = load(response);
    const list = $('table.list tr');

    // get how many new-books. amount in this page is 50
    let count = Number.parseInt(ctx.req.param('count') ?? '');
    if (Number.isNaN(count) || count < 1) {
        count = 10; // default count of new-book list
    } else if (count > 50) {
        count = 50;
    }

    // parse book urls
    const detailUrls: string[] = [];
    for (let i = 1; i < count + 1; ++i) {
        // i = 1: first tr is table title, ignore
        detailUrls.push(baseUrl + $(list[i]).find('a').attr('href'));
    }

    const item = await Promise.all(
        detailUrls.map((detailUrl) =>
            cache.tryGet(detailUrl, async () => {
                const card = await ofetch(detailUrl);
                const $detail = load(card);
                const link = $detail('meta[property="og:url"]').attr('content')!;

                let author = '';
                let title = '';
                let titleSub = '';
                for (const element of $detail('table[summary="タイトルデータ"] > tbody > tr').toArray()) {
                    const tmp = decodeXML($detail(element).html()!); // should convert from escaped to unicode
                    if (tmp.includes('作品名：')) {
                        title = $detail(element).find('td:nth-child(2)').text();
                    }
                    if (tmp.includes('副題：')) {
                        titleSub = $detail(element).find('td:nth-child(2)').text();
                    }
                    if (tmp.includes('著者名：')) {
                        author = $detail(element).find('td:nth-child(2)').text();
                    }
                }
                if (titleSub !== '') {
                    title += '　——　' + titleSub;
                }

                const pubDateRaw = $detail('table[summary="底本データ"] > tbody > tr:nth-child(3) > td:nth-child(2)').text();
                const pubDateNum = pubDateRaw.replaceAll(/（.*）|日/g, '').replaceAll(/[年月]/g, '-');
                const fullTextLink = $detail('table.download > tbody > tr:nth-child(3) > td:nth-child(3) > a').attr('href');
                const fullTextLinkHtml = `<a href="${fullTextLink}">いますぐXHTML版で読む</a><br>`;
                const summury = $detail('table[summary="作品データ"]').html()!;

                return {
                    title,
                    author,
                    pubDate: parseDate(pubDateNum),
                    link,
                    description: fullTextLinkHtml + summury,
                };
            })
        )
    );

    return {
        title: '青空文庫新着リスト',
        link: listUrl,
        item,
    };
}
