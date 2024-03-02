export default (router) => {
    router.get('/:pub/:jrn', './journal');
    // router.get('/:pub/:jrn', './journal-pupp'); // Switch to this route if the official website blocks the "got" method.
};
