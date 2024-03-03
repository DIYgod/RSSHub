export default (router) => {
    router.get('/news/:caty/:year?/:country?/:type?', './news');
    router.get('/search/:keyword?/:company?/:sort?/:period?', './search');
};
