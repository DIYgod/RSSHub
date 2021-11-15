export default async (router, { createImport }) => {
    const imp = createImport(import.meta.url)
    router.get('/:region?', await imp('./rss.js'));
};
