module.exports = function (router) {
    router.get('/activity/:category?/:language?/:latestAdditions?/:latestEdits?/:latestAlerts?/:latestPictures?', require('./activity'));
    router.get('/:category?/:language?', require('./index'));
};
