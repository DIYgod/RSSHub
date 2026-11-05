import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

import { categories } from './category-map';

const baseUrl = 'https://www.mckinsey.com.cn';

export const route: Route = {
    path: '/cn/:category?',
    categories: ['finance'],
    view: ViewType.Articles,
    example: '/mckinsey/cn',
    parameters: {
        category: {
            description: '分类，留空为 `最新洞见`',
            options: Object.values(categories).map((label) => ({ value: label.slug, label: label.name })),
            default: '最新洞见',
        },
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '洞见',
    maintainers: ['laampui'],
    handler,
    description: `| 分类                            | 分类名             |
| ------------------------------- | ------------------ |
|                                 | 全部洞见           |
| autos                           | 汽车               |
| banking-insurance               | 金融服务           |
| consumers                       | 消费者             |
| healthcare-pharmaceuticals      | 医药与医疗         |
| business-technology             | 数字化             |
| manufacturing                   | 制造业             |
| technology-media-and-telecom    | 技术，媒体与通信   |
| urbanization-sustainability     | 城市化与可持续发展 |
| innovation                      | 创新               |
| talent-leadership               | 人才与领导力       |
| macroeconomy                    | 宏观经济           |
| mckinsey-global-institute       | 麦肯锡全球研究院   |
| capital-projects-infrastructure | 资本项目和基础设施 |
| 交通运输与物流                  | 旅游、运输和物流   |
| 出海与国际化、转型              | 出海与国际化、转型 |
| 全球基础材料                    | 全球基础材料       |`,
};

async function handler(ctx) {
    const { category = '25' } = ctx.req.param();

    let categorySlug = '';
    if (category === '25') {
        /* empty */
    } else if (Object.hasOwn(categories, category)) {
        // Category number for backwards compatibility
        categorySlug = categories[category].slug;
    } else {
        // Category slug
        const c = Object.values(categories).find((c) => c.slug === category);
        categorySlug = c ? c.slug : '';
    }
    const link = `${baseUrl}/insights/${categorySlug ? `${categorySlug}/` : ''}`;

    const headers = {
        'accept-language': 'en-US,en;q=0.9',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'none',
    };

    const response = await ofetch(link, {
        headers,
    });
    const $ = load(response);

    const list = $('.fl-post-grid-post')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const a = $item.find('h2 a');
            const date = $item.find('[itemprop="datePublished"]').attr('content');
            return {
                title: a.attr('title')!,
                description: $item.find('.fl-post-grid-content').html()?.trim(),
                link: a.attr('href'),
                pubDate: date ? parseDateInTimezone(date, 8) : undefined,
            };
        });

    const items = await pMap(
        list,
        async (item) => {
            const detail = await cache.tryGet(`mckinsey:article:${item.link}`, async () => {
                const response = await ofetch(item.link!, {
                    headers,
                });
                const $ = load(response);

                return {
                    description: $('.ast-post-format-').html() || undefined,
                    guid: $('link[rel="shortlink"]').attr('href'),
                };
            });
            return { ...item, ...detail, description: detail.description || item.description };
        },
        { concurrency: 3 }
    );

    return {
        title: $('head title').text(),
        link,
        image: $('meta[name="msapplication-TileImage"]').attr('content'),
        item: items,
    };
}
