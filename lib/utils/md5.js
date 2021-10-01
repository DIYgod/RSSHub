import crypto from 'crypto';

export default (date) => crypto.createHash('md5').update(date).digest('hex');
