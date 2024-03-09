export default (router) => {
    router.get('/calendar/:before?/:after?', './index');
};
