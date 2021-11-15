export default async function (router) {
    router.get('/:region?', (await import('./rss.js')).default)
};
