export default (router) => {
    router.get('/:journal/latest', './journal'); // deprecated
    router.get('/:journal/vol/:issue', './issue'); // deprecated
    router.get('/:journal', './journal');
    router.get('/:journal/:issue', './issue');
};
