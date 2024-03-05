export default (router) => {
    router.get('/dh/:language?', './dh');
    router.get('/chp/:category?/:language?', './chp');
};
