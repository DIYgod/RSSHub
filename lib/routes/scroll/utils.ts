import { load } from 'cheerio';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { DataItem } from '@/types';
import cache from '@/utils/cache';

export const rootUrl = 'https://scroll.in';

// Helper function to map article data to a consistent format
function mapArticle(article: any) {
    return {
        title: article.title,
        link: article.permalink,
        description: article.summary || '',
        itunes_item_image: article.cover?.large || '',
        image: article.cover?.large || '',
        author:
            article.authors?.length > 0
                ? article.authors.map((author: any) => ({
                      name: author?.name,
                      url: `${rootUrl}/author/${author?.id}`,
                      avatar: author?.headshot || '',
                  }))
                : '',
        pubDate: article.published ? parseDate(article.published) : undefined,
    };
}

export async function extractFeedArticleLinks(feedPath: string) {
    const feedUrl = `${rootUrl}/feed/${feedPath}/page/1`;
    const response = await ofetch(feedUrl);

    if (!response.articles) {
        return [];
    }

    const allArticles = response.articles.flatMap((section: any) => section.blocks?.filter((block: any) => block.type === 'row-stories').flatMap((block: any) => block.articles || []) || []);

    return allArticles.map((article) => mapArticle(article)).filter((item: any) => item.title && item.link);
}

export async function extractTrendingArticles() {
    const feedUrl = `${rootUrl}/feed/series/1/page/1`;
    const response = await ofetch(feedUrl);

    if (!response.articles) {
        return [];
    }

    // Filter for trending blocks which have title: "Trending"
    const trendingBlocks = response.articles.flatMap((section: any) => section.blocks || []).filter((block: any) => block.title === 'Trending' && block.type === 'list-collection-stories');

    if (!trendingBlocks.length) {
        return [];
    }

    // Combine articles from all trending blocks
    const trendingArticles = trendingBlocks.flatMap((block: any) => block.articles || []);

    return trendingArticles.map((article) => mapArticle(article)).filter((item: any) => item.title && item.link);
}

export function fetchArticleContent(item: any): Promise<DataItem> {
    return cache.tryGet(item.link, async () => {
        try {
            const articleResponse = await ofetch(item.link);
            const $article = load(articleResponse);
            const category = $article('.article-tags-list a.tag-menu')
                .toArray()
                .map((tag) => $article(tag).text().trim());

            // Remove elements that shouldn't be in the content
            $article('.below-article-share-block').nextAll().remove();
            $article('.below-article-share-block').remove();
            $article('header').remove(); // Remove all header tags
            $article('i.mail-us-section').remove(); // Remove mail us section
            $article('ul.article-tags-list').remove();

            // Get content after header removal
            const content = $article('.story-element').html() || $article('article .content').html() || $article('.article-content').html() || item.description;

            return {
                ...item,
                description: content,
                category,
            } as DataItem;
        } catch {
            return item as DataItem;
        }
    });
}
