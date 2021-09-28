import crypto from 'crypto';

export default (date) => {
    return crypto.createHash('md5').update(date).digest('hex');
};
