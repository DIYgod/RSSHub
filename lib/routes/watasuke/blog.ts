import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import markdownit from 'markdown-it';

import { Route } from '@/types';

const handler = async () => {
    const baseUrl = 'https://watasuke.net';
    const apiUrl = `${baseUrl}/page-data/blog/page-data.json`;
    const response = await got(apiUrl);
    const md = markdownit({ linkify: true, breaks: true });
    const articles = response.data.result.data.allArticles.nodes.map((node) => ({
        title: node.title,
        description: md.render(node.body),
        pubDate: parseDate(node.published_at),
        updated: parseDate(node.updated_at),
        link: `${baseUrl}/blog/article/${node.slug}/`,
        category: node.tags.map((tag) => tag.name),
    }));

    return {
        title: 'ブログ - わたすけのへや',
        link: `${baseUrl}/blog/`,
        item: articles,
        language: 'ja',
        icon: `${baseUrl}/icons/icon-512x512.png`,
        logo: `${baseUrl}/icons/icon-512x512.png`,
    };
};
export const route: Route = {
    path: '/blog',
    example: '/watasuke/blog',
    radar: [
        {
            source: ['watasuke.net/blog/', 'watasuke.net/'],
        },
    ],
    name: 'Blog',
    maintainers: ['honahuku'],
    handler,
    url: 'watasuke.net/blog/',
};
