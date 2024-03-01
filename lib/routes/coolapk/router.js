export default (router) => {
    router.get('/dyh/:dyhId', './dyh');
    router.get('/huati/:tag', './huati');
    router.get('/hot/:type?/:period?', './hot');
    router.get('/toutiao/:type?', './toutiao');
    router.get('/tuwen/:type?', './tuwen');
    router.get('/tuwen-xinxian', './tuwen');
    router.get('/user/:uid/dynamic', './user-dynamic');
};
