import { evaluateScriptData } from '@/utils/evaluate-script';

type CcacArticle = {
    key: string;
    name: string;
    url: string;
    time: string;
    tags: Array<{ name: string }>;
};

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

async function parseArticles(source: string): Promise<CcacArticle[]> {
    const articles = await Promise.all(
        source
            .matchAll(/var article\s*=\s*(\{[\s\S]*?\})\s*articles\.push\(article\);/g)
            .toArray()
            .map(([, data]) => evaluateScriptData<Omit<CcacArticle, 'tags'>>(`var article=${data}`, 'article'))
    );
    const tagsByKey = new Map(
        await Promise.all(
            source
                .matchAll(/if\(article2\.key == "([^"]+)"\)\s*\{([\s\S]*?)\bbreak;/g)
                .toArray()
                .map(async ([, key, block]) => {
                    const tags = await Promise.all(
                        block
                            .matchAll(/var tag\s*=\s*(\{[\s\S]*?\})\s*article2\.tags\.push\(tag\);/g)
                            .toArray()
                            .map(([, data]) => evaluateScriptData<{ name: string }>(`var tag=${data}`, 'tag'))
                    );
                    return [key, tags] as const;
                })
        )
    );
    return articles.map((article) => ({ ...article, tags: tagsByKey.get(article.key) ?? [] }));
}

export default { TYPE, BASE_URL, LANG_TYPE, langBase, typeFilter, parseArticles };
