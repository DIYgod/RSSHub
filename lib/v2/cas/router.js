module.exports = (router) => {
    router.get('/cg/:caty?', require('./cg/index'));
    router.get('/ia/yjs', require('./ia/yjs'));
    router.get('/iee/kydt', require('./iee/kydt'));
    router.get('/is/:path+', require('./is/index'));
    router.get('/mesalab/kb', require('./mesalab/kb'));
    router.get('/sim/kyjz', require('./sim/kyjz'));
};
