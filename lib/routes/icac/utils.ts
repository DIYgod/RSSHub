// @ts-nocheck
const BASE_URL = 'https://www.icac.org.hk';

const LANG_TYPE = {
    en: 'en-us',
    sc: 'zh-cn',
    tc: 'zh-hk',
};

function langBase(lang) {
    return lang ? `${BASE_URL}/${lang}` : `https://www.icac.org.hk/sc`;
}

module.exports = {
    LANG_TYPE,
    BASE_URL,
    langBase,
};
