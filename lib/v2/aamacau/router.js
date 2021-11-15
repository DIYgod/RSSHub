export default async (router, { createImport }) => {
    const imp = createImport(import.meta.url)
    router.get('/:category?/:id?', await imp('./index.js'));
};
