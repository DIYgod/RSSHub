export default (router) => {
    // 江苏海洋大学通知公告
    router.get('/tzgg', './home');
    // 江苏海洋大学研招网通知公告
    router.get('/yztzgg', './yz');
};
