module.exports = (router) => {
    router.get('/:ver([7|x])/:cid([0-9]{2})/:link(.*)', require('./discuz'));
    router.get('/:ver([7|x])/:link(.*)', require('./discuz'));
    router.get('/:link(.*)', require('./discuz'));
};
