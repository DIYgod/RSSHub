module.exports = (router) => {
    router.get('/jwc/:listId', './jwc');
    router.get('/pe/:id?', './pe');
};
