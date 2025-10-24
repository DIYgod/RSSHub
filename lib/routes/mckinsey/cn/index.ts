import { Route, ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { categories } from './category-map';
import { load } from 'cheerio';
import cache from '@/utils/cache';

const baseUrl = 'https://www.mckinsey.com.cn';

export const route: Route = {
    path: '/cn/:category?',
    categories: ['finance'],
    view: ViewType.Articles,
    example: '/mckinsey/cn',
    parameters: {
        category: {
            description: '分类，留空为 `最新洞见`',
            options: Object.entries(categories).map(([, label]) => ({ value: label.slug, label: label.name })),
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
    } else if (categories[category]) {
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
        .map((item) => {
            const $item = $(item);
            const a = $item.find('h2 a');
            return {
                title: a.attr('title'),
                description: $item.find('.fl-post-grid-content').html()?.trim(),
                link: a.attr('href'),
                pubDate: $item.find('[itemprop="datePublished"]').length ? parseDate($item.find('[itemprop="datePublished"]').attr('content')!) : undefined,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link, {
                    headers,
                });
                const $ = load(response);

                item.description = $('.ast-post-format-').html() || item.description;
                item.guid = $('link[rel="shortlink"]').attr('href');

                return item;
            })
        )
    );

    return {
        title: $('head title').text(),
        link,
        image: $('meta[name="msapplication-TileImage"]').attr('content'),
        item: items,
    };
}
