module.exports = (router) => {
    router.get('/jwc/:type', require('./jwc'));
    router.get('/portal/:type', require('./portal'));
    router.get('/www/:type', require('./www'));
};
