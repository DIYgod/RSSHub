import { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/weread/:category',
    categories: ['new-media'],
    example: '/qq/weread/newbook',
    parameters: {
        category: '榜单名，见下表',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '微信读书榜单',
    maintainers: ['gogo-100'],
    handler,
    description: `| 榜单                  | 榜单名     |
| ---------------------- | ---------- |
| Top50飙升榜           | rising     |
| Top50热搜榜           | hot_search |
| Top50新书榜           | newbook    |
| Top50小说榜           | general_novel_rising |
| Top200总榜            | all        |
| 神作榜                 | newrating_publish |
| 神作潜力榜            | newrating_potential_publish |
| 精品小说              | 100000     |
| 历史                  | 200000     |
| 文学                  | 300000     |
| 艺术                  | 400000     |
| 人物传记              | 500000     |
| 哲学宗教              | 600000     |
| 计算机                | 700000     |
| 心理                  | 800000     |
| 社会文化              | 900000     |
| 个人成长              | 1000000    |
| 经济理财              | 1100000    |
| 政治军事              | 1200000    |
| 童书                  | 1300000    |
| 教育学习              | 1400000    |
| 科学技术              | 1500000    |
| 生活百科              | 1600000    |
| 期刊杂志              | 1700000    |
| 原版书                | 1800000    |
| 男生小说              | 1900000    |
| 女生小说              | 2000000    |
| 医学健康              | 2100000    |

还可以分得更细 见 https://weread.qq.com/web/category/100000 的小标题栏
`,
};

async function handler(ctx) {
    const category = ctx.req.param('category');

    // 检查 category 是否是榜单，若否则全部为阿拉伯数字
    const isRank = /^\d+$/.test(category) ? 0 : 1;

    const LIMIT = category === 'all' ? 180 : 40;
    const SIZE = 20;

    const urls = Array.from({ length: Math.ceil((LIMIT + 1) / SIZE) }, (_, index) => `https://weread.qq.com/web/bookListInCategory/${category}?maxIndex=${index * SIZE}&rank=${isRank}`);

    const responses = await Promise.all(urls.map((url) => ofetch(url)));

    const results = responses.flatMap((response) =>
        response.books.map((book) => {
            const bookInfo = book.bookInfo;
            return {
                title: bookInfo.title,
                description: `推荐值 ${bookInfo.newRating / 10}% ${bookInfo.newRatingDetail.title}|| ` + bookInfo.intro,
                author: bookInfo.author,
                guid: bookInfo.bookId,
                itunes_item_image: bookInfo.cover,
            };
        })
    );

    const title = categoryTitles[category] || '书籍列表';
    return {
        title: '微信读书 - ' + title,
        link: `https://weread.qq.com/web/category/${category}`,
        item: results,
    };
}

const categoryTitles = {
    rising: 'Top50飙升榜',
    hot_search: 'Top50热搜榜',
    newbook: 'Top50新书榜',
    general_novel_rising: 'Top50小说榜',
    all: 'Top200总榜',
    newrating_publish: '神作榜',
    newrating_potential_publish: '神作潜力榜',
    '100000': '精品小说',
    '200000': '历史',
    '300000': '文学',
    '400000': '艺术',
    '500000': '人物传记',
    '600000': '哲学宗教',
    '700000': '计算机',
    '800000': '心理',
    '900000': '社会文化',
    '1000000': '个人成长',
    '1100000': '经济理财',
    '1200000': '政治军事',
    '1300000': '童书',
    '1400000': '教育学习',
    '1500000': '科学技术',
    '1600000': '生活百科',
    '1700000': '期刊杂志',
    '1800000': '原版书',
    '1900000': '男生小说',
    '2000000': '女生小说',
    '2100000': '医学健康',
};
