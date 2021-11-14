import crypto from 'crypto';

export default function md5(date) {
    return crypto.createHash('md5').update(date).digest('hex');
};
