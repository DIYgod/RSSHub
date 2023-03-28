module.exports = (router) => {
    router.get('/projects/:category?', require('./projects'));
};
