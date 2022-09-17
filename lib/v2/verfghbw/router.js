module.exports = (router) => {
    router.get('/press/:keyword?', require('./press'));
};
