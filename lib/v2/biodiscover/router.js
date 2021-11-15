export default async function (router) {
    router.get('/:channel?', (await import('./index.js')).default);
};
