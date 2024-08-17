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
    // 获取用户输入的 year
    const { year = currentYear() }: { year?: number } = ctx.req.param();

    // 替换 url
    const sydwgkzpUrl = `https://rlsbj.cq.gov.cn/zwxx_182/sydw/sydwgkzp${year}/`;

    const { data: response } = await got(sydwgkzpUrl);

    const $ = load(response);

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
                link: `${sydwgkzpUrl}${title.attr('href')}`,
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
        title: '重庆市事业单位公开招聘',
        link: sydwgkzpUrl,
        item: items,
    };
}

function currentYear(): number {
    return new Date().getFullYear();
}
