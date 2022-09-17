module.exports = (router) => {
    router.get('/article', require('./article'));
    router.get('/month', require('./month'));
    router.get('/ranking/:type?', require('./ranking'));
};
