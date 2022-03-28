module.exports = (router) => {
    router.get('/jwc/:type', require('./jwc/jwc'));
    router.get('/ceai/:type', require('./ceai/ceai'));
};
