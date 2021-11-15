export default async function (router) {
    router.get('/discount/:platform/:filter?/:countries?', (await import('./discount.js')).default);
};
