import { renderCover } from './templates/cover';
import { renderDesc } from './templates/desc';
import { renderEmbed } from './templates/embed';
import { renderIframe } from './templates/iframe';

const templates = {
    desc: renderDesc,
    cover: renderCover,
    embed: renderEmbed,
    iframe: renderIframe,
};

const resolveUrl = (url, tls = true, forceResolve = false) => {
    if (!url) {
        return '';
    }
    if (url.startsWith('//')) {
        return (tls ? 'https:' : 'http:') + url;
    }
    if (forceResolve && !/^https?:\/\//.test(url)) {
        return (tls ? 'https://' : 'http://') + url;
    }
    return url;
};

const proxyVideo = (url, proxy) => {
    if (!(url && proxy)) {
        return url + '';
    }
    if (proxy.includes('?')) {
        if (!proxy.endsWith('=')) {
            proxy += '=';
        }
        return proxy + encodeURIComponent(url);
    } else {
        if (!proxy.endsWith('/')) {
            proxy += '/';
        }
        return proxy + url;
    }
};

const getOriginAvatar = (url) =>
    resolveUrl(url)
        .replace(/^(.*\.douyinpic\.com\/).*(\/aweme-avatar\/)([^?]*)(\?.*)?$/, '$1origin$2$3')
        .replaceAll(/~\w+_\d+x\d+/g, '');

export { getOriginAvatar, proxyVideo, resolveUrl, templates };
