import { Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/news/:category?',
    name: '新闻网',
    url: 'news.hrbust.edu.cn',
    maintainers: ['cscnk52'],
    handler,
    example: '/hrbust/news',
    parameters: { category: '栏目标识，默认为 lgyw（理工要闻）' },
    description: `| 理工要闻 | 新闻导读 | 图文报道 | 综合新闻 | 教学科研 | 院处动态 | 学术科创 | 交流合作 | 学生天地 | 招生就业 | 党建思政 | 在线播放 | 理工人物 | 理工校报 | 媒体理工 | 讲座论坛 | 人才招聘 | 学科建设 |
|----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|
| lgyw     | xwdd     | twbd     | zhenew   | jxky     | ycdt     | xskc     | jlhz     | xstd     | zsjy     | djsz     | zxbf     | lgrw     | lgxb     | mtlg     | jzlt     | rczp     | xkjs     |`,
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
            source: ['news.hrbust.edu.cn/:category.htm'],
            target: '/news/:category',
        },
        {
            source: ['news.hrbust.edu.cn/'],
            target: '/news/',
        },
    ],
    view: ViewType.Notifications,
};

async function handler(ctx) {
    const rootUrl = 'https://news.hrbust.edu.cn/';
    const { category = 'lgyw' } = ctx.req.param();
    const columnUrl = `${rootUrl}${category}.htm`;
    const response = await ofetch(columnUrl);
    const $ = load(response);

    const bigTitle = $('title').text().split('-')[0].trim();

    const list = $('li[id^=line_u10]')
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
                if (!item.link.startsWith(rootUrl)) {
                    item.description = '本文需跳转，请点击原文链接后阅读';
                    return item;
                }

                const detailResponse = await ofetch(item.link);
                const content = load(detailResponse);

                const dateText = content('p.xinxi span:contains("日期时间：")').text().replace('日期时间：', '').trim();
                const pubTime = dateText ? timezone(parseDate(dateText), +8) : null;
                if (pubTime) {
                    item.pubDate = pubTime;
                }

                const author = content('p.xinxi span:contains("作者：")').text().replace('作者：', '').trim();
                item.author = author || null;

                const newsContent = content('div.v_news_content') || '解析正文失败';
                const listAttachments = content('ul[style="list-style-type:none;"] a');
                let listAttachmentsHtml = '';
                listAttachments.each((_, a_element) => {
                    listAttachmentsHtml += '<br />' + content(a_element).prop('outerHTML');
                });

                item.description = newsContent + listAttachmentsHtml;
                return item;
            })
        )
    );

    return {
        title: `${bigTitle} - 哈尔滨理工大学新闻网`,
        link: columnUrl,
        language: 'zh-CN',
        item: items,
    };
}
