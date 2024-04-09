const crypto = require('crypto');

module.exports = function md5(date) {
    return crypto.createHash('md5').update(date).digest('hex');
};
