export default (router) => {
    router.get('/money18/:id?', './money18');
    router.get('/:language/:channel?', './index');
};
