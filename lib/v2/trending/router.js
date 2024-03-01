module.exports = (router) => {
    router.get('/:keywords/:numberOfDays?', require('./all-trending'));
};
