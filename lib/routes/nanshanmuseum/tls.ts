import { X509Certificate } from 'node:crypto';
import tls from 'node:tls';

import { Agent } from 'undici';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

// www.nanshanmuseum.com omits its intermediate CA (CNSSL DV TLS G2 R36 CA, signed by Certum Trusted Root CA, valid until 2036)
// during the TLS handshake, causing UNABLE_TO_VERIFY_LEAF_SIGNATURE in Node.js.
const intermediateCaUrl = 'http://cnssldvtlsg2r36ca.repository.certum.pl/cnssldvtlsg2r36ca.cer';
const agentOptions = { allowH2: false, maxRequestsPerClient: 1, maxCachedSessions: 0 };

let dispatcherPromise: Promise<Agent> | undefined;

// The intermediate is fetched over plain HTTP, so only trust it if it is a CA certificate signed by a root Node.js already trusts.
const assertTrustedIntermediate = (pem: string) => {
    const cert = new X509Certificate(pem);
    const issuedByTrustedRoot = tls.rootCertificates.some((rootPem) => {
        const root = new X509Certificate(rootPem);
        return cert.checkIssued(root) && cert.verify(root.publicKey);
    });
    if (!cert.ca || !issuedByTrustedRoot) {
        throw new Error(`Untrusted intermediate CA from ${intermediateCaUrl}`);
    }
};

const buildDispatcher = async (): Promise<Agent> => {
    try {
        const ca = await cache.tryGet(`nanshanmuseum:aia:${intermediateCaUrl}`, async () => {
            const buf = await ofetch<ArrayBuffer, 'arrayBuffer'>(intermediateCaUrl, { responseType: 'arrayBuffer' });
            return new X509Certificate(Buffer.from(buf)).toString();
        });
        assertTrustedIntermediate(ca);
        return new Agent({ ...agentOptions, connect: { ca: [...tls.rootCertificates, ca] } });
    } catch (error) {
        dispatcherPromise = undefined;
        throw error;
    }
};

export const getDispatcher = (): Promise<Agent> => (dispatcherPromise ??= buildDispatcher());
