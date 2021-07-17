const { parseDate } = require('@/utils/parse-date');
const got = require('@/utils/got');

const GLOBAL_DATA_REGEXP = /window\.appData = JSON\.parse\(decodeURIComponent\("(.+)"\)\);/;
const PUBLISHED_ARTICLE_STATUS = 1;

const fetchData = (url) => got({ url, method: 'get' });

module.exports = async (ctx) => {
    const { name, book } = ctx.params;
    const baseUrl = 'https://www.yuque.com';
    const bookUrl = `${baseUrl}/${name}/${book}`;
    const articleUrl = (articleSlug, bookId) => `${baseUrl}/api/docs/${articleSlug}?book_id=${bookId}`;
    const result = {
        title: bookUrl,
        link: bookUrl,
        description: '',
        item: [],
    };

    const { data: bookHtml } = await fetchData(bookUrl);
    const bookResult = bookHtml.match(GLOBAL_DATA_REGEXP);
    const globalData = JSON.parse(decodeURIComponent(bookResult[1]));
    const { group: { name: author }, book: { id: bookId, name: bookName, namespace, description, docs } } = globalData;

    result.title = `${author}/${bookName} · 语雀`;
    result.description = description;

    const publicDocs = docs.filter(({ status }) => status === PUBLISHED_ARTICLE_STATUS);
    result.item = await Promise.all(
        publicDocs.map(async (doc) => {
            const item = {
                title: doc.title,
                description: doc.description,
                pubDate: parseDate(doc.published_at, 'YYYY/MM/DD'),
                link: `${baseUrl}/${namespace}/${doc.slug}`,
                author,
            };
            const docKey = `yuque${doc.id}`;
            const cachedDocDescription = await ctx.cache.get(docKey);
            if (cachedDocDescription) {
                item.description = cachedDocDescription;
                return item;
            }
            const { data: { data: docDetail } } = await fetchData(articleUrl(doc.slug, bookId));
            item.description = docDetail.content;
            item.author = docDetail.user.name;
            ctx.cache.set(docKey, item.description);
            return item;
        })
    );
    return ctx.state.data = result;
};
