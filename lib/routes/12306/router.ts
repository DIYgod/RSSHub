export default (router) => {
    router.get('/:date/:from/:to/:type?', './index');
    router.get('/zxdt/:id?', './zxdt');
};
