import ofetch from '@/utils/ofetch';
import cache from '@/utils/cache';

const rootUrl = 'https://www.landiannews.com/';

const fetchTaxonomy = async (ids: number[], type: 'categories' | 'tags') => {
    if (!ids || ids.length === 0) {
        return [];
    }

    const taxonomies = await Promise.all(
        ids.map(async (id) => {
            const taxonomyUrl = `${rootUrl}wp-json/wp/v2/${type}/${id}`;
            const cachedTaxonomy = await cache.tryGet(taxonomyUrl, async () => {
                const taxonomyData = await ofetch(taxonomyUrl);
                return taxonomyData.name;
            });
            return cachedTaxonomy;
        })
    );
    return taxonomies;
};

const fetchCategory = (categoryIds: number[]) => fetchTaxonomy(categoryIds, 'categories');
const fetchTag = (tagIds: number[]) => fetchTaxonomy(tagIds, 'tags');

async function fetchNewsItems(ApiUrl: string) {
    const data = await ofetch(ApiUrl);

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
