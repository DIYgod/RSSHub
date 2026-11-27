import { X509Certificate } from 'node:crypto';
import tls from 'node:tls';

import { Agent } from 'undici';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

const host = 'www.nanshanmuseum.com';
const agentOptions = { allowH2: false, maxRequestsPerClient: 1, maxCachedSessions: 0 };

let dispatcherPromise: Promise<Agent> | undefined;

const getLeafCert = (): Promise<X509Certificate | undefined> =>
    new Promise((resolve, reject) => {
        const socket = tls.connect({ host, port: 443, servername: host, rejectUnauthorized: false, timeout: 10000 }, () => {
            const peer = socket.getPeerCertificate(false);
            const cert = !socket.authorized && peer?.raw ? new X509Certificate(peer.raw) : undefined;
            socket.destroy();
            resolve(cert);
        });
        socket.on('timeout', () => socket.destroy(new Error(`TLS probe timed out for ${host}`)));
        socket.on('error', reject);
    });

const buildDispatcher = async (): Promise<Agent> => {
    try {
        const cert = await getLeafCert();
        const aiaUrl = cert?.infoAccess?.match(/CA Issuers - URI:(https?:\/\/\S+)/i)?.[1];
        const ca = aiaUrl
            ? await cache.tryGet(`nanshanmuseum:aia:${aiaUrl}`, async () => {
                  const buf = await ofetch<ArrayBuffer, 'arrayBuffer'>(aiaUrl, { responseType: 'arrayBuffer' });
                  return new X509Certificate(Buffer.from(buf)).toString();
              })
            : undefined;

        return new Agent(ca ? { ...agentOptions, connect: { ca: [...tls.rootCertificates, ca] } } : agentOptions);
    } catch (error) {
        dispatcherPromise = undefined;
        throw error;
    }
};

export const getDispatcher = (): Promise<Agent> => (dispatcherPromise ??= buildDispatcher());
