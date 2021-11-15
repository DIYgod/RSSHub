export default async function (router) {
    router.get('/:type', (await import('./index.js')).default);
};
