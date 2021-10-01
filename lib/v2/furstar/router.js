export default async function (router) {
    router.get('/characters/:lang?', (await import('./index.js')).default);
    router.get('/artists/:lang?', (await import('./artists.js')).default);
    router.get('/archive/:lang?', (await import('./archive.js')).default);
};
