import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { art } from '@/utils/render';
import path from 'node:path';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);
const baseUrl = 'https://www.openrice.com';

export const route: Route = {
    path: '/:lang/hongkong/explore/chart/:category',
    maintainers: ['after9'],
    handler,
    categories: ['shopping'],
    example: '/openrice/zh/hongkong/explore/chart/most-bookmarked',
    parameters: { lang: '语言，缺省为 zh', category: '类别，缺省为 most-bookmarked' },
    name: '香港餐廳排行榜',
    description: `
  | 简体 | 繁體 | EN |
  | ----- | ------ | ----- |
  | zh-cn | zh | en |

  | 最多收藏 | 每周最高评分 | 最高浏览 | 最佳甜品餐厅 |
  | ----- | ------ | ----- | ----- |
  | most-bookmarked | best-rating | most-popular | best-dessert |
  `,
};

async function handler(ctx) {
    const lang = ctx.req.param('lang') ?? 'zh';
    const category = ctx.req.param('category') ?? 'most-bookmarked';

    const urlPath: string = `/${lang}/hongkong/explore/chart/${category}`;
    const response = await ofetch(baseUrl + urlPath);
    const $ = load(response);

    const title = $('title').text() ?? 'Hong Kong Restaurant Chart';
    const description = $('title').text() ?? 'Hong Kong Restaurant Chart';

    const data = $('.poi-chart-main-grid-item-desktop-wrapper');
    const resultList = data.toArray().map((item) => {
        const $item = $(item);
        const rankClass = $item.find('.rank-icon').attr('class');
        const rankNumber = rankClass?.match(/rank-(\d+)/)?.[1] ?? '';
        const desTags = $item.find('.pcmgidtr-left-section-poi-info-details .pcmgidtrls-poi-info-details-text');
        const desTagsArray: string[] = desTags.toArray().map((tag) => $(tag).text());
        const title = $item.find('.pcmgidtr-left-section-poi-info-name .link').text() ?? '';
        const link = $item.find('.pcmgidtr-left-section-poi-info-name .link').attr('href') ?? '';
        const coverImg = $item.find('.pcmgidtr-left-section-door-photo img').attr('src') ?? null;
        const description = art(path.join(__dirname, 'templates/chart.art'), {
            description: desTagsArray ?? [],
            rankNumber,
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
