module.exports = (router) => {
    router.get('/', './index');
    router.get('/discussed', './discussed');
    router.get('/upvoted', './upvoted');
};
