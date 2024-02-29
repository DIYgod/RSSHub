module.exports = function (router) {
    router.get('/:language?/:keyword?', './index');
};
