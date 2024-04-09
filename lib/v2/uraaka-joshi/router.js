module.exports = (router) => {
    router.get('/', require('./uraaka-joshi'));
    router.get('/:id', require('./uraaka-joshi-user'));
};
