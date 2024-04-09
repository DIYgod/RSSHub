module.exports = (router) => {
    router.get('/article/:uid', require('./article'));
    router.get('/baoliao/:uid', require('./baoliao'));
    router.get('/haowen/:day?', require('./haowen'));
    router.get('/haowen/fenlei/:name/:sort?', require('./haowen_fenlei'));
    router.get('/keyword/:keyword', require('./keyword'));
    router.get('/ranking/:rank_type/:rank_id/:hour', require('./ranking'));
};
