export default async (router, { createImport }) => {
    const imp = createImport(import.meta.url);
    router.get('/:collection', await imp('./index.js'));
};
