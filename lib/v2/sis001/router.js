module.exports = (router) => {
    router.get('/forum/:id?', require('./forum'));
};
