module.exports = (router) => {
    router.get('/papers/:category?/:time?/:cited?', './papers.js');
};
