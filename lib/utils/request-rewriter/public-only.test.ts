import '@/utils/request-rewriter';

import type dns from 'node:dns';
import { once } from 'node:events';
import http from 'node:http';
import type { AddressInfo } from 'node:net';

import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { config } from '@/config';
import got from '@/utils/got';
import ofetch from '@/utils/ofetch';

import { publicLookup, publicOnly } from './public-only';

vi.mock('node:dns', async (importOriginal) => {
    const original = await importOriginal<typeof dns>();
    const lookup = (hostname: string, options: { all?: boolean }, callback: (...args: unknown[]) => void) =>
        hostname === 'fake-ip.test' ? (options.all ? callback(null, [{ address: '198.18.0.5', family: 4 }]) : callback(null, '198.18.0.5', 4)) : original.lookup(hostname, options, callback);
    return { ...original, default: { ...original, lookup }, lookup };
});

const lookup = (hostname: string, all: boolean) =>
    new Promise((resolve, reject) => {
        publicLookup(hostname, { all }, (error, address) => (error ? reject(error) : resolve(address)));
    });

describe('publicLookup', () => {
    it.each(['localhost', '0.0.0.0', '10.0.0.1', '100.64.0.1', '127.0.0.1', '169.254.169.254', '172.16.0.1', '192.168.0.1', '255.255.255.255', '198.18.0.1', '::', '::1', '::ffff:127.0.0.1', 'fd00::1', 'fe80::1'])(
        'refuses %s',
        async (hostname) => {
            await expect(lookup(hostname, false)).rejects.toThrow('non-public address');
            await expect(lookup(hostname, true)).rejects.toThrow('non-public address');
        }
    );

    it('accepts a host name that fake-IP DNS answers', async () => {
        await expect(lookup('fake-ip.test', false)).resolves.toBe('198.18.0.5');
        await expect(lookup('fake-ip.test', true)).resolves.toEqual([expect.objectContaining({ address: '198.18.0.5' })]);
    });

    it.each(['1.1.1.1', '172.32.0.1', '::ffff:1.1.1.1', '2606:4700:4700::1111'])('accepts %s', async (hostname) => {
        await expect(lookup(hostname, false)).resolves.toBe(hostname);
        await expect(lookup(hostname, true)).resolves.toEqual([expect.objectContaining({ address: hostname })]);
    });
});

describe('publicOnly', () => {
    it('checks the origin of every dispatched request', async () => {
        const dispatch = vi.fn(() => true);
        const onResponseError = vi.fn();
        const guarded = publicOnly(dispatch);

        guarded({ origin: 'http://[::1]:8500', path: '/', method: 'GET' }, { onResponseError });
        await vi.waitFor(() => expect(onResponseError).toHaveBeenCalledWith(null, expect.objectContaining({ message: expect.stringContaining('non-public address') })));
        expect(dispatch).not.toHaveBeenCalled();

        guarded({ origin: 'http://1.1.1.1', path: '/', method: 'GET' }, { onResponseError });
        await vi.waitFor(() => expect(dispatch).toHaveBeenCalledTimes(1));
        expect(onResponseError).toHaveBeenCalledTimes(1);
    });
});

describe('ofetch publicOnly', () => {
    const handler = vi.fn((_req: http.IncomingMessage, res: http.ServerResponse) => res.end('internal'));
    const server = http.createServer(handler);
    let port: number;

    beforeAll(async () => {
        await once(server.listen(0, '127.0.0.1'), 'listening');
        port = (server.address() as AddressInfo).port;
    });

    afterEach(() => {
        config.feature.allow_user_supply_unsafe_domain = false;
        handler.mockClear();
    });

    afterAll(() => {
        server.close();
    });

    it.each(['127.0.0.1', 'localhost'])('refuses %s', async (hostname) => {
        await expect(ofetch(`http://${hostname}:${port}/`, { retry: 0, publicOnly: true })).rejects.toThrow('non-public address');
        expect(handler).not.toHaveBeenCalled();
    });

    it('is passed through by got', async () => {
        await expect(got(`http://127.0.0.1:${port}/`, { retry: 0, publicOnly: true })).rejects.toThrow('non-public address');
        expect(handler).not.toHaveBeenCalled();
        await expect(got(`http://127.0.0.1:${port}/`, { retry: 0 })).resolves.toMatchObject({ body: 'internal' });
    });

    it('is off by default', async () => {
        await expect(ofetch(`http://127.0.0.1:${port}/`, { retry: 0 })).resolves.toBe('internal');
    });

    it('is off when ALLOW_USER_SUPPLY_UNSAFE_DOMAIN is enabled', async () => {
        config.feature.allow_user_supply_unsafe_domain = true;
        await expect(ofetch(`http://127.0.0.1:${port}/`, { retry: 0, publicOnly: true })).resolves.toBe('internal');
    });
});
