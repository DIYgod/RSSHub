export default async function (router) {
    router.get('/:do?/:keyword?', (await import('./index.js')).default);
};
