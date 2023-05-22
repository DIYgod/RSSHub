module.exports = (router) => {
    router.get('/', require('./index'));
    router.get('/review/:keyword?', require('./review'));
};
