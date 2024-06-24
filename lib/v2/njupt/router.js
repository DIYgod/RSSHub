module.exports = (router) => {
    router.get('/jwc/:type?', require('./jwc'));
    router.get('/yzb-main', require('./yzb-main'));
};
