const config = require('@/config').value;
const cheerio = require('cheerio');
const logger = require('@/utils/logger');
const path = require('path');
const { art } = require('@/utils/render');

const templateRegex = /\$\{([^{}]+)}/g;
const allowedUrlProperties = ['hash', 'host', 'hostname', 'href', 'origin', 'password', 'pathname', 'port', 'protocol', 'search', 'searchParams', 'username'];
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
                // Cheerio will do the right thing to prohibit XSS.
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

const process = (html, image_hotlink_template, multimedia_hotlink_template, wrap_multimedia_in_iframe) => {
    const $ = cheerio.load(html, undefined, false);
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
    [...template.matchAll(templateRegex)].forEach((match) => {
        const prop = match[1].endsWith('_ue') ? match[1].slice(0, -3) : match[1];
        if (!allowedUrlProperties.includes(prop)) {
            throw new Error(`Invalid URL property: ${prop}`);
        }
    });
};

module.exports = async (ctx, next) => {
    await next();

    let image_hotlink_template = undefined;
    let multimedia_hotlink_template = undefined;
    const shouldWrapInIframe = ctx.query.wrap_multimedia_in_iframe === '1';

    // Read params if enabled
    if (config.feature.allow_user_hotlink_template) {
        // By default, the config turns these features off. Set corresponding config to
        // true to turn this feature on.
        // A risk is that the media URLs will be replaced by user-supplied templates,
        // so a user could literally take the control of "where are the media from",
        // but only in their personal-use feed URL.
        multimedia_hotlink_template = ctx.query.multimedia_hotlink_template;
        image_hotlink_template = ctx.query.image_hotlink_template;
    }

    // Force config hotlink template on conflict
    if (config.hotlink.template) {
        if (!filterPath(ctx.request.path)) {
            image_hotlink_template = undefined;
        } else {
            image_hotlink_template = config.hotlink.template;
        }
    }

    if (!image_hotlink_template && !multimedia_hotlink_template && !shouldWrapInIframe) {
        return;
    }

    validateTemplate(image_hotlink_template);
    validateTemplate(multimedia_hotlink_template);

    // Assume that only description include image link
    // and here we will only check them in description.
    // Use Cheerio to load the description as html and filter all
    // image link
    if (ctx.state.data) {
        if (ctx.state.data.description) {
            ctx.state.data.description = process(ctx.state.data.description, image_hotlink_template, multimedia_hotlink_template, shouldWrapInIframe);
        }

        ctx.state.data.item &&
            ctx.state.data.item.forEach((item) => {
                if (item.description) {
                    item.description = process(item.description, image_hotlink_template, multimedia_hotlink_template, shouldWrapInIframe);
                }
            });
    }
};
