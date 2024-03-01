module.exports = (router) => {
    router.get('/database/:databaseId', require('./database'));
};
