module.exports = (router) => {
    router.get('/jobs', require('./jobs'));
    router.get('/posts/:id?', require('./posts'));
};
