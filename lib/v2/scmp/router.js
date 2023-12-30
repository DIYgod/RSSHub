module.exports = (router) => {
    router.get('/:category_id', require('./index'));
};
