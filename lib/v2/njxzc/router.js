module.exports = (router) => {
    // 南京晓庄学院图书馆通知公告
    router.get('/libtzgg', require('./lib'));
    // 南京晓庄学院通知公告
    router.get('/tzgg', require('./home'));
};
