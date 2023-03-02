module.exports = (router) => {
    router.get('/blog/:lang?', require('./blog.js'));
    router.get('/bulletin/:lang?', require('./bulletin.js'));
    router.get('/report/:lang?', require('./report.js'));
};
