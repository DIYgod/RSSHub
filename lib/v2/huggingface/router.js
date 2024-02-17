module.exports = (router) => {
    router.get('/blog-zh', require('./blog-zh'));
    router.get('/daily-papers', require('./daily-papers'));
};
