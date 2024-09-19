import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { finishArticleItem } from '@/utils/wechat-mp';

const host = 'https://www.ipo.sdu.edu.cn/';

const typeMap = {
    tzgg: {
        title: '通知公告',
        url: 'tzgg.htm',
    },
};

export const route: Route = {
    path: '/gjsw/:type?',
    categories: ['university'],
    example: '/sdu/gjsw/tzgg',
    parameters: { type: '默认为`tzgg`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '山东大学国际事务部',
    maintainers: ['kukeya'],
    handler,
    description: `| 通知公告 |  
  | -------- | 
  | tzgg     |      `,
};

async function handler(ctx) {
    const type = ctx.req.param('type') ? ctx.req.param('type') : 'tzgg';
    const link = new URL(typeMap[type].url, host).href;

    const response = await got(link);

    const $ = load(response.data);

    let item = $('.dqlb ul li')
        .map((_, e) => {
            e = $(e);
            const a = e.find('a');
            return {
                title: a.text().trim(),
                link: a.attr('href').startsWith('wdhcontent') ? host + a.attr('href') : a.attr('href'),
                pubDate: parseDate(e.find('.fr').text().trim(), 'YYYY-MM-DD'),
            };
        })
        .get();

    item = await Promise.all(
        item.map((item) =>
            cache.tryGet(item.link, async () => {
                if (new URL(item.link).hostname === 'mp.weixin.qq.com') {
                    return finishArticleItem(item);
                } else if (new URL(item.link).hostname !== 'www.ipo.sdu.edu.cn') {
                    const response = await got(item.link);
                    const $ = load(response.data);
                    item.description = $('body').html();
                    return item;
                }
                const response = await got(item.link);
                const $ = load(response.data);

                item.title = $('.xqnr_tit h2').text().trim();
                $('.xqnr_tit').remove();
                item.description = $('form[name=_newscontent_fromname]').html();

                return item;
            })
        )
    );

    return {
        title: `山东大学国际事务部${typeMap[type].title}`,
        description: $('title').text(),
        link,
        item,
    };
}
