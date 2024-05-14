import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';

const defaultDomain = 'mp4us.com';

const allowedDomains = new Set(['domp4.cc', 'mp4us.com', 'wemp4.com', 'dbmp4.com']);

/**
 * trackers from https://www.domp4.cc/Style/2020/js/base.js?v=2
 */
const magnetTrackers = [
    'https://tracker.iriseden.fr:443/announce',
    'https://tr.highstar.shop:443/announce',
    'https://tr.fuckbitcoin.xyz:443/announce',
    'https://tr.doogh.club:443/announce',
    'https://tr.burnabyhighstar.com:443/announce',
    'https://t.btcland.xyz:443/announce',
    'http://vps02.net.orel.ru:80/announce',
    'https://tracker.kuroy.me:443/announce',
    'http://tr.cili001.com:8070/announce',
    'http://t.overflow.biz:6969/announce',
    'http://t.nyaatracker.com:80/announce',
    'http://open.acgnxtracker.com:80/announce',
    'http://nyaa.tracker.wf:7777/announce',
    'http://home.yxgz.vip:6969/announce',
    'http://buny.uk:6969/announce',
    'https://tracker.tamersunion.org:443/announce',
    'https://tracker.nanoha.org:443/announce',
    'https://tracker.loligirl.cn:443/announce',
    'udp://bubu.mapfactor.com:6969/announce',
    'http://share.camoe.cn:8080/announce',
    'udp://movies.zsw.ca:6969/announce',
    'udp://ipv4.tracker.harry.lu:80/announce',
    'udp://tracker.sylphix.com:6969/announce',
    'http://95.216.22.207:9001/announce',
];

/**
 * compose magnet url with trackers
 */
function composeMagnetUrl(magnet, trackers = magnetTrackers) {
    return `${magnet}&tr=${trackers.join('&tr=')}`;
}

/**
 * method for download url type
 */
function getUrlType(url) {
    if (url.startsWith('magnet:')) {
        return 'magnet';
    }
    if (url.startsWith('ed2k:')) {
        return 'ed2k';
    }
    return '';
}

/**
 * method for generating magnet url
 * from the detail page source
 */
function decodeCipherText(p, a, c, k, e, d) {
    e = function (c) {
        return (c < a ? '' : e(Number.parseInt(c / a))) + ((c = c % a) > 35 ? String.fromCharCode(c + 29) : c.toString(36));
    };
    if (!''.replace(/^/, String)) {
        while (c--) {
            d[e(c)] = k[c] || e(c);
        }
        k = [
            function (e) {
                return d[e];
            },
        ];
        e = function () {
            return String.raw`\w+`;
        };
        c = 1;
    }
    while (c--) {
        if (k[c]) {
            p = p.replaceAll(new RegExp(String.raw`\b` + e(c) + String.raw`\b`, 'g'), k[c]);
        }
    }
    return p;
}

function ensureDomain(ctx, domain = defaultDomain) {
    const origin = `https://${domain}`;
    if (!config.feature.allow_user_supply_unsafe_domain && !allowedDomains.has(new URL(origin).hostname)) {
        throw new ConfigNotFoundError(`This RSS is disabled unless 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN' is set to 'true'.`);
    }
    return origin;
}

export { defaultDomain, magnetTrackers, getUrlType, composeMagnetUrl, decodeCipherText, ensureDomain };
