import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import cheerio from 'cheerio';

const baseUrl = 'https://watasuke.net';

export default async (ctx) => {
    const blogPageHtml = await got(`${baseUrl}/blog/`).text();
    const $ = cheerio.load(blogPageHtml);
    const ogTitle = $('meta[property="og:title"]').attr('content');

    const apiUrl = `${baseUrl}/page-data/blog/page-data.json`;
    const response = await got(apiUrl);
    const articles = response.data.result.data.allArticles.nodes;

    const items = articles.map((article) => ({
        title: article.title,
        description: article.body,
        pubDate: parseDate(article.published_at),
        link: `${baseUrl}/blog/article/${article.slug}`,
        category: article.tags.map((tag) => tag.name),
    }));

    ctx.set('data', {
        title: ogTitle || String(baseUrl),
        link: `${baseUrl}/blog/`,
        item: items,
    });
};
