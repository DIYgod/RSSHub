export default async (router, {createImport}) => {
    const imp = createImport(import.meta.url)
    router.get('/news/:lang?', await imp('./news.js'));
};
