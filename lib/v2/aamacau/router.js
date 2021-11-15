export default (router, { createImport }) => {
    const imp = createImport(import.meta.url)
    router.get('/:category?/:id?', await imp('./index.js'));
};
