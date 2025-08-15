import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/ndrc/wjk/:year?/:type?',
    name: '文件库',
    example: '/gov/ndrc/wjk',
    parameters: {
        year: '发布年份，可选值：2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017以前，默认为全部',
        type: '文件类型，可选值：发展改革委令, 规范性文件, 公告, 规划文本, 通知, 政策解读, 其他，默认为全部',
    },
    maintainers: ['assistant'],
    categories: ['government'],
    handler,
    radar: [
        {
            title: '中华人民共和国国家发展和改革委员会 - 文件库',
            source: ['ndrc.gov.cn/xxgk/wjk/', 'ndrc.gov.cn/xxgk/wjk'],
            target: '/gov/ndrc/wjk',
        },
    ],
    description: `文件库支持按年份和文件类型筛选：

| 发布年份 | 参数值 |
| -------- | ------ |
| 全部 | 不填或留空 |
| 2025 | 2025 |
| 2024 | 2024 |
| 2023 | 2023 |
| 2022 | 2022 |
| 2021 | 2021 |
| 2020 | 2020 |
| 2019 | 2019 |
| 2018 | 2018 |
| 2017以前 | 2017 |

| 文件类型 | 参数值 |
| -------- | ------ |
| 全部 | 不填或留空 |
| 发展改革委令 | 发展改革委令 |
| 规范性文件 | 规范性文件 |
| 公告 | 公告 |
| 规划文本 | 规划文本 |
| 通知 | 通知 |
| 政策解读 | 政策解读 |
| 其他 | 其他 |`,
};

async function handler(ctx) {
    // const year = ctx.req.param('year') || '';
    // const type = ctx.req.param('type') || '';
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20;

    const rootUrl = 'https://www.ndrc.gov.cn';
    const currentUrl = `${rootUrl}/xxgk/wjk/`;

    // 暂时先不使用查询参数，直接访问主页面
    const searchUrl = currentUrl;

    const response = await got({
        method: 'get',
        url: searchUrl,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
    });

    const $ = load(response.data);

    // 根据国家发改委网站的实际结构查找文件列表
    // 参考其他ndrc路由，使用 ul.u-list li a 结构
    const list = $('ul.u-list li a')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const link = item.attr('href');
            const title = item.attr('title') || item.text().trim();

            if (!link || !title || title.length < 3) {return null;}

            // 处理相对链接，使用new URL来确保正确性
            const fullLink = new URL(link, currentUrl).href;

            // 尝试获取发布时间 - 通常在链接的兄弟元素中
            const dateText = item.next().text().trim() || item.parent().find('span').last().text().trim();

            return {
                title: title.replaceAll(/\s+/g, ' '),
                link: fullLink,
                pubDate: dateText && /\d{4}[/-]\d{2}[/-]\d{2}/.test(dateText) ? parseDate(dateText) : undefined,
            };
        })
        .filter(Boolean);

    // 获取详细内容，参考其他ndrc路由的模式
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const { data: detailResponse } = await got(item.link);
                    const content = load(detailResponse);

                    // 获取文章标题（meta标签中的更准确）
                    const articleTitle = content('meta[name="ArticleTitle"]').attr('content');
                    if (articleTitle) {
                        item.title = articleTitle;
                    }

                    // 获取详细内容 - 国家发改委使用TRS_Editor类
                    const description = content('div.TRS_Editor').html() || content('div.article').html() || content('div.content').html() || '';

                    if (description) {
                        item.description = description + (content('table.enclosure').html() || '');
                    }

                    // 获取发布日期
                    const pubDateMeta = content('meta[name="PubDate"]').attr('content');
                    if (pubDateMeta && !item.pubDate) {
                        item.pubDate = timezone(parseDate(pubDateMeta), 8);
                    }

                    // 获取作者/来源信息
                    item.author = content('meta[name="ContentSource"]').attr('content') || '国家发展和改革委员会';

                    // 获取分类信息
                    const columnName = content('meta[name="ColumnName"]').attr('content');
                    const columnType = content('meta[name="ColumnType"]').attr('content');
                    if (columnName || columnType) {
                        item.category = [columnName, columnType].filter(Boolean);
                    }

                    return item;
                } catch {
                    // 如果获取详细内容失败，返回基本信息
                    return item;
                }
            })
        )
    );

    return {
        title: String($('title').text() || '国家发展和改革委员会文件库'),
        link: searchUrl,
        description: $('meta[name="ColumnDescription"]').attr('content') || '国家发展和改革委员会政策文件库',
        item: items,
        language: $('html').attr('lang') || 'zh-CN',
        author: $('meta[name="SiteName"]').attr('content') || '国家发展和改革委员会',
        allowEmpty: true,
    };
}
