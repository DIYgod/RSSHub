export default async (router, { createImport }) => {
    const imp = createImport(import.meta.url)
    router.get('/discount/:platform/:filter?/:countries?', await imp('./discount.js'));
};
