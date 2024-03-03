export default (router) => {
    router.get('/popular/:range?', './popular');
    router.get('/user_article/:id', './user-article');
    router.get('/wen', './wen');
};
