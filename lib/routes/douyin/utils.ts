import path from 'node:path';

const templates = {
    desc: path.join(__dirname, 'templates/desc.art'),
    cover: path.join(__dirname, 'templates/cover.art'),
    embed: path.join(__dirname, 'templates/embed.art'),
    iframe: path.join(__dirname, 'templates/iframe.art'),
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
