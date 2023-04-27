module.exports = (router) => {
    router.get('/jwc/:category?', require('./jwc'));
    router.get('/gr/:type', require('./gr'));
};
