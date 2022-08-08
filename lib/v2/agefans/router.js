module.exports = (router) => {
    router.get('/detail/:id', require('./detail'));
    router.get('/update', require('./update'));
};
