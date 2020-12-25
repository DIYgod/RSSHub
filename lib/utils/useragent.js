const randomUseragent = require('random-useragent');
const RE2 = require('re2');

/**
 * A handy function to help generate a legit useragent. For more complicate usage, require `random-useragent` directly.
 * Details on what each parameter stands for, see https://github.com/skratchdot/random-useragent/raw/master/useragent-data.json
 *
 * @param {string} browserName Name of a browser, case-insensitive. e.g. Firefox
 * @param {string} osName Name of a operating system, case-insensitive. e.g. Linux
 * @returns {string} A random useragent for the given specification
 **/
function uaHelper({ browserName, osName }) {
    randomUseragent.getRandom((ua) => {
        const res = [];
        if (browserName) {res.push(new RE2(`/${browserName}/i`).exec(ua.browserName));}
        if (osName) {res.push(new RE2(`/${osName}/i`).exec(ua.osName));}
        return res.every((value) => value !== null);
    });
    return useragent.toString();
}

module.exports = uaHelper;
