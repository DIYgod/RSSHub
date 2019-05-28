module.exports = function wait(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};
