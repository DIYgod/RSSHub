import { load } from 'cheerio';
import { escapeAttribute } from 'entities';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

const baseUrl = 'https://www.mplus.org.hk';

export const route: Route = {
    path: '/collection',
    example: '/mplus/collection',
    name: '藏品',
    categories: ['travel'],
    maintainers: ['DIYgod'],
    description: '訂閱公開藏品目錄首頁，保留穩定藏品連結；作品創作年份不作為發布日期。',
    radar: [{ source: ['www.mplus.org.hk/tc/collection/'], target: '/collection' }],
    handler,
};

function getItem(object) {
    const link = `${baseUrl}/tc/collection/objects/${object.slugTitle}/`;
    return cache.tryGet(link, async () => {
        const response = await ofetch(link);
        const $ = load(response);
        const content = $('.ModalsCollectionObjectDetails');
        const category = $('.ModalsCollectionObjectDetails-tag')
            .toArray()
            .map((tag) => $(tag).text());
        content.find('script, style, button, svg, .ModalsCollectionObjectDetails-tags').remove();
        const image = $('meta[property="og:image"]').attr('content');
        return {
            title: object.title.zh_hant?.txt || object.title.en.txt,
            link,
            author: $('.ModalsCollectionObjectInfo-makerPrimary').text() || undefined,
            category,
            description: `${image ? `<img src="${escapeAttribute(image)}">` : ''}${content.html() || ''}`,
        };
    });
}

async function handler(ctx) {
    const response = await ofetch(`${baseUrl}/api/graphql/`, {
        method: 'POST',
        body: { query: '{ objects(publicAccess: true, prioritise: HIGHLIGHTS, page: 0, per_page: 20) { title { en { txt } zh_hant { txt } } slugTitle } }' },
    });
    const limit = Number(ctx.req.query('limit')) || 20;
    return { title: 'M+藏品', link: `${baseUrl}/tc/collection/`, language: 'zh-TW' as const, item: await pMap(response.data.objects.slice(0, limit), getItem, { concurrency: 3 }) };
}
