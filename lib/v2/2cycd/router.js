module.exports = (router) => {
    router.get('/:fid/:sort?', require('./index'));
};
