export default (router) => {
    router.get('/jwc/:category?', './jwc/notice');
    router.get('/jxjy/news', './e/news');
    router.get('/yjs', './gschool/yjs');
};
