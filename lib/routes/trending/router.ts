export default (router) => {
    router.get('/:keywords/:numberOfDays?', './all-trending');
};
