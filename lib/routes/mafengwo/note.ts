import { load } from 'cheerio';
import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/note/:type',
    categories: ['travel'],
    example: '/mafengwo/note/hot',
    parameters: { type: '目前支持两种, `hot` 代表热门游记, `latest` 代表最新游记' },
    name: '游记',
    maintainers: ['sinchang'],
    handler,
};

const baseApiUrl = 'https://pagelet.mafengwo.cn/note/pagelet/recommendNoteApi';
const baseUrl = 'https://www.mafengwo.cn';
const enumType = {
    latest: 3,
    hot: 0,
};

async function handler(ctx: Context) {
    const { type } = ctx.req.param();
    if (enumType[type] === undefined) {
        throw new InvalidParameterError('Unknown type');
    }

    const params = {
        type: enumType[type],
        objid: 0,
        page: 1,
        ajax: 1,
        retina: 0,
    };
    const url = `${baseApiUrl}?params=${encodeURIComponent(JSON.stringify(params))}`;

    const response = await ofetch(url, {
        headers: {
            Referer: url,
        },
    });
    const $ = load(response.data.html);

    return {
        title: '马蜂窝游记',
        link: baseUrl,
        description: '马蜂窝!靠谱的旅游攻略,自由行,自助游分享社区,海量旅游景点图片、游记、交通、美食、购物等自由行旅游攻略信息,马蜂窝旅游网获取自由行,自助游攻略信息更全面',
        item: $('.tn-list .tn-item')
            .toArray()
            .map((item) => {
                const $item = $(item);
                const a = $item.find('dt a').not('.tn-from-app');
                return {
                    title: a.text(),
                    description: `<img src="${$item.find('.tn-image img').attr('src')?.split('?', 1)[0]}"> ${$item.find('dd a').text()}`,
                    link: new URL(a.attr('href')!, baseUrl).href,
                };
            }),
    };
}
