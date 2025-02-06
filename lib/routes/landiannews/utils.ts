import ofetch from '@/utils/ofetch';
import cache from '@/utils/cache';

const rootUrl = 'https://www.landiannews.com/';
const authorApiUrl = `${rootUrl}wp-json/wp/v2/users/`;

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

    const fetchAuthor = async (authorId: number) => {
        const authorUrl = `${authorApiUrl}${authorId}`;
        const cachedAuthor = await cache.tryGet(authorUrl, async () => {
            const authorData = await ofetch(authorUrl);
            return {
                name: authorData.name,
                url: authorData.link,
                avatar: authorData.avatar_urls[2],
            };
        });
        return [cachedAuthor];
    };

    return await Promise.all(
        data.map(async (item: any) => ({
            title: item.title.rendered,
            description: item.content.rendered,
            link: item.link,
            pubDate: new Date(item.date).toUTCString(),
            author: await fetchAuthor(item.author),
            category: [...(await fetchCategory(item.categories || [])), ...(await fetchTag(item.tags || []))],
        }))
    );
}

export { fetchCategory, fetchTag, fetchNewsItems };
