import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

import { getArticleItem } from './fetch-article';

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
        {
            source: ['twreporter.org/categories/world'],
            target: '/category/world',
        },
        {
            source: ['twreporter.org/categories/humanrights'],
            target: '/category/humanrights',
        },
        {
            source: ['twreporter.org/categories/politics-and-society'],
            target: '/category/politics_and_society',
        },
        {
            source: ['twreporter.org/categories/health'],
            target: '/category/health',
        },
        {
            source: ['twreporter.org/categories/environment'],
            target: '/category/environment',
        },
        {
            source: ['twreporter.org/categories/econ'],
            target: '/category/econ',
        },
        {
            source: ['twreporter.org/categories/culture'],
            target: '/category/culture',
        },
        {
            source: ['twreporter.org/categories/education'],
            target: '/category/education',
        },
        {
            source: ['twreporter.org/categories/podcast'],
            target: '/category/podcast',
        },
        {
            source: ['twreporter.org/categories/opinion'],
            target: '/category/opinion',
        },
        {
            source: ['twreporter.org/categories/photography'],
            target: '/category/photos_section',
        },
    ],
    name: '分類',
    maintainers: ['emdoe'],
    handler,
    url: 'twreporter.org/',
};

// The source API defines category IDs in the following files; index_page omits some sidebar categories.
// https://github.com/twreporter/go-api/blob/master/internal/news/category_set.go
// https://github.com/twreporter/go-api/blob/master/internal/news/category.go
const categories = {
    world: {
        name: '國際兩岸',
        urlName: 'world',
        categoryId: '63206383207bf7c5f871622c',
    },
    humanrights: {
        name: '人權司法',
        urlName: 'humanrights',
        categoryId: '63206383207bf7c5f8716234',
    },
    politics_and_society: {
        name: '政治社會',
        urlName: 'politics-and-society',
        categoryId: '63206383207bf7c5f871623d',
    },
    health: {
        name: '醫療健康',
        urlName: 'health',
        categoryId: '63206383207bf7c5f8716245',
    },
    environment: {
        name: '環境永續',
        urlName: 'environment',
        categoryId: '63206383207bf7c5f871624d',
    },
    econ: {
        name: '經濟產業',
        urlName: 'econ',
        categoryId: '63206383207bf7c5f8716254',
    },
    culture: {
        name: '文化生活',
        urlName: 'culture',
        categoryId: '63206383207bf7c5f8716259',
    },
    education: {
        name: '教育校園',
        urlName: 'education',
        categoryId: '63206383207bf7c5f8716260',
    },
    podcast: {
        name: 'Podcast',
        urlName: 'podcast',
        categoryId: '63206383207bf7c5f8716266',
    },
    opinion: {
        name: '評論',
        urlName: 'opinion',
        categoryId: '63206383207bf7c5f8716269',
    },
    photos_section: {
        name: '影像',
        urlName: 'photography',
        categoryId: '574d028748fa171000c45d48',
    },
};

async function handler(ctx) {
    const category = ctx.req.param('category');
    if (!Object.hasOwn(categories, category)) {
        throw new InvalidParameterError(`Unsupported category "${category}", please choose from: ${Object.keys(categories).join(', ')}`);
    }
    const url = `https://go-api.twreporter.org/v2/posts?category_id=${categories[category].categoryId}`;
    const home = `https://www.twreporter.org/categories/${categories[category].urlName}`;
    const res = await ofetch(url);
    const list = res.data.records;

    const out = await pMap(list, getArticleItem, { concurrency: 3 });

    return {
        title: `報導者 | ${categories[category].name}`,
        link: home,
        item: out,
    };
}
