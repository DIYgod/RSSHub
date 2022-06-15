module.exports = function (router) {
    router.get('/:journal/latest/vol/:sortType?', require('./journal'));
    router.get('/:journal/latest/date/:sortType?', require('./recent'));
    router.get('/journal/:journal/:sortType?', require('./journal'));
    router.get('/journal/:journal/recent/:sortType?', require('./recent'));    
};
