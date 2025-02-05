import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { art } from '@/utils/render';
import path from 'node:path';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);
const baseUrl = 'https://www.openrice.com';

export const route: Route = {
    path: '/:lang/hongkong/promos',
    maintainers: ['after9'],
    handler,
    categories: ['shopping'],
    example: '/openrice/zh/hongkong/promos',
    parameters: { lang: '语言，缺省为 zh' },
    name: '香港餐厅滋讯',
    description: `
| 简体 | 繁體 | EN |
| ----- | ------ | ----- |
| zh-cn | zh | en |
  `,
};

async function handler(ctx) {
    const lang = ctx.req.param('lang') ?? 'zh';

    let urlPath;
    switch (lang) {
        case 'zh-cn':
            urlPath = '/zh-cn/hongkong/promos';
            break;
        case 'en':
            urlPath = '/en/hongkong/promos';
            break;
        case 'zh':
        default:
            urlPath = '/zh/hongkong/promos';
            break;
    }
    const response = await ofetch(baseUrl + urlPath, {});
    const $ = load(response);

    const title = $('title').text() ?? "Openrice - What's Hot";
    const description = $('meta[name="description"]').attr('content') ?? "What's Hot from Openrice";

    const data = $('.article-listing-content-cell-wrapper');
    const resultList = data.toArray().map((item) => {
        const $item = $(item);
        const title = $item.find('.title-name').text() ?? '';
        const link = $item.find('a.sr1-listing-content-cell').attr('href') ?? '';
        const coverImg =
            $item
                .find('.cover-photo')
                .attr('style')
                ?.match(/url\(['"]?(.*?)['"]?\)/)?.[1] ?? null;
        const description = art(path.join(__dirname, 'templates/description.art'), {
            description: $item.find('.article-details .desc').text() ?? '',
            image: coverImg,
        });
        return {
            title,
            description,
            link,
        };
    });

    return {
        title,
        link: baseUrl + urlPath,
        description,
        item: resultList,
    };
}
