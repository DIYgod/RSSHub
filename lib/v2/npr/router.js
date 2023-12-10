module.exports = (router) => {
    router.get('/:endpoint?', require('./full'));
};
