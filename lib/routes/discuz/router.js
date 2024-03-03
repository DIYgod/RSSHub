export default (router) => {
    router.get('/:ver{[7x]}/:cid{[0-9]{2}}/:link{.+}', './discuz');
    router.get('/:ver{[7x]}/:link{.+}', './discuz');
    router.get('/:link{.+}', './discuz');
};
