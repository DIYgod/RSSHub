import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const noticeType = {
    dwjlxm: { title: '上海大学信息公开网-信息公开栏目-国际合作与交流-对外交流项目', url: 'https://xxgk.shu.edu.cn/xxgklm/gjhzyjl1/dwjlxm.htm' }, // 对外交流项目
    hzjl: { title: '上海大学信息公开网-信息公开栏目-国际合作与交流-合作交流', url: 'https://xxgk.shu.edu.cn/xxgklm/gjhzyjl1/hzjl.htm' }, // 合作交流
};

export const route: Route = {
    path: '/xxgk/:type?',
    categories: ['university'],
    example: '/shu/xxgk/dwjlxm',
    parameters: { type: '分类，默认为对外交流项目' },
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
            source: ['xxgk.shu.edu.cn/'],
            target: '/xxgk',
        },
    ],
    name: '信息公开网',
    maintainers: ['GhhG123'],
    handler,
    url: 'xxgk.shu.edu.cn/',
    description: `| 对外交流项目 | 合作交流 |
| -------- | --------- |
| dwjlxm   | hzjl      |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') ?? 'dwjlxm';
    const rootUrl = 'https://xxgk.shu.edu.cn';

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

    const list = $('li[id^="line_u6_"]') // 定位到每个包含新闻的<li>元素
        .toArray()
        .map((el) => {
            const item = $(el); // 使用Cheerio包装每个<li>元素
            const a = item.find('a');
            const rawLink = a.attr('href'); // 获取链接
            const title = a.text().trim(); // 获取标题
            const pubDate = item.find('i').text().trim(); // 获取日期

            return {
                title, // 获取标题
                link: rawLink ? new URL(rawLink, rootUrl).href : rootUrl, // 生成完整链接
                pubDate: timezone(parseDate(pubDate, 'YYYY/MM/DD'), +8), // 解析日期
                description: '', // 初始化描述
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const url = new URL(item.link); // 创建 URL 对象以验证链接
                // 确保链接是以正确的域名开头，并且不为空
                if (url.hostname === 'gs1.shu.edu.cn') {
                    // 需校内访问
                    // Skip or handle differently for URLs with gs1.shu.edu.cn domain
                    item.description = 'gs1.shu.edu.cn, 无法直接获取';
                    return item;
                }

                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                }); // 获取详情页内容
                const content = load(detailResponse.data); // 使用cheerio解析内容

                item.description = content('.v_news_content').html() || item.description;

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
