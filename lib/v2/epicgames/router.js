export default async function (router) {
    router.get('/:collection', (await import('./index.js')).default);
};
