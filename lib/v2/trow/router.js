export default async (router, { createImport }) => {
    const imp = createImport(import.meta.url);
    router.get('/portal', await imp('./portal.js'));
};
