module.exports = (router) => {
    router.get('/tw/:caty?/:subcaty?', require('./tw/index'));
};
