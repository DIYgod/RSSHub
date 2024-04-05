import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

const getCateName = async (cid = 0) => {
    const key = 'eleduck-categories';
    const cates = await cache.tryGet(key, async () => {
        const res = await got(`https://svc.eleduck.com/api/v1/categories`);
        const map = {};
        for (const item of res.data.categories) {
            map[item.id] = item.name;
        }
        return map;
    });

    return cates[cid] || '全部';
};

export const route: Route = {
    path: '/posts/:id?',
    categories: ['bbs'],
    example: '/eleduck/posts/4',
    parameters: { id: '分类id,可以论坛的URL找到，默认为全部' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '分类文章',
    maintainers: ['running-grass'],
    handler,
    description: `| id | 分类     |
  | -- | -------- |
  | 0  | 全部     |
  | 1  | 讨论     |
  | 2  | 分享     |
  | 3  | 露个脸   |
  | 4  | 访谈故事 |
  | 5  | 招聘     |
  | 10 | 海外移民 |
  | 12 | 英语     |
  | 14 | 电鸭官方 |
  | 15 | 独立产品 |
  | 17 | 闲话开源 |
  | 19 | Web3     |
  | 21 | 设计     |
  | 22 | 人才库   |
  | 23 | Upwork   |
  | 24 | 经验课   |`,
};

async function handler(ctx) {
    const cid = ctx.req.param('id') || 0;

    const response = await got(`https://svc.eleduck.com/api/v1/posts?category=${cid}&sort=-published_at&page=1`);

    const { posts } = response.data;
    if (posts === undefined) {
        throw new Error('没有获取到数据');
    }

    const cname = await getCateName(cid);

    return {
        title: `电鸭社区的文章--${cname}`,
        link: `https://eleduck.com/categories/${cid}`,
        description: `电鸭社区的文章,栏目为${cname}`,
        item: posts.map((item) => ({
            title: item.title,
            description: item.summary,
            pubDate: item.published_at,
            link: `https://eleduck.com/${item.category.id === 22 ? 'tposts' : 'posts'}/${item.id}`,
            author: item.user.nickname,
        })),
    };
}
