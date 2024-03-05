export default (router) => {
    router.get('/cover', './cover');
    router.get('/highlight/:journal?', './highlight');
    router.get('/news', './news');
    router.get('/news-and-comment/:journal?', './news-and-comment');
    router.get('/research/:journal?', './research');
    router.get('/siteindex', './siteindex');
};
