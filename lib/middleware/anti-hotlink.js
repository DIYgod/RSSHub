/**
 * Apply anti-hotlink workarounds to the HTML.
 * Previously a middleware, but now become a part of `parameter` to improve performance.
 */

const config = require('@/config').value;
const cheerio = require('cheerio');
const logger = require('@/utils/logger');
const path = require('path');
const { art } = require('@/utils/render');

const templateRegex = /\$\{([^{}]+)}/g;
const allowedUrlProperties = new Set();
[
    // https://user:pass@example.org:80/foo/bar?baz#qux
    'protocol', // https:
    'username', // user
    'password', // pass
    'hostname', // example.org
    'port', // 80
    'pathname', // /foo/bar
    'search', // ?baz
    'hash', // #qux
    'host', // example.org:80
    'origin', // https://example.org:80
    'href', // https://user:pass@example.org:80/foo/bar?baz#qux
    // 'searchParams',  // use `search` instead
].forEach((prop) => {
    allowedUrlProperties.add(prop);
    allowedUrlProperties.add(`${prop}_ue`);
});
// max possible usage: ${protocol}//${username}:${password}@${hostname}:${port}${pathname}${search}${hash} => 8
// (why not `${host}`?)
// possible usage: ${protocol}//${username}:${password}@${host}${pathname}${search}${hash} => 7
// possible usage: ${protocol}//${username}:${password}@${host}${pathname}${search} => 6
// (`${hash}` is not necessary needed, so above usages are covered by `${href}`)
// acceptable usage: ${username}:${password}@${host}${pathname}${search} => 5
// acceptable usage: ${protocol}//${host}${pathname}${search}${hash} => 5
// acceptable usage: ${protocol}//${host}${pathname}${search} => 4
// acceptable usage: ${origin}${pathname}${search} => 3
// reasonable usage: ${host}${pathname}${search} => 3
// reasonable usage: ${host}${pathname} => 2
// reasonable usage: ${href} => 1
const maxProperties = 5;

const IframeWrapperTemplate = path.join(__dirname, 'templates/iframe.art');

// match path or sub-path
const matchPath = (path, paths) => {
    for (const p of paths) {
        if (path.startsWith(p) && (path.length === p.length || path[p.length] === '/')) {
            return true;
        }
    }
    return false;
};

// return ture if the path needs to be processed
const filterPath = (path) => {
    const include = config.hotlink.includePaths;
    const exclude = config.hotlink.excludePaths;
    return !(include && !matchPath(path, include)) && !(exclude && matchPath(path, exclude));
};

const interpolate = (str, obj) =>
    str.replace(templateRegex, (_, prop) => {
        let needEncode = false;
        if (prop.endsWith('_ue')) {
            // url encode
            prop = prop.slice(0, -3);
            needEncode = true;
        }
        return needEncode ? encodeURIComponent(obj[prop]) : obj[prop];
    });
const parseUrl = (str) => {
    let url;
    try {
        url = new URL(str);
    } catch (e) {
        logger.error(`Failed to parse ${str}`);
    }

    return url;
};
const replaceUrls = ($, selector, template, attribute = 'src') => {
    $(selector).each(function () {
        const old_src = $(this).attr(attribute);
        if (old_src) {
            const url = parseUrl(old_src);
            if (url) {
                // XSS? It is NOT an XS "S" (Cross-site "scripting") issue since affected attributes of affected tags
                // are UNABLE to execute ANY script.
                // Untrusted URL redirection? No attack surface here since it is the USER who fill in the template and
                // TRUST it.
                $(this).attr(attribute, interpolate(template, url));
            }
        }
    });
};

const wrapWithIframe = ($, selector) => {
    $(selector).each((_, elem) => {
        elem = $(elem);
        elem.replaceWith(art(IframeWrapperTemplate, { content: elem.toString() }));
    });
};

const processHtml = ($, { image_hotlink_template, multimedia_hotlink_template, wrap_multimedia_in_iframe }) => {
    if (typeof $ === 'string') {
        $ = cheerio.load($, undefined, false);
    }
    if (image_hotlink_template) {
        replaceUrls($, 'img, picture > source', image_hotlink_template);
        replaceUrls($, 'video[poster]', image_hotlink_template, 'poster');
    }
    if (multimedia_hotlink_template) {
        replaceUrls($, 'video, video > source, audio, audio > source', multimedia_hotlink_template);
        if (!image_hotlink_template) {
            replaceUrls($, 'video[poster]', multimedia_hotlink_template, 'poster');
        }
    }
    if (wrap_multimedia_in_iframe) {
        wrapWithIframe($, 'video, audio');
    }
    return $.html();
};

const validateTemplate = (template) => {
    if (!template) {
        return;
    }
    const propMatches = [...template.matchAll(templateRegex)];
    if (propMatches.length > maxProperties) {
        throw new Error(`Too many properties (max ${maxProperties}, got ${propMatches.length}) in the hotlink template: ${template}`);
    }
    propMatches.forEach((match) => {
        if (!allowedUrlProperties.has(match[1])) {
            throw new Error(`Invalid URL property: ${match[1]}`);
        }
    });
};

const getTemplates = (ctx) => {
    if (config.hotlink.disableUserTemplate && (ctx.query.image_hotlink_template || ctx.query.multimedia_hotlink_template)) {
        throw new Error('User-defined hotlink templates are disabled by the instance maintainer');
    }

    let image_hotlink_template;
    if (ctx.query.image_hotlink_template) {
        image_hotlink_template = ctx.query.image_hotlink_template;
    } else {
        // for backward compatibility
        image_hotlink_template = config.hotlink.template;
        if (image_hotlink_template && !filterPath(ctx.request.path)) {
            image_hotlink_template = undefined;
        }
    }
    validateTemplate(image_hotlink_template);
    validateTemplate(ctx.query.multimedia_hotlink_template);
    return {
        image_hotlink_template,
        multimedia_hotlink_template: ctx.query.multimedia_hotlink_template,
        wrap_multimedia_in_iframe: ctx.query.wrap_multimedia_in_iframe,
    };
};

module.exports = {
    getTemplates,
    processHtml,
};
