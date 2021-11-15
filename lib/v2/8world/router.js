export default async function (router) {
    router.get('/:category?', (await import('./index.js')).default);
};
