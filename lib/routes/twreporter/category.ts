import { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

import fetch from './fetch-article';

export const route: Route = {
    path: '/category/:category',
    categories: ['new-media'],
    example: '/twreporter/category/world',
    parameters: { category: 'Category' },
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
            source: ['twreporter.org/:category'],
        },
    ],
    name: '分類',
    maintainers: ['emdoe'],
    handler,
    url: 'twreporter.org/',
};

// 发现其实是个开源项目 https://github.com/twreporter/go-api，所以我们能在以下两个文件找到相应的类目 ID，从 https://go-api.twreporter.org/v2/index_page 这里拿的话复杂度比较高而且少了侧栏的几个类目：
// https://github.com/twreporter/go-api/blob/master/internal/news/category_set.go
// https://github.com/twreporter/go-api/blob/master/internal/news/category.go
const CATEGORIES = {
    world: {
        name: '國際兩岸',
        url_name: 'world',
        category_id: '63206383207bf7c5f871622c',
    },
    humanrights: {
        name: '人權司法',
        url_name: 'humanrights',
        category_id: '63206383207bf7c5f8716234',
    },
    politics_and_society: {
        name: '政治社會',
        url_name: 'politics-and-society',
        category_id: '63206383207bf7c5f871623d',
    },
    health: {
        name: '醫療健康',
        url_name: 'health',
        category_id: '63206383207bf7c5f8716245',
    },
    environment: {
        name: '環境永續',
        url_name: 'environment',
        category_id: '63206383207bf7c5f871624d',
    },
    econ: {
        name: '經濟產業',
        url_name: 'econ',
        category_id: '63206383207bf7c5f8716254',
    },
    culture: {
        name: '文化生活',
        url_name: 'culture',
        category_id: '63206383207bf7c5f8716259',
    },
    education: {
        name: '教育校園',
        url_name: 'education',
        category_id: '63206383207bf7c5f8716260',
    },
    podcast: {
        name: 'Podcast',
        url_name: 'podcast',
        category_id: '63206383207bf7c5f8716266',
    },
    opinion: {
        name: '評論',
        url_name: 'opinion',
        category_id: '63206383207bf7c5f8716269',
    },
    photos_section: {
        name: '影像',
        url_name: 'photography',
        category_id: '574d028748fa171000c45d48',
    },
};

async function handler(ctx) {
    const category = ctx.req.param('category');
    const url = `https://go-api.twreporter.org/v2/posts?category_id=${CATEGORIES[category].category_id}`;
    const home = `https://www.twreporter.org/categories/${CATEGORIES[category].url_name}`;
    const res = await ofetch(url);
    const list = res.data.records;

    const out = await Promise.all(
        list.map((item) => {
            const title = item.title;
            // categoryNames = item.category_set[0].category.name;
            return cache.tryGet(item.slug, async () => {
                const single = await fetch(item.slug);
                single.title = title;
                return single;
            });
        })
    );

    return {
        title: `報導者 | ${CATEGORIES[category].name}`,
        link: home,
        item: out,
    };
}
