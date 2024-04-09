module.exports = (router) => {
    router.get('/blog', require('./blog'));
    router.get('/changelog', require('./changelog'));
};
