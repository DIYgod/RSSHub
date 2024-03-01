module.exports = (router) => {
    router.get('/:province?', require('./province'));
};
