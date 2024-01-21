import { config } from '@/config';
import { load, type CheerioAPI } from 'cheerio';
import logger from '@/utils/logger';
import * as path from 'node:path';
import render from '@/utils/render';
import { type MiddlewareHandler } from 'hono';
import { Data } from '@/types';

const templateRegex = /\${([^{}]+)}/g;
const allowedUrlProperties = new Set(['hash', 'host', 'hostname', 'href', 'origin', 'password', 'pathname', 'port', 'protocol', 'search', 'searchParams', 'username']);
const IframeWrapperTemplate = path.join(__dirname, 'templates/iframe.art');

// match path or sub-path
const matchPath = (path: string, paths: string[]) => {
    for (const p of paths) {
        if (path.startsWith(p) && (path.length === p.length || path[p.length] === '/')) {
            return true;
        }
    }
    return false;
};

// return ture if the path needs to be processed
const filterPath = (path: string) => {
    const include = config.hotlink.includePaths;
    const exclude = config.hotlink.excludePaths;
    return !(include && !matchPath(path, include)) && !(exclude && matchPath(path, exclude));
};

const interpolate = (str: string, obj: Record<string, any>) =>
    str.replaceAll(templateRegex, (_, prop) => {
        let needEncode = false;
        if (prop.endsWith('_ue')) {
            // url encode
            prop = prop.slice(0, -3);
            needEncode = true;
        }
        return needEncode ? encodeURIComponent(obj[prop]) : obj[prop];
    });
const parseUrl = (str: string) => {
    let url;
    try {
        url = new URL(str);
    } catch {
        logger.error(`Failed to parse ${str}`);
    }

    return url;
};
const replaceUrls = ($: CheerioAPI, selector: string, template: string, attribute = 'src') => {
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

const wrapWithIframe = ($: CheerioAPI, selector: string) => {
    $(selector).each((_, elem) => {
        const $elem = $(elem);
        $elem.replaceWith(render.art(IframeWrapperTemplate, { content: elem.toString() }));
    });
};

const process = (html: string, image_hotlink_template?: string, multimedia_hotlink_template?: string, wrap_multimedia_in_iframe?: boolean) => {
    const $ = load(html, undefined, false);
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

const validateTemplate = (template?: string) => {
    if (!template) {
        return;
    }
    for (const match of template.matchAll(templateRegex)) {
        const prop = match[1].endsWith('_ue') ? match[1].slice(0, -3) : match[1];
        if (!allowedUrlProperties.has(prop)) {
            throw new Error(`Invalid URL property: ${prop}`);
        }
    }
};

const middleware: MiddlewareHandler = async (ctx, next) => {
    await next();

    let image_hotlink_template;
    let multimedia_hotlink_template;
    const shouldWrapInIframe = ctx.req.query('wrap_multimedia_in_iframe') === '1';

    // Read params if enabled
    if (config.feature.allow_user_hotlink_template) {
        // By default, the config turns these features off. Set corresponding config to
        // true to turn this feature on.
        // A risk is that the media URLs will be replaced by user-supplied templates,
        // so a user could literally take the control of "where are the media from",
        // but only in their personal-use feed URL.
        multimedia_hotlink_template = ctx.req.query('multimedia_hotlink_template');
        image_hotlink_template = ctx.req.query('image_hotlink_template');
    }

    // Force config hotlink template on conflict
    if (config.hotlink.template) {
        image_hotlink_template = filterPath(ctx.req.path) ? config.hotlink.template : undefined;
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
    const data: Data = ctx.get('data');
    if (data) {
        if (data.description) {
            data.description = process(data.description, image_hotlink_template, multimedia_hotlink_template, shouldWrapInIframe);
        }

        if (data.item) {
            for (const item of data.item) {
                if (item.description) {
                    item.description = process(item.description, image_hotlink_template, multimedia_hotlink_template, shouldWrapInIframe);
                }
            }
        }

        ctx.set('data', data);
    }
};

export default middleware;
