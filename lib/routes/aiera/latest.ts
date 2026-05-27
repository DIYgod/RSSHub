import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/latest',
    categories: ['new-media'],
    example: '/aiera/latest',
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
            source: ['aiera.com.cn'],
            target: '/latest',
        },
    ],
    name: '最新文章',
    maintainers: ['panqingjie00'],
    handler,
};

async function handler() {
    const response = await got(`https://aiera.com.cn/wp-json/wp/v2/posts`, {
        searchParams: {
            per_page: 20,
            _embed: '',
        },
    });

    const items = response.data.map((item) => ({
        title: item.title.rendered,
        description: item.content.rendered,
        pubDate: parseDate(item.date_gmt),
        link: item.link,
        guid: item.guid.rendered,
        author: item._embedded?.author?.[0]?.name,
    }));

    return {
        title: '新智元 - 最新文章',
        link: 'https://aiera.com.cn',
        description: '新智元最新 AI 新闻资讯',
        language: 'zh-CN',
        item: items,
    };
}
