import { Route, Data } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import type { Context } from 'hono';

export const route: Route = {
    path: '/chongqing/sydwgkzp/:year?',
    url: 'rlsbj.cq.gov.cn/',
    categories: ['government'],
    example: '/gov/chongqing/sydwgkzp',
    parameters: {
        year: '需要订阅的年份，格式为`YYYY`，必须小于等于当前年份，默认为当前年份',
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
            source: ['rlsbj.cq.gov.cn/'],
        },
    ],
    name: '人力社保局',
    maintainers: ['MajexH'],
    handler,
    description: `#### 人事考试通知 {#chong-qing-shi-ren-min-zheng-fu-ren-li-she-bao-ju-ren-shi-kao-shi-tong-zhi}


#### 事业单位公开招聘 {#chong-qing-shi-ren-min-zheng-fu-ren-li-she-bao-ju-shi-ye-dan-wei-gong-kai-zhao-pin}`,
};

async function handler(ctx: Context): Promise<Data> {
    // 获取用户输入的 year
    const { year = currentYear() }: { year?: number } = ctx.req.param();

    // 替换 url
    const sydwgkzpUrl = `https://rlsbj.cq.gov.cn/zwxx_182/sydw/sydwgkzp${year}/`;

    const { data: response }: { data: any } = await got(sydwgkzpUrl);

    const $ = load(response);

    // 获取所有的标题
    const list = $('div[class="p-rt rt"] .tab-item > li')
        .toArray()
        .map((item) => {
            item = $(item);
            const title = item.find('a').first();
            return {
                // 文章标题
                title: title.text(),
                // 文章链接
                link: `${sydwgkzpUrl}${title.attr('href')}`,
                // 文章发布日期
                pubDate: parseDate(item.find('span').text()),
            };
        });

    // 获取每个通知的具体信息
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response }: { data: any } = await got(item.link);
                const $ = load(response);
                // 主题正文
                item.description = $('div[class="trs_editor_view TRS_UEDITOR trs_paper_default trs_web"]').first().html();
                return item;
            })
        )
    );

    return {
        title: '重庆市事业单位公开招聘',
        link: sydwgkzpUrl,
        item: items,
    };
}

function currentYear(): number {
    return new Date().getFullYear();
}
