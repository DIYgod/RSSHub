module.exports = (router) => {
    router.get('/detail/:id', './detail');
    router.get('/update', './update');
};
