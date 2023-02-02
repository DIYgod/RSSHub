module.exports = (router) => {
    router.get('/posts/:id?', require('./posts'));
};
