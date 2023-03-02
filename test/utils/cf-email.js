const { decodeCFEmail, encodeCFEmail } = require('@/utils/cf-email');

describe('Cloudflare email address obfuscation', () => {
    const email = 'no@thankyou.com';
    const cfEncoded = '650b0a25110d040b0e1c0a104b060a08';

    it('decode email address', () => {
        const decoded = decodeCFEmail(cfEncoded);
        expect(decoded).toBe(email);
    });

    it('enncode email address', () => {
        const encoded = encodeCFEmail(email);
        expect(decodeCFEmail(encoded)).toBe(email);
    });
});
