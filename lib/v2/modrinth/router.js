module.exports = (router) => {
    router.get('/project/:id/versions', require('./versions'));
};
