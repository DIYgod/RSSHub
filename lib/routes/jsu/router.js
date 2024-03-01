export default (router) => {
    // 创新中心
    router.get('/cxzx/:types?', './cxzx');
    router.get('/jwc/:types?', './jwc');
    router.get('/notice', './universityindex');
    router.get('/rjxy', './rjxy');
    router.get('/stxy', './math');
};
