module.exports = function (router) {
    router.get('/jtys/yjs', require('./jtys/yjs'));
    router.get('/jyzpxx', require('./jyzpxx'));
    router.get('/jwc', require('./jwc'));
    router.get('/xg/:code?', require('./xg'));
};
