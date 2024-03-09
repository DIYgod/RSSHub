export default (router) => {
    router.get('/user/sheets/:username/:iso?/:freeOnly?', './usersheets');
};
