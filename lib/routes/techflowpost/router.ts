export default (router) => {
    router.get('/express', './express');
    router.get('/newsflash', './express');
    router.get('/', './index');
};
