import sanitizeHtml from 'sanitize-html';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

const rootUrl = 'https://www.landiannews.com/';

const getRenderedText = (html: string) => sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} });

const getPubDate = (dateGmt?: string, date?: string) => (dateGmt ? parseDateInTimezone(dateGmt, 0) : date ? parseDateInTimezone(date, 8) : undefined);

const fetchTaxonomy = async (slug: string, type: 'categories' | 'tags') => {
    const url = new URL(`wp-json/wp/v2/${type}`, rootUrl);
    url.searchParams.set('slug', slug);
    const taxonomyUrl = url.href;
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
        title: getRenderedText(item.title.rendered),
        description: item.content.rendered,
        link: item.link,
        pubDate: getPubDate(item.date_gmt, item.date),
        author: item._embedded?.author?.[0]?.name,
        category: item._embedded?.['wp:term']
            ?.flat()
            .filter(Boolean)
            .map((term) => term.name),
    }));
}

export { fetchCategory, fetchNewsItems, fetchTag };
