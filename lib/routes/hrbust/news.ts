import { Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootUrl = 'https://news.hrbust.edu.cn';

export const route: Route = {
    path: '/news/:category?',
    name: '新闻网',
    url: 'news.hrbust.edu.cn',
    maintainers: ['cscnk52'],
    handler,
    example: '/hrbust/news',
    parameters: { category: '栏目标识，默认为理工要闻' },
    description: `
| lgyw | xwdd | zhenew | jxky | ycdt | xskc | jlhz | zsjy | djsz | zxbf | lgxb | mtlg | jzlt |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 理工要闻 | 新闻导读 | 综合新闻 | 教学科研 | 院处动态 | 学术科创 | 交流合作 | 招生就业 | 党建思政 | 在线播放 | 理工校报 | 媒体理工 | 讲座论坛 |
`,
    categories: ['university'],
    features: {
        supportRadar: true,
    },
    radar: [
        {
            source: ['news.hrbust.edu.cn/:category.htm'],
        },
    ],
    view: ViewType.Notifications,
};

async function handler(ctx) {
    const { category = 'lgyw' } = ctx.req.param();

    const response = await got(`${rootUrl}/${category}.htm`);

    const $ = load(response.data);

    const bigTitle = $('title').text().split('-')[0].trim();

    const list = $('div.main-liebiao-con-left-bottom li[id^=line_u10]')
        .toArray()
        .map((item) => {
            const element = $(item);
            const link = new URL(element.find('a').attr('href'), rootUrl).href;
            const pubDateText = element.find('span').text().trim();
            const pubDate = pubDateText ? timezone(parseDate(pubDateText), +8) : null;
            return {
                title: element.find('a').text().trim(),
                pubDate,
                link,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = load(detailResponse.data);

                const dateText = content('p.xinxi span:contains("日期时间：")').text().replace('日期时间：', '').trim();
                const pubTime = dateText ? timezone(parseDate(dateText), +8) : null;
                if (pubTime) {
                    item.pubDate = pubTime;
                }

                item.description = content('div.v_news_content').html() || '本文需跳转，请点击标题后阅读';
                return item;
            })
        )
    );

    return {
        title: `哈尔滨理工大学新闻网 - ${bigTitle}`,
        link: `${rootUrl}/${category}.htm`,
        item: items,
    };
}
