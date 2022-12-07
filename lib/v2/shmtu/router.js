module.exports = (router) => {
    router.get('/jwc/:type', require('./jwc'));
    router.get('/www/:type', require('./www'));
};
