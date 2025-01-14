import { Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import timezone from '@/utils/timezone';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/jwzx/:type?/:page?',
    name: '教务处',
    url: 'jwzx.hrbust.edu.cn',
    maintainers: ['LenaNouzen', 'cscnk52'],
    handler,
    example: '/hrbust/jwzx',
    parameters: { type: '分类编号，默认为 354（教务公告），具体见下表', page: '文章数，默认为 12' },
    description: `::: tip
由于源站未提供精确时间，只能抓取日期粒度的时间。
:::
| 339  | 340  | 342  | 346  | 351  | 353  | 354  | 355  | 442  | 443  | 444  | 445  | 2106   | 2332 | 2333 | 2334 | 2335 | 2336 | 2730     | 2855 | 2857 | 2859 | 3271 | 3508    | 3519        | 3981 | 4057 | 4058 | 4059 | 4060 | 4061 | 4062 |
|------|------|------|------|------|------|------|------|------|------|------|------|--------|------|------|------|------|------|----------|------|------|------|------|---------|-------------|------|------|------|------|------|------|------|
| 组织机构 | 工作职责 | 专业设置 | 教务信箱 | 名师风采 | 热点新闻 | 教务公告 | 教学新闻 | 教学管理 | 教务管理 | 学籍管理 | 实践教学 | 系统使用动画 | 教学管理 | 教务管理 | 学籍管理 | 实验教学 | 实践教学 | 教研论文教材认定 | 教学管理 | 学籍管理 | 实践教学 | 网络教学 | 多媒体教室管理 |  实验教学与实验室管理 | 教学成果 | 国创计划 | 学科竞赛 | 微专业  | 众创空间 | 示范基地 | 学生社团 |`,
    categories: ['university'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        supportRadar: true,
    },
    radar: [
        {
            source: ['jwzx.hrbust.edu.cn/homepage/index.do'],
            target: '/jwzx',
        },
    ],
    view: ViewType.Notifications,
};

async function handler(ctx) {
    const JWZXBASE = 'http://jwzx.hrbust.edu.cn/homepage/';
    const { type = 354, page = 12 } = ctx.req.param();
    const url = JWZXBASE + 'infoArticleList.do?columnId=' + type + '&pagingNumberPer=' + page;

    const response = await ofetch(url);
    const $ = load(response);

    const bigTitle = $('.columnTitle .wow span').text().trim();

    const list = $('div.articleList li')
        .toArray()
        .map((item) => {
            const element = $(item);
            const link = new URL(element.find('a').attr('href'), JWZXBASE).href;
            const title = element.find('a').text().trim();
            const pubDateText = element.find('span').text().trim();
            const pubDate = timezone(parseDate(pubDateText), +8);
            return {
                title,
                link,
                pubDate,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                if (!item.link.startsWith(JWZXBASE)) {
                    item.description = '本文需跳转，请点击标题后阅读';
                    return item;
                }

                const response = await ofetch(item.link);
                const $ = load(response);
                const body = $('div.body');
                body.find('[style]').removeAttr('style');
                body.find('font').contents().unwrap();
                body.html(body.html()?.replaceAll('&nbsp;', ''));
                body.find('[align]').removeAttr('align');
                item.description = body.html();
                if (item.description === null) {
                    item.description = '解析正文失败';
                }
                return item;
            })
        )
    );

    return {
        title: `哈尔滨理工大学教务处 - ${bigTitle}`,
        link: JWZXBASE,
        item: items,
    };
}
