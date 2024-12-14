import { Route } from '@/types';
import got from '@/utils/got';
import cache from '@/utils/cache';

export const route: Route = {
    path: '/:category?',
    categories: ['other'],
    example: '/aves',
    parameters: { category: '分类，见下表' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '分类',
    maintainers: ['dddaniel1'],
    handler,
    description: `| 诗歌 | 小说 | 专栏 | 档案 | 非虚构 | all
  | -------- | -------- | -------- | -------- | -------- |
  | 1     | 2     | 3     | 4     | 5     | all     |`,
};

async function handler(ctx) {
    const { category } = ctx.req.param();
    const currentUrl = 'http://aves.art/';
    const rootUrl = 'https://app.aves.art';
    const categoryPath = '/api/lb_catalog/get_catalog_post';
    const detailPath = '/api/lb_post/detail';
    const cateMapping = new Map([
        ['1', '诗歌'],
        ['2', '小说'],
        ['3', '专栏'],
        ['4', '档案'],
        ['5', '非虚构'],
        ['all', 'all'],
    ]);
    const title = `小鸟文学 - ${cateMapping.get(category)}`;
    const description =
        '小鸟文学是个独立 App，它的表达在不停变化，认识它的人都有不同的机缘。此前你可能会从各种短篇小说、长篇访谈，人类学田野笔记或者和它的前身《好奇心日报》的联系认识到它，如今它还在持续作出调整。不过它的价值观一以贯之：和我们所处的世界保持距离，与此同时又不会袖手旁观。';
    let articleIds: any[] = [];
    if (category === 'all') {
        const allCategoryId = ['1', '2', '3', '4', '5'];
        const allCategory = await Promise.all(allCategoryId.map((item) => got.post(`${rootUrl}${categoryPath}`, { json: { catalogId: item } })));
        for (const item of allCategory) {
            if (item?.data.code === 200) {
                articleIds.push(...item.data.result);
            }
        }
        articleIds = articleIds.flat().map((item) => item.id);
    } else {
        const { data } = await got.post(`${rootUrl}${categoryPath}`, { json: { catalogId: category } });
        if (data.code === 200) {
            articleIds.push(...data.result);
        }
        articleIds = articleIds.map((item) => item.id);
    }
    const articles: any[] = await Promise.all(
        articleIds.map((id) =>
            cache.tryGet(String(id), async () => {
                const res: any = await got.post(`${rootUrl}${detailPath}`, { json: { id } });
                if (res.data.code === 200) {
                    return {
                        title: res.data.result.title,
                        description: res.data.result.content,
                        author: JSON.parse(res.data.result.author)[0].name,
                        pubDate: res.data.result.publishedAt,
                    };
                }
                return {};
            })
        )
    );
    return {
        item: articles,
        title,
        link: currentUrl,
        description,
        language: 'zh',
        image: 'https://imagedelivery.net/kDRCweMmqLnTPNlbum-pYA/prod/avatar/2798eec0-9a13-4a2f-85cf-27d00832aee3.jpeg/public',
        allowEmpty: true,
    };
}
