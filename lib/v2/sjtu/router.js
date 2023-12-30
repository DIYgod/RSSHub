module.exports = function (router) {
    router.get('/gs/:type/:num?', require('./gs'));
    router.get('/jwc/:type?', require('./jwc'));
    router.get('/seiee/academic', require('./seiee/academic'));
    router.get('/seiee/bjwb/:type', require('./seiee/bjwb'));
    router.get('/seiee/xsb/:type?', require('./seiee/xsb'));
    router.get('/tongqu/:type?', require('./tongqu/activity'));
    router.get('/yzb/zkxx/:type', require('./yzb/zkxx'));
};
