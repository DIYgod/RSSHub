module.exports = (router) => {
    router.get('/jwc/:category?', require('./jwc'));
};
