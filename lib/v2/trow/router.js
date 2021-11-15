export default async function (router) {
    router.get('/portal', (await import('./portal.js')).default);
};
