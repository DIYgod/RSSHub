module.exports = (router) => {
    router.get('/:listId?', require('./index'));
};
