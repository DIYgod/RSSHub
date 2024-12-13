import { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/:category?',
    categories: ['other'],
    example: '/aves-art',
    parameters: { category: '分类，见下表，默认为信息快递' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '分类',
    maintainers: ['ddddanielx'],
    handler,
    description: `| 小说 | 非虚构 | 档案 | 专栏 | 诗歌 |
  | -------- | -------- | -------- | -------- | -------- |
  | 2     | 5     | 4     | 3     | 1     |`,
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
        ['3', '档案'],
        ['4', '专栏'],
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
    let articles: any[] = await Promise.all(articleIds.map((id) => got.post(`${rootUrl}${detailPath}`, { json: { id } })));
    articles = articles.map((item) => {
        if (item.data.code === 200) {
            return {
                title: item.data.result.title,
                description: item.data.result.content,
                author: item.data.result.author,
                pubDate: item.data.result.publishedAt,
            };
        }
        return {};
    });
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
