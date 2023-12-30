module.exports = (router) => {
    router.get('/pair/:source/:target', require('./pair'));
};
