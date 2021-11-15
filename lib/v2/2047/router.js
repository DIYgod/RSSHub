export default async function (router) {
    router.get('/:category?/:sort?', (await import('./index.js')).default);
};
