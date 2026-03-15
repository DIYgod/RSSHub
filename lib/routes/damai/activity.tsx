import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/activity/:city/:category/:subcategory/:keyword?',
    categories: ['shopping'],
    example: '/damai/activity/上海/音乐会/全部/柴可夫斯基',
    parameters: { city: '城市，如果不需要限制，请填入`全部`', category: '分类，如果不需要限制，请填入`全部`', subcategory: '子分类，如果不需要限制，请填入`全部`', keyword: '搜索关键字，置空为不限制' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '票务更新',
    maintainers: ['hoilc', 'Konano'],
    handler,
    description: `城市、分类名、子分类名，请参见[大麦网搜索页面](https://search.damai.cn/search.htm)`,
};

async function handler(ctx) {
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

    return {
        title: `大麦网票务 - ${city || '全国'} - ${category || '全部分类'}${subcategory ? ' - ' + subcategory : ''}${keyword ? ' - ' + keyword : ''}`,
        link: 'https://search.damai.cn/search.htm',
        allowEmpty: true,
        item: list.map((item) => ({
            title: item.nameNoHtml,
            author: item.actors ? load(item.actors, null, false).text() : '大麦网',
            description: renderToString(
                <>
                    <img src={item.verticalPic} />
                    <p>{item.description ? raw(item.description) : null}</p>
                    <p>
                        地点：{item.venuecity} | {item.venue}
                    </p>
                    <p>时间：{item.showtime}</p>
                    <p>票价：{item.price_str}</p>
                </>
            ),
            link: `https://detail.damai.cn/item.htm?id=${item.projectid}`,
        })),
    };
}
