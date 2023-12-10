module.exports = (router) => {
    router.get('/:level?', require('./level'));
};
