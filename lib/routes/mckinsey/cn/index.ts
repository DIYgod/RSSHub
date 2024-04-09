import { Route } from '@/types';
// use stock `got` package as a workaround for
// https://github.com/DIYgod/RSSHub/issues/8239
// https://github.com/DIYgod/RSSHub/pull/8288
import got from 'got';
import { parseDate } from '@/utils/parse-date';
import { categories } from './category-map';

const baseUrl = 'https://www.mckinsey.com.cn';
const endpoint = `${baseUrl}/wp-json`;

export const route: Route = {
    path: '/cn/:category?',
    categories: ['finance'],
    example: '/mckinsey/cn',
    parameters: { category: '分类，见下表，默认为全部' },
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
    description: `| 分类 | 分类名             |
  | ---- | ------------------ |
  | 25   | 全部洞见           |
  | 2    | 汽车               |
  | 3    | 金融服务           |
  | 4    | 消费者             |
  | 5    | 医药               |
  | 7    | 数字化             |
  | 8    | 制造业             |
  | 9    | 私募               |
  | 10   | 技术，媒体与通信   |
  | 12   | 城市化与可持续发展 |
  | 13   | 创新               |
  | 16   | 人才与领导力       |
  | 18   | 宏观经济           |
  | 19   | 麦肯锡全球研究院   |
  | 37   | 麦肯锡季刊         |
  | 41   | 资本项目和基础设施 |
  | 42   | 旅游、运输和物流   |
  | 45   | 全球基础材料       |`,
};

async function handler(ctx) {
    const { category = '25' } = ctx.req.param();
    if (isNaN(category)) {
        categories.find((c) => c.slug === category);
    }

    const posts = await got(`${endpoint}/wp/v2/posts`, {
        searchParams: {
            per_page: ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 50,
            categories: category,
        },
    }).json();

    const items = posts.map((item) => ({
        title: item.title.rendered,
        description: item.content.rendered,
        link: item.link,
        guid: item.guid.rendered,
        pubDate: parseDate(item.date_gmt),
    }));

    return {
        title: category ? `McKinsey Greater China - ${categories[category].name}` : `McKinsey Greater China`,
        link: `${baseUrl}/${category === '25' ? categories[category].slug : `${categories[25].slug}/${categories[category].slug}`}/`,
        item: items,
    };
}
