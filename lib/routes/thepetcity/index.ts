import { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { termsMap } from './terms-map';

const baseUrl = 'https://thepetcity.co';

export const route: Route = {
    path: '/:term?',
    categories: ['new-media'],
    example: '/thepetcity',
    parameters: { term: '見下表，留空為全部文章' },
    radar: Object.entries(termsMap).map(([key, value]) => ({
        title: value.title,
        source: [...new Set([`thepetcity.co${value.slug}`, 'thepetcity.co/'])],
        target: key ? `/${key}` : '',
    })),
    name: '分類',
    maintainers: ['TonyRL', 'bigfei'],
    handler,
    url: 'thepetcity.co/',
    description: `| Column Name       | TermID |
| -------------------- | ------ |
| Knowledge飼養大全     | 3      |
| Funny News毛孩趣聞    | 2      |
| Raise Pets 養寵物新手  | 5      |
| Hot Spot 毛孩打卡點    | 4      |
| Pet Staff 毛孩好物    | 1      |`,
};

async function handler(ctx) {
    const term = ctx.req.param('term');
    const searchParams = term ? { pageId: 977_080_509_047_743, term } : { pageId: 977_080_509_047_743 };
    const data = await ofetch(`${baseUrl}/node_api/v1/articles/posts`, { query: { ...searchParams } });

    const list = data.data.posts.map((post) => ({
        title: post.title,
        description: post.description,
        link: `${baseUrl}${post.url}`,
        pubDate: parseDate(post.post_date),
        guid: post.guid,
        api: `${baseUrl}/node_api/v1/articles/${post.id}`,
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.guid, async () => {
                const data = await ofetch(item.api, {
                    query: {
                        pageId: 977_080_509_047_743,
                    },
                });
                item.description = data.data.post_content;
                item.category = [...new Set([...data.data.tags.map((t) => t.name), ...data.data.categories.map((c) => c.name)])];
                item.author = data.data.author.display_name;
                return item;
            })
        )
    );

    return {
        title: termsMap[term] ? termsMap[term].title : termsMap[''].title,
        description: '專屬毛孩愛好者的資訊平台，不論你是貓奴、狗奴，還是其他動物控，一起發掘最新的萌寵趣聞、有趣的寵物飼養知識、訓練動物、竉物用品推介、豐富多樣的寵物可愛影片。',
        link: baseUrl,
        image: 'https://assets.presslogic.com/presslogic-hk-pc/static/favicon.ico',
        item: items,
    };
}
