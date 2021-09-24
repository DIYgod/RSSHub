const BASE_URL = 'https://www.icac.org.hk';

function langBase(lang) {
    return lang ? `${BASE_URL}/${lang}` : `https://www.icac.org.hk/sc`
}

module.exports = {
    BASE_URL,
    langBase,
};
