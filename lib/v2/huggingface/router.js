module.exports = (router) => {
    router.get('/daily-papers', require('./daily-papers'));
    router.get('/blog-zh', require('./blog-zh'));
};
