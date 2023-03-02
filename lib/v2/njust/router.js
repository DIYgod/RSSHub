module.exports = function (router) {
    router.get('/cwc/:type?', require('./cwc'));
    router.get('/dgxg/:type?', require('./dgxg'));
    router.get('/eo/:grade?/:type?', require('./eo'));
    router.get('/eoe/:type?', require('./eoe'));
    router.get('/gs/:type?', require('./gs'));
    router.get('/jwc/:type?', require('./jwc'));
};
