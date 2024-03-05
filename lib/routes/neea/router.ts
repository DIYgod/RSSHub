export default (router) => {
    router.get('/jlpt', './jlpt');
    router.get('/:type?', './index');
};
