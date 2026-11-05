import { load } from 'cheerio';
import { escape } from 'entities';

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

const baseUrl = 'https://anond.hatelabo.jp';

async function handler(): Promise<Data> {
    const archiveIndex = await ofetch(`${baseUrl}/archive`);
    const latestUrl = new URL(load(archiveIndex)('.archives a').attr('href')!, baseUrl).href;
    const response = await ofetch(latestUrl);

    const $ = load(response);

    return {
        title: 'はてな匿名ダイアリー - 人気記事アーカイブ',
        link: `${baseUrl}/archive`,
        language: 'ja',
        item: $('.archives li')
            .toArray()
            .map((item) => {
                const $item = $(item);
                const a = $item.find('a').first();
                const href = a.attr('href')!;

                return {
                    title: a.text(),
                    description: escape($item.find('blockquote p').text()),
                    link: new URL(href, baseUrl).href,
                    pubDate: timezone(parseDate(href.replace('/', ''), 'YYYYMMDDHHmmss'), 9),
                };
            }),
    };
}
