import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { finishArticleItem } from '@/utils/wechat-mp';

const host = 'https://www.cs.sdu.edu.cn/';
const urlMap = {
    announcement: 'xygg.htm',
    academic: 'xsbg.htm',
    technology: 'kjjx.htm',
    undergraduate: 'bkjy.htm',
    postgraduate: 'yjsjy.htm',
};
const titleMap = {
    announcement: '学院公告',
    academic: '学术报告',
    technology: '科技简讯',
    undergraduate: '本科教育',
    postgraduate: '研究生教育',
};

export const route: Route = {
    path: '/cs/index/:type?',
    categories: ['university'],
    example: '/sdu/cs/index/announcement',
    parameters: { type: '默认为 `announcement`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.cs.sdu.edu.cn/', 'www.cs.sdu.edu.cn/xygg.htm'],
            target: '/cs/index/announcement',
        },
        {
            source: ['www.cs.sdu.edu.cn/xsbg.htm'],
            target: '/cs/index/academic',
        },
        {
            source: ['www.cs.sdu.edu.cn/kjjx.htm'],
            target: '/cs/index/technology',
        },
        {
            source: ['www.cs.sdu.edu.cn/bkjy.htm'],
            target: '/cs/index/undergraduate',
        },
        {
            source: ['www.cs.sdu.edu.cn/yjsjy.htm'],
            target: '/cs/index/postgraduate',
        },
    ],
    name: '计算机科学与技术学院通知',
    maintainers: ['Ji4n1ng', 'wiketool'],
    handler,
    description: `| 学院公告 | 学术报告 | 科技简讯 | 本科教育 | 研究生教育 | 
| -------- | -------- | -------- | -------- | -------- |
| announcement | academic | technology | undergraduate | postgraduate |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') ?? 'announcement';
    const link = new URL(urlMap[type], host).href;

    const response = await got(link);

    const $ = load(response.data);

    let item = $('.dqlb ul li')
        .map((_, e) => {
            e = $(e);
            const a = e.find('a');
            return {
                title: a.text().trim(),
                link: a.attr('href').startsWith('info/') ? host + a.attr('href') : a.attr('href'),
                pubDate: parseDate(e.find('.fr').text().trim(), 'YYYY-MM-DD'),
            };
        })
        .get();

    item = await Promise.all(
        item.map((item) =>
            cache.tryGet(item.link, async () => {
                if (new URL(item.link).hostname === 'mp.weixin.qq.com') {
                    return finishArticleItem(item);
                } else if (new URL(item.link).hostname !== 'www.cs.sdu.edu.cn') {
                    return item;
                }
                const response = await got(item.link);
                const $ = load(response.data);

                item.title = $('.xqnr_tit h2').text().trim();
                item.author = $('.xqnr_tit span').eq(1).text().trim().replace('编辑：', '') || '山东大学计算机科学与技术学院';
                $('.xqnr_tit').remove();
                item.description = $('form[name=_newscontent_fromname]').html();

                return item;
            })
        )
    );

    return {
        title: `山东大学计算机科学与技术学院${titleMap[type]}`,
        description: $('title').text(),
        link,
        item,
    };
}
