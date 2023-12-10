module.exports = (router) => {
    router.get('/user/sheets/:username/:iso?/:freeOnly?', require('./usersheets'));
};
