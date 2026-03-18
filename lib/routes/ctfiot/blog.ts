import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import type { WPPost } from './types';

const baseUrl = 'https://www.ctfiot.com';
const apiRoot = baseUrl + '/wp-json/wp/v2';

export const route: Route = {
    path: '/blog',
    categories: ['security'],
    example: '/ctfiot/blog',
    parameters: {},
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
            source: ['www.ctfiot.com/blog'],
            target: '/blog',
        },
    ],
    name: 'Blog',
    maintainers: ['zha'],
    handler,
    url: 'www.ctfiot.com/blog',
    description: 'CTF导航博客文章列表。',
};

async function handler(ctx) {
    const limit = Number.parseInt(ctx.req.query('limit')) || 20;
    const { data: posts } = await got<WPPost[]>(apiRoot + '/posts', {
        searchParams: {
            per_page: limit,
            _embed: 'wp:term',
        },
    });

    const items = posts.map((post) => {
        const categories = extractTerms(post, 'category');
        const tags = extractTerms(post, 'post_tag');
        const category = [...categories, ...tags].map((term) => term.name);

        return {
            title: post.title.rendered,
            link: post.link,
            description: post.content.rendered,
            pubDate: parseDate(post.date_gmt || post.date),
            category: category.length ? category : undefined,
        };
    });

    return {
        title: 'CTF导航 - Blog',
        link: baseUrl + '/blog',
        item: items,
    };
}

function extractTerms(post, taxonomy) {
    const groups = post?._embedded?.['wp:term'] ?? [];
    const terms = [];

    for (const group of groups) {
        for (const term of group) {
            if (term?.taxonomy === taxonomy) {
                terms.push(term);
            }
        }
    }

    return terms;
}
