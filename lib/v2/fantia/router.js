module.exports = (router) => {
    router.get('/search/:type?/:caty?/:period?/:order?/:rating?/:keyword?', require('./search'));
    router.get('/user/:id', require('./user'));
};
