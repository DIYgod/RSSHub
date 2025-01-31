import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio'; // cheerio@1.0.0
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const noticeType = {
    tzgg: { title: '上海大学国际部港澳台-通知公告', url: 'https://global.shu.edu.cn/cd/tzgg/3.htm' },
};

export const route: Route = {
    path: '/global/:type?',
    categories: ['university'],
    example: '/shu/global/tzgg',
    parameters: { type: '分类，默认为通知公告' },
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
            source: ['global.shu.edu.cn/'],
            target: '/global',
        },
    ],
    name: '国际部港澳台办公室',
    maintainers: ['GhhG123'],
    handler,
    url: 'global.shu.edu.cn/',
    description: `| 通知公告 |
| -------- |
| tzgg     |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') ?? 'tzgg';
    const rootUrl = 'https://global.shu.edu.cn';

    // 发起 HTTP GET 请求
    const response = await got({
        method: 'get',

        /* headers: {
            'user-agent': UA,
            cookie: await getCookie(ctx),
        }, */
        url: noticeType[type].url,
    });

    const $ = load(response.data);

    const list = $('div.only-list1 ul li') // 定位到HTML结构中的li元素
        .toArray()
        .map((el) => {
            const item = $(el); // 使用Cheerio包装每个li元素
            const rawLink = item.find('a').attr('href');
            const pubDate = item.find('span').text().trim(); // 提取日期

            return {
                title: item.find('a').text().trim(), // 获取标题
                link: rawLink ? new URL(rawLink, rootUrl).href : rootUrl, // 生成完整链接
                pubDate: timezone(parseDate(pubDate, 'YYYY年MM月DD日'), +8), // 解析并转换日期
                description: '', // 没有提供简要描述，设为空字符串
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                }); // 获取详情页内容
                const content = load(detailResponse.data); // 使用cheerio解析内容

                item.description = content('#vsb_content_2 .v_news_content').html() || '内容无法提取'; // 提取内容区详情

                return item; // 返回完整的item
            })
        )
    );

    return {
        title: noticeType[type].title,
        description: noticeType[type].title,
        link: noticeType[type].url,
        image: 'https://www.shu.edu.cn/__local/0/08/C6/1EABE492B0CF228A5564D6E6ABE_779D1EE3_5BF7.png',
        item: items,
    };
}
