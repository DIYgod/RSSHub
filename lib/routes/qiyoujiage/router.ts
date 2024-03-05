export default (router) => {
    router.get('/:path+', './price');
};
