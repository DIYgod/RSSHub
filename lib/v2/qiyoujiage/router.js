module.exports = (router) => {
    router.get('/:path+', './price');
};
