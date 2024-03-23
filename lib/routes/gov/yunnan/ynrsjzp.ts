import { Route, Data } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import type { Context } from 'hono';

export const route: Route = {
    path: '/yunnan/ynrsjzp/:page?',
    url: 'hrss.yn.gov.cn/',
    categories: ['government'],
    example: '/gov/yunnan/ynrsjzp',
    parameters: {
        page: '需要订阅的页数，默认为1',
    },
    radar: [
        {
            source: ['hrss.yn.gov.cn/'],
        },
    ],
    name: '云南省人力资源和社会保障政务门户-招考招聘',
    maintainers: ['MajexH'],
    handler,
};

async function handler(ctx: Context): Promise<Data> {
    // 获取用户输入的 page
    const { page = 1 }: { page?: number } = ctx.req.param();

    // 替换 url
    const ynrsjzpUrl = `https://hrss.yn.gov.cn/NewsLsit.aspx?ClassID=458&page=${page}`;

    const { data: response }: { data: any } = await got(ynrsjzpUrl);

    const $ = load(response);

    // 获取所有的标题
    const list = $('div[class="listBox mt5"] ul[class="ul13 pd20"] > li')
        .toArray()
        .map((item) => {
            item = $(item);
            const title = item.find('a').first();
            return {
                // 文章标题
                title: title.text(),
                // 文章链接
                link: `${ynrsjzpUrl}${title.attr('href')}`,
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
                item.description = $('span[id="Body_ltl_newsContent"]').first().html();
                return item;
            })
        )
    );

    return {
        title: '云南省人社局招聘',
        link: ynrsjzpUrl,
        item: items,
    };
}
