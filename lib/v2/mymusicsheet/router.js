module.exports = (router) => {
    router.get('/user/sheets/:username/:iso?/:isSheetFree?', require('./usersheets'));
};
