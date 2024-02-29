module.exports = (router) => {
    router.get('/', './index');
    router.get('/review/:keyword?', './review');
};
