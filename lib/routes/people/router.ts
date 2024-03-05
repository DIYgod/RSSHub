export default (router) => {
    router.get('/liuyan/:id/:state?', './liuyan');
    router.get('/xjpjh/:keyword?/:year?', './xjpjh');
    router.get('/:site?/:category*', './');
};
