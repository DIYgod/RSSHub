export default (router, { createImport }) => {
    const imp = createImport(import.meta.url)
    router.get('/:category?', await imp('./index.js'));
};
