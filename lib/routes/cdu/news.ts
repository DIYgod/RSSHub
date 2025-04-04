import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/newscdu/:category?',
    categories: ['university'],
    example: '/cdu/news',
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
            target: '/news/:category',
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

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const list = $('ul.ul-mzw-litpic-a2 li a.con')
        .slice(0, 10)
        .toArray()
        .map((item) => {
            item = $(item);
            const title = item.find('.tit').text().trim();
            const link = item.attr('href');
            const dateElement = item.find('.date');

            let pubDate;
            if (dateElement.find('.day').length && dateElement.find('.year').length) {
                const day = dateElement.find('.day').text().trim();
                const yearMonth = dateElement.find('.year').text().trim();
                pubDate = timezone(parseDate(`${yearMonth}-${day}`), 8);
            } else {
                const dateText = dateElement.text().trim();
                pubDate = timezone(parseDate(dateText), 8);
            }

            return {
                title,
                link: link.startsWith('http') ? link : new URL(link, rootUrl).href,
                pubDate,
                author: '成都大学新闻网',
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got({
                    method: 'get',
                    url: item.link,
                });
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
        title: `${$('.head-tit').text().trim()} - ${$('title').text().split('-')[0]}`,
        link: currentUrl,
        item: items,
    };
}
