export default (router) => {
    router.get('/:language?/:channel?/:subChannel?', './index');
};
