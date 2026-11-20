import { lookup } from 'node:dns';
import type { LookupFunction } from 'node:net';
import { BlockList, isIP, isIPv6 } from 'node:net';

import type { Dispatcher } from 'undici';

// loopback, private, link-local, CGNAT, multicast and reserved ranges, IPv4-mapped IPv6 addresses are matched against the IPv4 ones
const blockList = new BlockList();
for (const [network, prefix] of [
    ['0.0.0.0', 8],
    ['10.0.0.0', 8],
    ['100.64.0.0', 10],
    ['127.0.0.0', 8],
    ['169.254.0.0', 16],
    ['172.16.0.0', 12],
    ['192.0.0.0', 24],
    ['192.168.0.0', 16],
    ['198.18.0.0', 15],
    ['224.0.0.0', 3],
] as const) {
    blockList.addSubnet(network, prefix, 'ipv4');
}
for (const [network, prefix] of [
    ['::', 96],
    ['fc00::', 7],
    ['fe80::', 10],
    ['ff00::', 8],
] as const) {
    blockList.addSubnet(network, prefix, 'ipv6');
}

// fake-IP DNS (Clash, Surge and the like) answers every host name with an address from this range, and the proxy behind it
// connects to the real one, so it only counts as non-public when it is requested directly
const fakeIpList = new BlockList();
fakeIpList.addSubnet('198.18.0.0', 15, 'ipv4');

const isBlocked = (address: string) => blockList.check(address, isIPv6(address) ? 'ipv6' : 'ipv4');
const isFakeIp = (address: string) => fakeIpList.check(address, isIPv6(address) ? 'ipv6' : 'ipv4');

/**
 * `dns.lookup` that fails when the host name resolves to a non-public address.
 * Used as the `lookup` of a connector, so the address which is checked is the one which is connected to.
 */
export const publicLookup: LookupFunction = (hostname, options, callback) =>
    lookup(hostname, options, (error, address, family) => {
        const blocked =
            !error &&
            [address].flat().some((item) => {
                const resolved = typeof item === 'string' ? item : item.address;
                return isBlocked(resolved) && (isIP(hostname) !== 0 || !isFakeIp(resolved));
            });
        callback(blocked ? new Error(`Refused to request ${hostname}: non-public address`) : error, address, family);
    });

/**
 * Runs for every request including redirects.
 * IP literals and proxied requests never reach the `lookup` of the connector, so they are checked here.
 */
export const publicOnly: Dispatcher.DispatcherComposeInterceptor = (dispatch) => (opts, handler) => {
    const { hostname } = new URL(opts.origin!);
    publicLookup(hostname.replaceAll(/^\[|\]$/g, ''), { all: true }, (error) => {
        if (error) {
            handler.onResponseError?.(null as never, error);
        } else {
            dispatch(opts, handler);
        }
    });
    return true;
};
