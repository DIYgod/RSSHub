module.exports = (router) => {
    router.get('/dyh/:dyhId', require('./dyh'));
    router.get('/huati/:tag', require('./huati'));
    router.get('/hot/:type?/:period?', require('./hot'));
    router.get('/toutiao/:type?', require('./toutiao'));
    router.get('/tuwen/:type?', require('./tuwen'));
    router.get('/tuwen-xinxian', require('./tuwen'));
    router.get('/user/:uid/dynamic', require('./userDynamic'));
};
