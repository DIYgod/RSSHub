import { load } from 'cheerio';
import pMap from 'p-map'; // cheerio@1.0.0

import type { Route } from '@/types';
import cache from '@/utils/cache';
import { evaluateScriptData } from '@/utils/evaluate-script';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const noticeType = {
    zhxw: { title: '上海大学研究生院-综合新闻', url: 'https://gs.shu.edu.cn/xwlb/zh.htm' }, // 综合新闻
    pygl: { title: '上海大学研究生院-培养管理', url: 'https://gs.shu.edu.cn/xwlb/py.htm' }, // local //BUG error: Request https://gs1.shu.edu.cn:8080/py/KCBInfo.asp fail: TypeError: fetch failed
    gjjl: { title: '上海大学研究生院-国际交流', url: 'https://gs.shu.edu.cn/xwlb/gjjl.htm' },
};

export const route: Route = {
    path: '/gs/:type?',
    categories: ['university'],
    example: '/shu/gs/zhxw',
    parameters: { type: '分类，默认为综合新闻' },
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
            source: ['gs.shu.edu.cn/'],
            target: '/gs',
        },
    ],
    name: '研究生院',
    maintainers: ['GhhG123'],
    handler,
    url: 'gs.shu.edu.cn/',
    description: `| 综合新闻 | 培养管理 | 国际交流 |
| -------- | -------- | -------- |
| zhxw     | pygl     | gjjl     |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') ?? 'zhxw';
    const rootUrl = 'https://gs.shu.edu.cn';

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

    const list = $('tr[id^="line_u17_"]') // 定位到每个包含新闻的<tr>元素
        .toArray()
        .map((el) => {
            const item = $(el); // 使用Cheerio包装每个<tr>元素
            const rawLink = item.find('a').attr('href'); // 获取链接
            const title = item.find('a').text();
            const dateParts = item.find('td').eq(1).text().trim(); // 获取日期

            return {
                title, // 获取标题
                link: rawLink ? new URL(rawLink, rootUrl).href : rootUrl, // 生成完整链接
                pubDate: timezone(parseDate(dateParts, 'YYYY/MM/DD HH:mm:ss'), 8), // 解析日期
                description: item.find('td').eq(2).text().trim(), // 提取访问次数或其他信息
            };
        });

    const items = await pMap(
        list,
        async (item) => {
            const details = await cache.tryGet(`shu:gs:v2:${item.link}`, async () => {
                const url = new URL(item.link); // 创建 URL 对象以验证链接
                // 确保链接是以正确的域名开头，并且不为空
                if (url.hostname === 'gs1.shu.edu.cn') {
                    // 需校内访问
                    // Skip or handle differently for URLs with gs1.shu.edu.cn domain
                    item.description = 'gs1.shu.edu.cn, 无法直接获取';
                    return { description: item.description };
                }

                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                }); // 获取详情页内容
                const content = load(detailResponse.data); // 使用cheerio解析内容

                if (url.hostname === 'www.kankanews.com') {
                    const script = content('script')
                        .toArray()
                        .map((element) => content(element).html() || '')
                        .find((text) => text.startsWith('window.__NUXT__='));
                    if (script) {
                        const data = await evaluateScriptData<{ data?: Array<{ newsDetail?: { video_info?: { play_url?: string; cover?: string } } }> }>(script, '__NUXT__');
                        const video = data.data?.[0]?.newsDetail?.video_info;
                        if (video?.play_url) {
                            item.description = content('<video controls></video>')
                                .attr('src', video.play_url)
                                .attr('poster', video.cover || '')
                                .toString();
                        }
                    }
                } else {
                    item.description = content('#vsb_content .v_news_content').html() || item.description;
                }

                return { description: item.description }; // 返回完整的item
            });
            return { ...item, ...details };
        },
        { concurrency: 3 }
    );

    return {
        title: noticeType[type].title,
        description: noticeType[type].title,
        link: noticeType[type].url,
        image: 'https://www.shu.edu.cn/__local/0/08/C6/1EABE492B0CF228A5564D6E6ABE_779D1EE3_5BF7.png',
        item: items,
    };
}
