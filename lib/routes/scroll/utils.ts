import { load } from 'cheerio';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { DataItem } from '@/types';
import cache from '@/utils/cache';

const defaultSelector = 'div.row-stories.column li.row-story';
export const rootUrl = 'https://scroll.in';

export function extractArticleLinks($: any, selector?: string) {
    return $(selector || defaultSelector)
        .toArray()
        .map((item) => {
            const $item = $(item);
            const link = $item.find('a').attr('href');
            const title = $item.find('h1[itemprop="headline about"]').text().trim();
            const description = $item.find('h2[itemprop="description"]').text().trim();
            const image = $item.find('img').attr('src');
            const author = $item.find('address').text().trim();
            const dateStr = $item.find('time[itemprop="datePublished"]').attr('datetime');

            return {
                title,
                link: link?.startsWith('http') ? link : `${rootUrl}${link}`,
                description,
                image,
                author,
                pubDate: dateStr ? parseDate(dateStr) : undefined,
            };
        })
        .filter((item) => item.title && item.link);
}

export async function extractFeedArticleLinks(feedPath: string) {
    const feedUrl = `${rootUrl}/feed/${feedPath}/page/1`;
    const response = await ofetch(feedUrl);

    if (!response.articles) {
        return [];
    }

    const allArticles = response.articles.flatMap((section: any) => section.blocks?.filter((block: any) => block.type === 'row-stories').flatMap((block: any) => block.articles || []) || []);

    return allArticles
        .map((article: any) => ({
            title: article.title,
            link: article.permalink,
            description: article.summary || '',
            itunes_item_image: article.cover?.large || '',
            image: article.cover?.large || '',
            author:
                article.authors?.length > 0
                    ? article.authors.map((author: any) => ({
                          name: author.name,
                          url: `${rootUrl}/author/${author.id}`,
                          avatar: author?.headshot || '',
                          ...(author.bio_short ? { bio: author.bio_short } : {}),
                      }))
                    : '',
            pubDate: article.published ? parseDate(article.published) : undefined,
        }))
        .filter((item: any) => item.title && item.link);
}

export async function extractTrendingArticles() {
    const feedUrl = `${rootUrl}/feed/series/1/page/1`;
    const response = await ofetch(feedUrl);

    if (!response.articles) {
        return [];
    }

    // Find the trending block which has title: "Trending"
    const trendingBlock = response.articles.flatMap((section: any) => section.blocks || []).find((block: any) => block.title === 'Trending' && block.type === 'list-collection-stories');

    if (!trendingBlock || !trendingBlock.articles) {
        return [];
    }

    return trendingBlock.articles
        .map((article: any) => ({
            title: article.title,
            link: article.permalink,
            description: article.summary || '',
            itunes_item_image: article.cover?.large || '',
            image: article.cover?.large || '',
            author:
                article.authors?.length > 0
                    ? article.authors.map((author: any) => ({
                          name: author.name,
                          url: `${rootUrl}/author/${author.id}`,
                          avatar: author?.headshot || '',
                          ...(author.bio_short ? { bio: author.bio_short } : {}),
                      }))
                    : '',
            pubDate: article.published ? parseDate(article.published) : undefined,
        }))
        .filter((item: any) => item.title && item.link);
}

export function fetchArticleContent(item: any): Promise<DataItem> {
    return cache.tryGet(item.link, async () => {
        try {
            const articleResponse = await ofetch(item.link);
            const $article = load(articleResponse);

            // Remove elements that shouldn't be in the content
            $article('.below-article-share-block').nextAll().remove();
            $article('.below-article-share-block').remove();
            $article('header').first().remove(); // Remove only the first header tag
            const content = $article('.story-element').html() || $article('article .content').html() || $article('.article-content').html() || item.description;

            const tags = $article('.article-tags-list a.tag-menu')
                .toArray()
                .map((tag) => $article(tag).text().trim());

            const youtubeEmbed = $article('figure[data-embed-type="youtube"]');
            const videoId = youtubeEmbed.attr('data-embed-id');
            const thumbnail = youtubeEmbed.attr('data-thumbnail');

            const mediaContent = videoId
                ? {
                      enclosure_url: `https://www.youtube.com/watch?v=${videoId}`,
                      enclosure_type: 'video/youtube',
                      itunes_item_image: thumbnail || item.image,
                  }
                : {};

            return {
                ...item,
                description: content,
                category: tags,
                ...mediaContent,
            } as DataItem;
        } catch {
            return item as DataItem;
        }
    });
}
