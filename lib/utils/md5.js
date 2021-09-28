import crypto from 'crypto';

export function md5(date) {
    return crypto.createHash('md5').update(date).digest('hex');
};
