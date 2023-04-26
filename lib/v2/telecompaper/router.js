module.exports = (router) => {
    router.get('/news/:caty/:year?/:country?/:type?', require('./news'));
    router.get('/search/:keyword?/:company?/:sort?/:period?', require('./search'));
};
