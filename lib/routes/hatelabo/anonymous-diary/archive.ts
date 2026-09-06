import { load } from 'cheerio';

import type { Data, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/anonymous_diary/archive',
    categories: ['other'],
    example: '/hatelabo/anonymous_diary/archive',
    name: 'はてな匿名ダイアリー - 人気記事アーカイブ',
    maintainers: ['yuanji-dev'],
    handler,
};

const baseURL = 'https://anond.hatelabo.jp';

async function handler(): Promise<Data> {
    const archiveIndex = await ofetch(`${baseURL}/archive`);
    const latestURL = new URL(load(archiveIndex)('.archives a').attr('href')!, baseURL).href;
    const response = await ofetch(latestURL);

    const $ = load(response);

    return {
        title: 'はてな匿名ダイアリー - 人気記事アーカイブ',
        link: `${baseURL}/archive`,
        language: 'ja',
        item: $('.archives li')
            .toArray()
            .map((item) => {
                const $item = $(item);
                const a = $item.find('a').first();
                const href = a.attr('href')!;

                return {
                    title: a.text(),
                    description: $item.find('blockquote p').text(),
                    link: new URL(href, baseURL).href,
                    pubDate: timezone(parseDate(href.replace('/', ''), 'YYYYMMDDHHmmss'), 9),
                };
            }),
    };
}
