export default async function (router) {
    router.get('/:id', (await import('./index')).default);
};
