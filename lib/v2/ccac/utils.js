const BASE_URL = 'https://www.ccac.org.mo';

const LANG_TYPE = {
    en: 'en-US',
    sc: 'zh-CN',
    tc: 'zh-HK',
};

function langBase(lang) {
    return `${BASE_URL}/${lang}/news.html`;
}

module.exports = {
    BASE_URL,
    LANG_TYPE,
    langBase,
};
