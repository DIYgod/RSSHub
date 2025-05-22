import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/ee/jzxx/:category?',
    categories: ['university'],
    example: '/xjtu/ee/jzxx/bks',
    parameters: {
        category: '类别：`bks`，默认为首页，详情在描述中',
    },
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
            source: ['ee.xjtu.edu.cn/jzxx/:category?.htm'],
        },
    ],
    name: '电气学院通知',
    maintainers: ['riverflows2333'],
    handler,
    description: `栏目类型

| 主页 | 本科生 | 研究生 | 科研学术 | 采购招标 | 招聘就业 | 行政办公
| --- | ----- | ----- | ------ | ------- | ------ | ------
|  -  |  bks  |  yjs  |  kyxs  |   cgzb  |  zpjy  | xzbg  `,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? ''; // 默认是首页
    const baseUrl = 'https://ee.xjtu.edu.cn';

    const rootUrl = ['bks', 'yjs', 'kyxs', 'cgzb', 'zpjy', 'xzbg'].includes(category) ? `${baseUrl}/jzxx/${category}.htm` : `${baseUrl}/jzxx.htm`;

    const response = await got(rootUrl);
    const $ = load(response.data);

    const list = $('.list .wow.fadeInUp')
        .toArray()
        .map((element) => {
            const item = $(element);
            const a = item.find('a');
            const title = a.text();
            const href = a.attr('href');
            if (!href) {
                return null; // 过滤无效链接
            }

            return {
                title,
                link: new URL(href, baseUrl).href,
            };
        })
        .filter((item): item is { title: string; link: string } => item !== null);

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const res = await got(item.link);
                const content = load(res.data);

                const infoDiv = content('div.art-tit.cont-tit');
                const dateText = infoDiv.find('p span:nth-child(1)').text().replace('发布时间：', '');
                const pubDate = timezone(parseDate(dateText), +8);

                const description = content('div.v_news_content').html();
                return {
                    title: content('h3').text(),
                    pubDate,
                    link: item.link,
                    guid: item.link,
                    description,
                };
            })
        )
    );
    const categoryMap = {
        bks: '本科生',
        yjs: '研究生',
        kyxs: '科研学术',
        cgzb: '采购招标',
        zpjy: '招聘就业',
        xzbg: '行政办公',
    };

    return {
        title: `西安交通大学电气学院通知 - ${categoryMap[category] || '通知首页'}`, // 使用对象查找配合默认值
        link: rootUrl,
        item: items,
    };
}
