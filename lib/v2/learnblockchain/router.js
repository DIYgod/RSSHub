module.exports = (router) => {
    router.get('/posts/:cid/:sort?', require('./posts'));
};
