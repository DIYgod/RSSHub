module.exports = (router) => {
    router.get('/jwc/:type?', require('./jwc'));
};
