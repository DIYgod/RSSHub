module.exports = (router) => {
    // 南京晓庄学院官网通知公告
    router.get('/tzgg', require('./home'));
    // 南京晓庄学院图书馆通知公告
    router.get('/lib_tzgg', require('./lib'));
    // 南京晓庄学院教务处通知通告
    router.get('/jwc_tzgg', require('./jwc'));
};
