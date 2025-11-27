// 导入必要的模组
import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const handler = async (ctx) => {
    // 从 URL 参数中获取通知分类
    const { type = 'tzgg' } = ctx.req.param();
    const baseUrl = 'https://jwc.upc.edu.cn';
    const { data: response } = await got(`${baseUrl}/${type}/list.htm`);
    const $ = load(response);
    const list = $('ul.news_list')
        .find('li')
        // 使用“toArray()”方法将选择的所有 DOM 元素以数组的形式返回。
        .toArray()
        // 使用“map()”方法遍历数组，并从每个元素中解析需要的数据。
        .map((item) => {
            item = $(item);
            const a = item.find('a').first();
            let linkStr = a.attr('href');
            // 改为https访问并补全站内链接
            linkStr = linkStr.replace('http://', 'https://');
            if (!a.attr('href').startsWith('https://')) {
                linkStr = `${baseUrl}${a.attr('href')}`;
            }
            return {
                title: a.text(),
                link: linkStr,
                pubDate: timezone(parseDate(item.find('.news_meta').text()), +8), // 添加发布日期查询
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const { data: response } = await got(item.link);
                    const $ = load(response);

                    if (item.link.includes('news.upc.edu.cn')) {
                        item.description = $('.v_news_content').html();
                        item.author = $('.nr-zz h2').html();
                    } else if (item.link.includes('app.upc.edu.cn')) {
                        const scriptContent = $('body script').first().html();
                        let dataObj = null;
                        if (scriptContent) {
                            const match = scriptContent.match(/data\s*:\s*function\s*\(\)\s*{\s*return\s*{[^}]*data\s*:\s*({[\s\S]*?})/);
                            if (match && match[1]) {
                                const dataStr = match[1];
                                dataObj = JSON.parse(dataStr);
                            }
                        }
                        item.description = dataObj.content;
                        item.author = dataObj.author;
                    } else {
                        // 选择类名为“comment-body”的第一个元素
                        item.description = $('.read').first().html() || '无法获取正文内容，请手动访问';
                        item.author = $('.arti_publisher').html();
                    }
                } catch {
                    item.description = '正文内容获取失败';
                }
                return item;
            })
        )
    );

    return {
        // 源标题
        title: `${$('title').text()}-教务处通知-中国石油大学（华东）`,
        // 源链接
        link: `${baseUrl}/${type}/list.htm`,
        // 源文章
        item: items,
    };
};

export const route: Route = {
    path: '/jwc/:type?',
    categories: ['university'],
    example: '/upc/jwc/tzgg',
    parameters: { type: '分类，见下表，其值与对应网页url路径参数一致，默认为所有通知' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['jwc.upc.edu.cn', 'jwc.upc.edu.cn/:type/list.htm'],
            target: '/jwc/:type?',
        },
    ],
    name: '教务处',
    maintainers: ['sddzhyc'],
    description: `| 所有通知 | 教学·运行 | 学业·学籍 | 教学·研究 | 课程·教材 | 实践·教学 | 创新·创业 | 语言·文字 | 继续·教育 | 本科·招生 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| tzgg     | 18519    | 18520   | 18521    |    18522 |    18523 | 18524    |  yywwz   |  jxwjy   |   bkwzs  |`,
    url: 'jwc.upc.edu.cn/tzgg/list.htm',
    handler,
};
