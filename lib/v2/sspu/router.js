module.exports = (router) => {
    router.get('/jwc/:listId', require('./jwc'));
};
