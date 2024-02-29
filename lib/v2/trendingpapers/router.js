module.exports = (router) => {
    router.get('/papers/:category?/:time?/:cited?', require('./papers.js'));
};
