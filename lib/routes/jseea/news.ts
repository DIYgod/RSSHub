import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

// 参考 bit/jwc 北京理工大学的的页面写成

const baseUrl = 'https://www.jseea.cn';
const siteTitle = ' - 江苏省教育考试院';

// 专门定义一个function用于加载文章内容
async function loadContent(link) {
    // 异步请求文章
    const { data: response } = await got(link);
    // 加载文章内容
    const $ = load(response);
    // 提取文章内容
    $('strong').remove();
    const description = $('#content').html();
    // 返回解析的结果
    return description;
}

export const route: Route = {
    path: '/news/:type?',
    radar: [
        {
            source: ['jseea.cn/webfile/news/:type'],
            target: '/news/:type',
        },
    ],
    name: 'Unknown',
    maintainers: ['schen1024'],
    handler,
};

async function handler(ctx) {
    // 默认 正常规定 然后获取列表页面
    const type = ctx.req.param('type') ?? 'zkyw';
    const listPageUrl = `${baseUrl}/webfile/news/${type}/`;
    const { data: response } = await got(listPageUrl);
    const $ = load(response);

    // console.log(type+":"+listPageUrl);
    // 获取当前页面的 list
    const list = $('div.content-list-div ul li a')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item
                    .contents()
                    .filter((_, e) => e.nodeType === 3)
                    .text()
                    .trim(),
                link: `https:${item.attr('href')}`,
                pubDate: timezone(parseDate(item.find('span').text(), 'YYYY-MM-DD'), 8),
            };
        });

    const result = await Promise.all(
        // 遍历每一篇文章
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                item.description = await loadContent(item.link);
                // 合并解析后的结果集作为该篇文章最终的输出结果
                return item;
            })
        )
    );

    return {
        title: $('head title').text() + siteTitle,
        link: listPageUrl,
        item: result,
    };
}
