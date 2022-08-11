module.exports = (router) => {
    router.get('/blog/:username', require('./blog'));
};
