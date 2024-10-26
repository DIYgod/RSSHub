import { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/search/:query/:mode?/:routeParams?',
    name: '搜索',
    url: 'furaffinity.net',
    categories: ['other'],
    example: '/furaffinity/search/protogen/nsfw',
    maintainers: ['SkyNetX007'],
    parameters: {
        query: '搜索内容',
        mode: '是否启用R18内容, 默认为 sfw, 选项为 sfw, nsfw',
        routeParams: '额外搜索参数',
    },
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
            source: ['furaffinity.net'],
            target: '/search',
        },
    ],
    handler,
    description: `
额外搜索参数
order_by: '排序依据, 默认为 relevancy, 选项为 relevancy, date, popularity',
order_direction: '排序顺序, 默认为 desc, 选项为 desc, asc',
range: '时限, 默认为 all, 选项为 all, 1day, 3days, 7days, 30days, 90days, 1year, 3years, 5years',
pattern: '匹配模式, 默认为 extended, 选项为 all, any, extended',
type: '作品类型, 默认为全部, 选项为 art, flash, photo, music, story, poetry'
`,
};

async function handler(ctx) {
    const { query, mode = 'sfw', routeParams = 'order_by=relevancy' } = ctx.req.param();
    let url = `https://faexport.spangle.org.uk/search.json?sfw=1&full=1&q=${query}&${routeParams}`;
    if (mode === 'nsfw') {
        url = `https://faexport.spangle.org.uk/search.json?full=1&q=${query}&${routeParams}`;
    }

    const data = await ofetch(url, {
        method: 'GET',
        headers: {
            Referer: 'https://faexport.spangle.org.uk/',
        },
    });

    const items = data.map((item) => ({
        title: item.title,
        link: item.link,
        guid: item.id,
        description: `<img src="${item.thumbnail}">`,
        // 由于源API未提供日期，故无pubDate
        author: item.name,
    }));

    return {
        allowEmpty: true,
        title: 'Fur Affinity | Search',
        link: `https://www.furaffinity.net/Search/?q=${query}`,
        description: `Fur Affinity Search`,
        item: items,
    };
}
