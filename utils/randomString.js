module.exports = function randomString(
    length = 16,
    charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
    const result = [];

    while (length--) {
        result.push(charSet[Math.floor(Math.random() * charSet.length)]);
    }
    return result.join('');
}
