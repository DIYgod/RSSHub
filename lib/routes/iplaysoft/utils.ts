import { load } from 'cheerio';
import { FetchError } from 'ofetch';
import pMap from 'p-map';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';

const rootUrl = 'https://www.iplaysoft.com/';

const fetchTaxonomy = async (slug: string, type: 'categories' | 'tags') => {
    const taxonomyUrl = `${rootUrl}wp-json/wp/v2/${type}?slug=${slug}`;
    const cachedTaxonomy = await cache.tryGet(taxonomyUrl, async () => {
        const taxonomyData = await ofetch(taxonomyUrl);
        if (!taxonomyData[0] || !taxonomyData[0].id || !taxonomyData[0].name) {
            throw new Error(`${type} ${slug} not found`);
        }
        return { id: taxonomyData[0].id, name: taxonomyData[0].name };
    });
    return cachedTaxonomy;
};

const fetchCategory = async (categorySlug: string) => await fetchTaxonomy(categorySlug, 'categories');
const fetchTag = async (tagSlug: string) => await fetchTaxonomy(tagSlug, 'tags');

async function fetchNewsItems(apiUrl: string) {
    const data = await ofetch(apiUrl);

    return data.map((item) => ({
        title: item.title.rendered,
        description: item.content.rendered,
        link: item.link,
        pubDate: item.date_gmt && Number.isFinite(parseDate(item.date_gmt, 'YYYY-MM-DDTHH:mm:ss', true).getTime()) ? parseDate(`${item.date_gmt}Z`).toUTCString() : undefined,
        author: item._embedded?.author?.[0]?.name,
        category: item._embedded?.['wp:term']?.flat().map((term) => term.name),
    }));
}

async function fetchArchive(slug: string, type: 'categories' | 'tags') {
    try {
        const { id, name } = await fetchTaxonomy(slug, type);
        return { name, items: await fetchNewsItems(`${rootUrl}wp-json/wp/v2/posts?_embed&${type}=${id}`) };
    } catch (error) {
        if (!(error instanceof FetchError) || error.response?.status !== 403) {
            throw error;
        }
    }

    const feedUrl = `${rootUrl}${type === 'categories' ? 'category' : 'tag'}/${encodeURIComponent(slug)}/feed/`;
    const feed = await parser.parseString(await ofetch<string, 'text'>(feedUrl, { responseType: 'text' }));
    if (feed.feedUrl?.replace(/\/$/, '') !== feedUrl.replace(/\/$/, '')) {
        throw new Error(`The ${type} feed does not match ${slug}`);
    }

    // WordPress's posts API returns ten entries by default.
    const items = await pMap(
        feed.items.slice(0, 10),
        async (item): Promise<DataItem> => {
            if (!item.title || !item.link) {
                throw new Error('The archive feed contains an article without a title or link');
            }
            const description = await cache.tryGet(item.link, async () => {
                const articleContent = await ofetch<string, 'text'>(item.link!, { responseType: 'text' });
                const $ = load(articleContent);
                const content = $('.entry-content');
                if (!content.length) {
                    throw new Error(`Article content is unavailable: ${item.link}`);
                }
                content.find('div[style*="overflow:hidden"]').remove();
                return content.html() ?? undefined;
            });
            return {
                title: item.title,
                link: item.link,
                description,
                author: item.creator || item.author,
                pubDate: item.pubDate ? parseDate(item.pubDate) : undefined,
                category: item.categories,
            };
        },
        { concurrency: 3 }
    );
    return { name: feed.title?.replace(/\s*[–-]\s*异次元软件世界$/, ''), items };
}

export { fetchArchive, fetchCategory, fetchNewsItems, fetchTag };
