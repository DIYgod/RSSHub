export default async function (router) {
    router.get('/ps5-stock-uk', (await import('./ps5-stock-uk.js)')).default);
};
