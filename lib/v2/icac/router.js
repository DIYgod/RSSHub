export default function (router) {
    router.get('/news/:lang?', (await import('./news.js')).default);
};
