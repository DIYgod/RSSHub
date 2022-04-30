const config = require('@/config').value;
const cheerio = require('cheerio');
const logger = require('@/utils/logger');

const interpolate = (str, obj) => str.replace(/\${([^}]+)}/g, (_, prop) => obj[prop]);
// I don't want to keep another regex and
// URL will be the standard way to parse URL
const parseUrl = (str) => {
    let url;
    try {
        url = new URL(str);
    } catch (e) {
        logger.error(`Failed to parse ${str}`);
    }

    return url;
};
const replaceUrls = (body, template) => {
    // const $ = cheerio.load(body, { decodeEntities: false, xmlMode: true });
    // `<br><img><hr><video><source>abc</video>` => `<br><img><hr><video><source>abc</source></video></hr></img></br>`
    // so awful...
    // "In HTML, using a closing tag on an empty element is usually invalid."
    // https://developer.mozilla.org/en-US/docs/Glossary/Empty_element
    // I guess it is just a workaround to drop `<html><head></head><body>`, so this is what we exactly need:
    const $ = cheerio.load(body, null, false);
    $('img').each(function () {
        const old_src = $(this).attr('src');
        const url = parseUrl(old_src);
        if (url) {
            const new_src = interpolate(template, url);
            $(this).attr('src', new_src);
        }
    });

    return $.root().html();
};

module.exports = async (ctx, next) => {
    await next();

    const template = config.hotlink.template;
    // Assume that only description include image link
    // and here we will only check them in description.
    // Use Cheerio to load the description as html and filter all
    // image link
    if (template) {
        if (ctx.state.data) {
            if (ctx.state.data.description) {
                ctx.state.data.description = replaceUrls(ctx.state.data.description, template);
            }

            ctx.state.data.item &&
                ctx.state.data.item.forEach((item) => {
                    if (item.description) {
                        item.description = replaceUrls(item.description, template);
                    }
                });
        }
    }
};
