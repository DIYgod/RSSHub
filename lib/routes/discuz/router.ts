export default (router) => {
    router.get('/:ver([7|x])/:cid([0-9]{2})/:link(.*)', './discuz');
    router.get('/:ver([7|x])/:link(.*)', './discuz');
    router.get('/:link(.*)', './discuz');
};
