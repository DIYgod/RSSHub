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

    const itemsPromises = articles.map(async (article) => {
        const articleUrl = `${baseUrl}/blog/article/${article.slug}`;
        const articleHtml = await got(articleUrl).text();
        const $article = cheerio.load(articleHtml);
        const ogDescription = $article('meta[property="og:description"]').attr('content') || '説明が見つかりません';

        return {
            title: article.title,
            description: ogDescription,
            pubDate: parseDate(article.published_at),
            link: articleUrl,
            category: article.tags.map((tag) => tag.name),
        };
    });

    const items = await Promise.all(itemsPromises);

    ctx.set('data', {
        title: ogTitle || String(baseUrl),
        link: `${baseUrl}/blog/`,
        item: items,
    });
};
