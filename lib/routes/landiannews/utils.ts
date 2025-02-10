import ofetch from '@/utils/ofetch';
import cache from '@/utils/cache';

const rootUrl = 'https://www.landiannews.com/';

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
        pubDate: new Date(item.date).toUTCString(),
        author: item._embedded.author[0].name,
        category: item._embedded['wp:term'].flat().map((term) => term.name),
    }));
}

export { fetchCategory, fetchTag, fetchNewsItems };
