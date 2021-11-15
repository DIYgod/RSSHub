export default async function (router) {
    router.get('/:category?/:id?', (await import('./index.js')).default);
};
