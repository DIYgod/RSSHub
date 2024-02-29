module.exports = function (router) {
    router.get('/activity/:category?/:language?/:latestAdditions?/:latestEdits?/:latestAlerts?/:latestPictures?', './activity');
    router.get('/:category?/:language?', './index');
};
