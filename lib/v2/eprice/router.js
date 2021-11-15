export default (router, { createImport }) => {
    const imp = createImport(import.meta.url)
    router.get('/:region?', await imp('./rss.js'));
};
