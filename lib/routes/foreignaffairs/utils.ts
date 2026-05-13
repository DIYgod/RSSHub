import { load } from 'cheerio';
import got from '@/utils/got';

export async function getArticleDetail(link: string): Promise<{
    description: string;
    category: string[];
    author: string | Array<{ name: string; url?: string }>;
}> {
    const response = await got({ method: 'get', url: link });
    const $ = load(response.data);

    // Remove paywall elements and loading indicators
    $('.paywall').remove();
    $('.loading-indicator').remove();

    // Extract article body content
    const contentEl = $('.rich-text__inner, .article-dropcap--inner.paywall-content, .article__body-content');
    const description = contentEl.first().html() || '';

    // Extract topics from JSON-LD
    const categories: string[] = [];
    $('script[type="application/ld+json"]').each((_, script) => {
        try {
            const json = JSON.parse($(script).text());
            const graph = json['@graph'] || [json];
            for (const item of graph) {
                if (item.keywords && Array.isArray(item.keywords)) {
                    categories.push(...item.keywords);
                }
                if (item.about && Array.isArray(item.about)) {
                    categories.push(...item.about.filter((a: string) => typeof a === 'string'));
                }
            }
        } catch {
            // skip invalid JSON
        }
    });

    // Extract author URL from JSON-LD
    const authorEntries: Array<{ name: string; url?: string }> = [];
    $('script[type="application/ld+json"]').each((_, script) => {
        try {
            const json = JSON.parse($(script).text());
            const graph = json['@graph'] || [json];
            for (const item of graph) {
                if (item.author) {
                    const authors = Array.isArray(item.author) ? item.author : [item.author];
                    for (const a of authors) {
                        if (a.name) {
                            authorEntries.push({
                                name: a.name,
                                url: a.url,
                            });
                        }
                    }
                }
            }
        } catch {
            // skip invalid JSON
        }
    });

    // Deduplicate categories
    const uniqueCategories = [...new Set(categories)];

    return {
        description,
        category: uniqueCategories,
        author: authorEntries.length > 1 ? authorEntries : (authorEntries[0]?.name || ''),
    };
}
