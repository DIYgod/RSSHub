module.exports = (router) => {
    router.get('/blog/:category*', require('./blog'));
};
