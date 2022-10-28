module.exports = (router) => {
    router.get('/:section/:type?', require('./section'));
};
