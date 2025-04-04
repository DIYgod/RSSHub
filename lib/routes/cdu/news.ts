import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/newscdu/:category?',
    categories: ['university'],
    example: '/newscdu/cdyw',
    parameters: { category: '分类，见下表，默认为成大要闻' },
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
            source: ['news.cdu.edu.cn/:category.htm'],
            target: '/newscdu/:category',
        },
    ],
    name: '成都大学-新闻网',
    maintainers: ['uuwor'],
    handler,
    url: 'news.cdu.edu.cn/',
    description: `| 嘤鸣视界 | 成大要闻  | 综合新闻  | 媒体视角  | 成大人物  | 专题合集  | 影像成大  | 校园媒体 |   |
|------|-------|-------|-------|-------|-------|-------|------|---|
| ymsj | cdyw  | zhxw  | mtsj  | cdrw  | zthj  | yxcd  | xymt |   |
`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'cdyw';
    const rootUrl = 'https://news.cdu.edu.cn';
    const currentUrl = `${rootUrl}/${category}.htm`;
    const response = await got.get(currentUrl);
    const $ = load(response.data);

    const list = $('li a[title]')
        .slice(0, 10)
        .toArray()
        .map((item) => {
            const element = $(item);
            // 优先使用title属性内容，避免内容被截断
            const title = element.attr('title') || element.find('.tit').text().trim();
            const link = element.attr('href');
            // 获取日期文本并去除空格
            const dateElement = element.find('.date');
            // 定义一个变量存储发布日期
            let pubDate;
            // 检查日期元素的结构
            if (dateElement.find('.day').length && dateElement.find('.year').length) {
                // 格式 1: <div class="date"><div class="day">02</div><div class="year">2025-04</div></div>
                const day = dateElement.find('.day').text().trim();
                const yearMonth = dateElement.find('.year').text().trim();
                pubDate = timezone(parseDate(`${yearMonth}-${day}`), 8);
            } else {
                // 格式 2: <div class="date">2025-04-01</div>
                const dateText = dateElement.text().trim();
                pubDate = timezone(parseDate(dateText), 8);
            }

            return {
                title,
                // 处理相对路径链接
                link: link.startsWith('http') ? link : new URL(link, baseUrl).href,
                pubDate,
                author: '成大新闻',
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got.get(item.link);
                const $ = load(response.data);

                // 清理无关内容并提取正文
                const content = $('.v_news_content');
                // 移除版权声明等无关元素
                content.find('*[style*="text-align: right"]').remove();

                item.description = content.html();
                return item;
            })
        )
    );

    return {
        title: `${$('.crumb-link').text()} - ${$('title').text()}`,
        link: url,
        item: items,
    };
}
