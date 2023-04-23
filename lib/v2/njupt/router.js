module.exports = (router) => {
    router.get('/jwc/:type?', require('./jwc'));
    router.get('/yzb/:type', require('./yzb'));
};
