export const BASE_URL = 'https://www.icac.org.hk';

export const LANG_TYPE = {
    en: 'en-us',
    sc: 'zh-cn',
    tc: 'zh-hk',
};

export function langBase(lang) {
    return lang ? `${BASE_URL}/${lang}` : `https://www.icac.org.hk/sc`;
}
