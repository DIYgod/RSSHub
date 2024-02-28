module.exports = (router) => {
    router.get('/:keywords/:numberOfDays?', './all-trending');
};
