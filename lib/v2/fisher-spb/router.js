export default async function (router) {
    router.get('/news', (await import('./news.js')).default);
};
