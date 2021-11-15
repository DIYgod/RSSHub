export default async function (router, { createImport }) {
    const imp = createImport(import.meta.url);
    router.get('/characters/:lang?', await imp('./index.js'));
    router.get('/artists/:lang?', await imp('./artists.js'));
    router.get('/archive/:lang?', await imp('./archive.js'));
};
