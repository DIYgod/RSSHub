export default (router) => {
    router.get('/jwc/:type', './jwc/jwc');
    router.get('/ceai/:type', './ceai/ceai');
};
