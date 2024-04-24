import { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import * as cheerio from 'cheerio';
import type { Context } from 'hono';
import markdownit from 'markdown-it';

const md = markdownit({
    html: true,
    breaks: true,
});

export const route: Route = {
    path: '/:category?',
    example: '/lianxh',
    parameters: { category: '分类 id，可在对应分类页 URL 中找到，默认为 `all`，即全部' },
    radar: [
        {
            source: ['www.lianxh.cn/blogs/all.html', 'www.lianxh.cn/'],
        },
    ],
    name: '精彩资讯',
    maintainers: ['nczitzk'],
    handler,
    url: 'www.lianxh.cn/',
    description: `| 分类                 | id  |
 -------------------- | --- |
 全部                 | all |
 Stata 入门           | 16  |
 Stata 教程           | 17  |
 计量专题             | 18  |
 内生性 - 因果推断    | 19  |
 面板数据             | 20  |
 交乘项 - 调节 - 中介 | 21  |
 结果输出             | 22  |
 工具软件             | 23  |
 Stata 绘图           | 24  |
 数据处理             | 25  |
 Stata 程序           | 26  |
 Probit-Logit         | 27  |
 时间序列             | 28  |
 空间计量 - 网络分析  | 29  |
 Markdown-LaTeX       | 30  |
 论文写作             | 31  |
 回归分析             | 32  |
 其它                 | 33  |
 数据分享             | 34  |
 Stata 资源           | 35  |
 文本分析 - 爬虫      | 36  |
 Python-R-Matlab      | 37  |
 IV-GMM               | 38  |
 倍分法 DID           | 39  |
 断点回归 RDD         | 40  |
 PSM-Matching         | 41  |
 合成控制法           | 42  |
 Stata 命令           | 43  |
 专题课程             | 44  |
 风险管理             | 45  |
 生存分析             | 46  |
 机器学习             | 47  |
 分位数回归           | 48  |
 SFA-DEA - 效率分析   | 49  |
 答疑 - 板书          | 50  |
 论文重现             | 51  |
 最新课程             | 52  |
 公开课               | 53  |`,
};

async function handler(ctx: Context) {
    const { category = 'all' } = ctx.req.param();

    const rootUrl = 'https://www.lianxh.cn';
    const currentUrl = `${rootUrl}/blogs/${category}.html`;

    const response = await ofetch(currentUrl);

    const $ = cheerio.load(response);

    const list = $('.card-body > a')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')!, 10) : 30)
        .toArray()
        .map((item) => {
            const $item = $(item);
            const href = $item.attr('href');
            return {
                title: $item.find('h5').text().trim(),
                link: rootUrl + href,
                id: href?.split('/').pop()?.split('.')[0],
            };
        }) as DataItem[];

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const { data: response } = await ofetch(`${rootUrl}/web-api/article`, {
                    query: {
                        id: item.id,
                    },
                });

                item.description = md.render(response.details);
                item.pubDate = parseDate(response.release_time, 'YYYY-MM-DD');
                item.author = response.author;

                return item;
            })
        )
    );

    return {
        title: `连享会 - ${$('.card-title').text()}`,
        link: currentUrl,
        item: items as DataItem[],
    };
}
