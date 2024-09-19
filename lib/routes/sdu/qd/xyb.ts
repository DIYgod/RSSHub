import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { finishArticleItem } from '@/utils/wechat-mp';

const host = 'https://xyb.qd.sdu.edu.cn/';

const typeMap = {
    gztz: {
        title: '工作通知',
        url: 'gztz.htm',
    },
};

export const route: Route = {
    path: '/qd/xyb/:type?',
    categories: ['university'],
    example: '/sdu/qd/xyb/gztz',
    parameters: { type: '默认为`gztz`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '山东大学（青岛）学研办',
    maintainers: ['kukeya'],
    handler,
    description: `| 工作通知 | 
  | -------- |
  | gztz     | `,
};

async function handler(ctx) {
    const type = ctx.req.param('type') ? ctx.req.param('type') : 'gztz';
    const link = new URL(typeMap[type].url, host).href;

    const response = await got(link);

    const $ = load(response.data);

    let item = $('.list li')
        .map((_, e) => {
            e = $(e);
            const a = e.find('a');
            return {
                title: a.text().trim(),
                link: a.attr('href').startsWith('info/') ? host + a.attr('href') : a.attr('href'),
                pubDate: parseDate(e.find('b').text().trim(), 'YYYY-MM-DD'),
            };
        })
        .get();

    item = await Promise.all(
        item.map((item) =>
            cache.tryGet(item.link, async () => {
                if (new URL(item.link).hostname === 'mp.weixin.qq.com') {
                    return finishArticleItem(item);
                } else if (new URL(item.link).hostname !== 'xyb.qd.sdu.edu.cn') {
                    const response = await got(item.link);
                    const $ = load(response.data);
                    item.description = $('body').html();
                    return item;
                }
                const response = await got(item.link);
                const $ = load(response.data);

                item.title = $('div h1').text().trim();
                $('div h1').remove();
                item.description = $('form[name=_newscontent_fromname]').html();

                return item;
            })
        )
    );

    return {
        title: `山东大学（青岛）学研办${typeMap[type].title}`,
        description: $('title').text(),
        link,
        item,
    };
}
