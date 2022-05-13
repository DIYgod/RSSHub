module.exports = (router) => {
    router.get('/bookstore/newest', require('./bookstore/newest'));
    router.get('/collection/:id/:getAll?', require('./collection'));
    router.get('/daily', require('./daily'));
    router.get('/daily/section/:sectionId', require('./daily_section'));
    router.get('/hot/:category?', require('./hot'));
    router.get('/hotlist', require('./hotlist'));
    router.get('/people/activities/:id', require('./activities'));
    router.get('/people/answers/:id', require('./answers'));
    router.get('/people/pins/:id', require('./pin/people'));
    router.get('/pin/daily', require('./pin/daily'));
    router.get('/pin/hotlist', require('./pin/hotlist'));
    router.get('/posts/:usertype/:id', require('./posts'));
    router.get('/question/:questionId', require('./question'));
    router.get('/timeline', require('./timeline'));
    router.get('/topic/:topicId', require('./topic'));
    router.get('/weekly', require('./weekly'));
    router.get('/zhuanlan/:id', require('./zhuanlan'));
};
