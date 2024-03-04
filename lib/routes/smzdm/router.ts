export default (router) => {
    router.get('/article/:uid', './article');
    router.get('/baoliao/:uid', './baoliao');
    router.get('/haowen/:day?', './haowen');
    router.get('/haowen/fenlei/:name/:sort?', './haowen-fenlei');
    router.get('/keyword/:keyword', './keyword');
    router.get('/ranking/:rank_type/:rank_id/:hour', './ranking');
};
