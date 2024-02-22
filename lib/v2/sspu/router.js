module.exports = (router) => {
    router.get('/jwc/:listId', require('./jwc'));
    router.get('/pe/:id?', require('./pe'));
};
