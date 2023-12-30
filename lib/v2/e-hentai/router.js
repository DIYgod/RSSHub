module.exports = function (router) {
    router.get('/:what?/:id?/:needTorrents?/:needImages?', require('./index'));
};
