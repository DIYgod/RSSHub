export default async function (router) {
    router.get('/live/:id', (await import('./live.js')).default);
};
