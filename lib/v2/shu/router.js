module.exports = (router) => {
    router.get('/:type?', require('./index'));
    router.get('/jwc/:type?', require('./jwb')); // TODO: deprecated, remove this line when someone update this file next time
    router.get('/jwb/:type?', require('./jwb'));
};
