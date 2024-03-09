export default (router) => {
    router.get('/', './index');
    router.get('/cat/:cat', './cat');
    router.get('/today', './today');
};
