export default async (router, { createImport }) => {
    const imp = createImport(import.meta.url)
    router.get('/:category?', await imp('./index.js'));
};
