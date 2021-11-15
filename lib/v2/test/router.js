export default async function (router, { createImport }) {
    const imp = createImport(import.meta.url);
    router.get('/:id', await imp('./index.js'));
};