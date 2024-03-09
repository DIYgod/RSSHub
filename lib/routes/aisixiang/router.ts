export default (router) => {
    router.get('/column/:id', './column');
    router.get('/ranking/:id?/:period?', './toplist');
    router.get('/toplist/:id?/:period?', './toplist');
    router.get('/thinktank/:id/:type?', './thinktank');
    router.get('/zhuanti/:id', './zhuanti');
};
