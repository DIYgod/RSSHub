import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { finishArticleItem } from '@/utils/wechat-mp';

const host = 'https://csyh.sdu.edu.cn/';
const typeMap = {
    zytz: 'zytz.htm',
    gsl: 'gsl.htm',
};
const titleMap = {
    zytz: '重要通知',
    gsl: '公示栏',
};

export const route: Route = {
    path: '/cs/yjsgz/:type?',
    categories: ['university'],
    example: '/sdu/cs/yjsgz/zytz',
    parameters: { type: '默认为`zytz`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '计算机科学与技术学院研究生工作网站',
    maintainers: ['kukeya', 'wiketool'],
    handler,
    description: `| 重要通知 | 公示栏 |
| -------- | -------- |
| zytz      | gsl       |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') ? ctx.req.param('type') : 'zytz';
    const link = new URL(typeMap[type], host).href;

    const response = await got(link);

    const $ = load(response.data);

    let item = $('.ss li')
        .map((_, e) => {
            e = $(e);
            const a = e.find('a');
            return {
                title: a.text().trim(),
                link: a.attr('href').startsWith('info/') ? host + a.attr('href') : a.attr('href'),
                pubDate: parseDate(e.find('span').text().trim(), 'YYYY-MM-DD'),
            };
        })
        .get();

    item = await Promise.all(
        item.map((item) =>
            cache.tryGet(item.link, async () => {
                if (new URL(item.link).hostname === 'mp.weixin.qq.com') {
                    return finishArticleItem(item);
                } else if (new URL(item.link).hostname !== 'csyh.sdu.edu.cn') {
                    return item;
                }
                const response = await got(item.link);
                const $ = load(response.data);

                item.title = $('.title h3').text().trim();
                // item.author = $('.title div em').eq(1).text().trim().replace('编辑：', '') || '山东大学计算机科学与技术学院';
                $('.title').remove();
                item.description = $('form[name=_newscontent_fromname]').html();

                return item;
            })
        )
    );

    return {
        // title: `山东大学计算机科学与技术学院研究生工作网站${typelist[type]}`,
        title: `山东大学计算机科学与技术学院研究生工作网站${titleMap[type]}`,
        description: $('title').text(),
        link,
        item,
        icon: 'https://assets.i-scmp.com/static/img/icons/scmp-icon-256x256.png',
        logo: 'https://assets.i-scmp.com/static/img/icons/scmp-icon-256x256.png',
    };
}
