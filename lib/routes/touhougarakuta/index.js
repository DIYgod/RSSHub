const got = require('@/utils/got');
const j2h = require('./json2html');

const languageCodes = {
    cn: 'zh-cn',
    ko: 'ko',
    ja: 'ja',
};

const getBaseUrl = (language) => (language === 'ja' ? 'https://touhougarakuta.com' : `https://${language}.touhougarakuta.com`);

module.exports = async (ctx) => {
    const { language, type } = ctx.params;

    const baseUrl = getBaseUrl(language);

    const response = await got({
        method: 'get',
        url: `${baseUrl}/page-data/${type === 'interviews' ? 'tags/interviews' : type}/page-data.json`,
    });

    ctx.state.data = {
        title: `東方我楽多叢誌 - ${type}`,
        link: `${baseUrl}/${type === 'index' ? '' : type}`,
        description: `東方我楽多叢誌 〜strange article of the outer world〜 - ${type}`,
        language: languageCodes[language],
        allowEmpty: true,
        item: response.data.result.pageContext.articles.map((article, i) => {
            const result = {};
            result.title = article.title;
            result.pubDate = article.date;
            result.link = `${baseUrl}/${article.type}/${article.slug}`;
            try {
                switch (article.type) {
                    case 'index_interview':
                    case 'column':
                        result.description = j2h.indexInterview(article, language);
                        break;
                    case 'index_comic':
                        result.description = j2h.indexComic(article, language);
                        break;
                    case 'index_novel':
                        result.description = j2h.indexNovel(article, language);
                        break;
                    case 'interview':
                    case 'report':
                        result.description = j2h.interview(article, language);
                        break;
                    case 'novel':
                        result.description = j2h.novel(article, language);
                        break;
                    case 'comic':
                        result.description = j2h.comic(article, language);
                        break;
                    default:
                        result.description = j2h.uncategorized(article);
                }
            } catch (error) {
                error.message += `(at article ${i}: ${article.title})`;
                throw error;
            }
            return result;
        }),
    };
};
