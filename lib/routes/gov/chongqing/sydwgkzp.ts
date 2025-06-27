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
    radar: [
        {
            source: ['rlsbj.cq.gov.cn/'],
        },
    ],
    name: '重庆市人民政府 人力社保局 - 事业单位公开招聘',
    maintainers: ['MajexH'],
    handler,
};

async function handler(ctx: Context): Promise<Data> {
    const current = currentYear();

    // 获取用户输入的 year
    const { year: tempYear } = ctx.req.param();
    const year = /^\d{4}$/.test(tempYear) ? +tempYear : current;

    // 替换 url, 如果是今年的话因为 url 格式不一样，所以我们先默认跳去首页获取 meta 信息里的跳转地址
    const yearPart = year === current ? '' : `sydwgkzp${year}/`;
    let sydwgkzpUrl = `https://rlsbj.cq.gov.cn/zwxx_182/sydw/${yearPart}`;

    const { data: response } = await got(sydwgkzpUrl);

    let $ = load(response);

    // 检查是否存在 <meta http-equiv="Refresh"> 跳转
    const metaRefresh = $('meta[http-equiv="Refresh"]').attr('content');

    // 如果存在的话就使用 meta 提供的链接, 然后重新获取一次页面的内容
    if (metaRefresh) {
        const redirectPath = metaRefresh.split('URL=')[1];
        sydwgkzpUrl = new URL(redirectPath, sydwgkzpUrl).href;

        const { data: newResponse } = await got(sydwgkzpUrl);
        $ = load(newResponse);
    }

    // 获取所有的标题
    const list = $('ul[class="rsj-list1"] > li')
        .toArray()
        .map((item) => {
            item = $(item);
            const title = item.find('a').first();
            return {
                // 文章标题
                title: title.text(),
                // 文章链接
                link: new URL(title.attr('href'), sydwgkzpUrl).href,
                // 文章发布日期
                pubDate: parseDate(item.find('span').text()),
            };
        });

    // 获取每个通知的具体信息
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);
                // 主题正文
                item.description = $('.trs_editor_view').first().html();
                return item;
            })
        )
    );

    return {
        title: `重庆市事业单位${year}年公开招聘`,
        link: sydwgkzpUrl,
        item: items,
    };
}

function currentYear(): number {
    return new Date().getFullYear();
}
