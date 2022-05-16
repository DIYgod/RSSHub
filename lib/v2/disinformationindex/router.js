module.exports = (router) => {
    router.get('/blog', require('./blog'));
    router.get('/research', require('./research'));
};
