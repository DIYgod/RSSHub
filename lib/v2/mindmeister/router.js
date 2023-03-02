module.exports = (router) => {
    router.get('/:category?/:language?', require('./example'));
};
