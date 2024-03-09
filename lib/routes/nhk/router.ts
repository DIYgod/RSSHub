export default (router) => {
    router.get('/news/:lang?', './news');
    router.get('/news_web_easy', './news-web-easy');
};
