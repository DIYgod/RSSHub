export default (router) => {
    router.get('/search/:type?/:caty?/:period?/:order?/:rating?/:keyword?', './search');
    router.get('/user/:id', './user');
};
