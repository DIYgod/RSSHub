module.exports = function (router) {
    router.get('/today/:edition?/:tab?', './today');
    router.get('/today/:edition/publisher/:id', './publisher');
};
