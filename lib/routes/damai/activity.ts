// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { load } from 'cheerio';
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async (ctx) => {
    const city = ctx.req.param('city') === '全部' ? '' : ctx.req.param('city');
    const category = ctx.req.param('category') === '全部' ? '' : ctx.req.param('category');
    const subcategory = ctx.req.param('subcategory') === '全部' ? '' : ctx.req.param('subcategory');
    const keyword = ctx.req.param('keyword') ?? '';

    const url = 'https://search.damai.cn/searchajax.html';

    const response = await got(url, {
        searchParams: {
            keyword,
            cty: city,
            ctl: category,
            sctl: subcategory,
            tsg: 0,
            st: '',
            et: '',
            order: 3,
            pageSize: 30,
            currPage: 1,
            tn: '',
        },
    });
    const data = response.data;
    const list = data.pageData.resultData || [];

    ctx.set('data', {
        title: `大麦网票务 - ${city || '全国'} - ${category || '全部分类'}${subcategory ? ' - ' + subcategory : ''}${keyword ? ' - ' + keyword : ''}`,
        link: 'https://search.damai.cn/search.htm',
        item: list.map((item) => ({
            title: item.nameNoHtml,
            author: item.actors ? load(item.actors, null, false).text() : '大麦网',
            description: art(path.join(__dirname, 'templates/activity.art'), {
                item,
            }),
            link: `https://detail.damai.cn/item.htm?id=${item.projectid}`,
        })),
    });
};
