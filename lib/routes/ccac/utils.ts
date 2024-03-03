// @ts-nocheck
const BASE_URL = 'https://www.ccac.org.mo';

const LANG_TYPE = {
    en: 'en-us',
    sc: 'zh-cn',
    tc: 'zh-hk',
    pt: 'pt',
};

const TYPE = {
    all: '全部',
    case: '案件發佈',
    Persuasion: '調查報告或勸喻',
    AnnualReport: '年度報告',
    PCANews: '公署消息',
};

function langBase(lang) {
    return `${BASE_URL}/${lang}/news.html`;
}

function typeFilter(list, type) {
    return type === '全部' ? list : list.filter((item) => item.tags.some((tag) => tag.name === type));
}

module.exports = {
    TYPE,
    BASE_URL,
    LANG_TYPE,
    langBase,
    typeFilter,
};
