import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/blog-zh',
    categories: ['programming'],
    example: '/huggingface/blog-zh',
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
            source: ['huggingface.co/blog/zh', 'huggingface.co/'],
        },
    ],
    name: '中文博客',
    maintainers: ['zcf0508'],
    handler,
    url: 'huggingface.co/blog/zh',
};

async function handler() {
    const { body: response } = await got('https://huggingface.co/blog/zh');
    const $ = load(response);

    /** @type {Array<{blog: {local: string, title: string, author: string, thumbnail: string, date: string, tags: Array<string>}, blogUrl: string, lang: 'zh', link: string}>} */
    const papers = $('div[data-target="BlogThumbnail"]')
        .toArray()
        .map((item) => {
            const props = $(item).data('props');
            const link = $(item).find('a').attr('href');
            return {
                ...props,
                link,
            };
        });

    const items = papers.map((item) => ({
        title: item.blog.title,
        link: `https://huggingface.co${item.link}`,
        category: item.blog.tags,
        pubDate: parseDate(item.blog.publishedAt),
        author: item.blog.author,
    }));

    return {
        title: 'Huggingface 中文博客',
        link: 'https://huggingface.co/blog/zh',
        item: items,
    };
}
