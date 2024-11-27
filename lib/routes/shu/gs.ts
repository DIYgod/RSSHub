import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio'; // cheerio@1.0.0
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const notice_type = {
    zhxw: { title: '上海大学研究生院-综合新闻', url: 'https://gs.shu.edu.cn/xwlb/zh.htm' }, // 综合新闻
    pygl: { title: '上海大学研究生院-培养管理', url: 'https://gs.shu.edu.cn/xwlb/py.htm' }, // local //BUG error: Request https://gs1.shu.edu.cn:8080/py/KCBInfo.asp fail: TypeError: fetch failed
    gjjl: { title: '上海大学研究生院-国际交流', url: 'https://gs.shu.edu.cn/xwlb/gjjl.htm' },
};

export const route: Route = {
    path: '/gs/:type?',
    categories: ['university'],
    example: '/shu/gs/zhxw',
    parameters: { type: '分类，默认为学术公告' },
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
  | -------- | --------- | --------- |
  | zhxw     | pygl      | gjjl      |`,
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
        url: notice_type[type].url,
    });

    const $ = load(response.data);

    const list = $('div.only-list1 ul li') // 定位到HTML结构中的li元素
        .map((_, el) => {
            const item = $(el); // 使用Cheerio包装每个li元素
            const rawLink = item.find('a').attr('href');
            const pubDate = item.find('span').text().trim(); // 提取日期

            return {
                title: item.find('a').text().trim(), // 获取标题
                link: rawLink ? new URL(rawLink, rootUrl).href : rootUrl, // 生成完整链接
                pubDate: timezone(parseDate(pubDate, 'YYYY年MM月DD日'), +8), // 解析并转换日期
                description: '', // 没有提供简要描述，设为空字符串
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link); // 获取详情页内容
                const content = load(detailResponse.data); // 使用cheerio解析内容

                item.description = content('div.ej_main').html() || item.description; // 提取内容区详情

                return item; // 返回完整的item
            })
        )
    );

    return {
        title: notice_type[type].title,
        description: notice_type[type].title,
        link: notice_type[type].url,
        item: items,
    };
}
