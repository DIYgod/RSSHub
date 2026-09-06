import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/',
    categories: ['government'],
    example: '/mofa',
    name: 'Press conference',
    maintainers: ['sgqy'],
    handler,
};

const baseUrl = 'https://www.mofa.go.jp';
const indexUrl = `${baseUrl}/mofaj/press/kaiken/bn/index.html`;

const eraOffset = new Map([
    ['昭和', 1925],
    ['平成', 1988],
    ['令和', 2018],
]);

async function handler() {
    const response = await ofetch(indexUrl);
    const $ = load(response);

    const detailUrls = $('dl.title-list dt.list-title a')
        .toArray()
        .filter((a) => $(a).text() === 'テキスト版要旨')
        .map((a) => new URL($(a).attr('href')!, baseUrl).href);

    const items = await Promise.all(
        detailUrls.map((url) =>
            cache.tryGet(url, async () => {
                const meeting = await ofetch(url);
                const $ = load(meeting);
                $('div.social-btn-top').remove();

                const title3 = $('h3.title3');
                const matches = title3.text().match(/（(..)(\d+)年(\d+)月(\d+)日（(.)曜日）(\d+)時(\d+)分.*）/);

                return {
                    title: $('meta[property="og:title"]').attr('content'),
                    author: '外務省',
                    pubDate: matches ? timezone(parseDate(`${Number.parseInt(matches[2]) + (eraOffset.get(matches[1]) ?? 0)}-${matches[3]}-${matches[4]} ${matches[6]}:${matches[7]}`), 9) : undefined,
                    link: $('meta[property="og:url"]').attr('content'),
                    description: title3.html() + '<br/>' + $('div#maincontents').html(),
                } as DataItem;
            })
        )
    );

    return {
        title: '日本国外務省記者会見',
        link: indexUrl,
        item: items,
    };
}
