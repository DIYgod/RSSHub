module.exports = (router) => {
    router.get('/:field', require('./publication'));
};
