import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootUrl = 'https://oversea.cnki.net';

export const route: Route = {
    path: '/journals/debut/:name',
    categories: ['journal'],
    example: '/cnki/journals/debut/LKGP',
    parameters: { name: '期刊缩写，可以在网址中得到' },
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
            source: ['navi.cnki.net/knavi/journals/:name/detail'],
        },
    ],
    name: '网络首发',
    maintainers: ['Fatpandac'],
    handler,
};

const fetchDetail = async (item: DataItem, detailUrl: string) => {
    const response = await ofetch(detailUrl);
    const $ = load(response);
    const summary = $('#ChDivSummary');

    // The site sometimes cuts the page short; throw so the incomplete result is not cached.
    if (!summary.length) {
        throw new Error(`Incomplete article page: ${item.link}`);
    }

    item.description = summary.html()?.trim();
    item.category = $('p.keywords a')
        .toArray()
        .map((keyword) => $(keyword).text().replace(/;$/, '').trim())
        .filter(Boolean);

    return item;
};

async function handler(ctx) {
    const name = ctx.req.param('name');

    const journalUrl = `${rootUrl}/knavi/journals/${name}/detail?uniplatform=OVERSEA&language=CHS`;

    const [journalPage, response] = await Promise.all([
        ofetch(journalUrl),
        // The site's own request sends these as a form body, which its CDN currently times out (HTTP 522).
        // The backend reads them from the query string too. Without a Referer it redirects to the home page.
        ofetch(`${rootUrl}/knavi/journals/${name}/papers/outline`, {
            method: 'POST',
            query: {
                uniplatform: 'OVERSEA',
                language: 'CHS',
                pageIdx: 0,
                type: 2,
                pcode: 'CJFD,CCJD',
            },
            headers: {
                referer: journalUrl,
            },
        }),
    ]);
    const $journal = load(journalPage);
    const title = $journal('#shareChName').attr('value') || $journal('head > title').text();
    const $ = load(response);

    const list = $('dd.row')
        .toArray()
        .map((element) => {
            const $item = $(element);
            const $title = $item.find('span.name > a');
            const filename = $item.find('b[name="encrypt"]').attr('id');
            const date = $item.find('span.company').attr('title');

            return {
                filename,
                // The list links carry a per-request token, so they are only used to fetch the article page.
                detailUrl: $title.attr('href') || `${rootUrl}/openlink/detail?dbcode=CJFD&filename=${filename}`,
                item: {
                    title: $title.text().trim(),
                    link: `https://cnki.net/kcms/detail/detail.aspx?filename=${filename}&dbcode=CJFD`,
                    author: $item
                        .find('span.author')
                        .attr('title')
                        ?.split(';')
                        .map((author) => author.trim())
                        .filter(Boolean)
                        .join(', '),
                    pubDate: date ? timezone(parseDate(date, 'YYYY-MM-DD HH:mm:ss'), 8) : undefined,
                } as DataItem,
            };
        })
        .filter(({ filename }) => filename);

    const items = await Promise.all(
        list.map(async ({ detailUrl, item }) => {
            try {
                return await cache.tryGet(item.link!, () => fetchDetail(item, detailUrl));
            } catch {
                // Keep the item without an abstract when the article page fails
                return item;
            }
        })
    );

    return {
        title: `${title} - 全网首发`,
        link: `https://navi.cnki.net/knavi/journals/${name}/detail`,
        item: items as DataItem[],
    };
}
