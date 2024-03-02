export default (router) => {
    router.get('/:country/rent/:query?', './list');
};
