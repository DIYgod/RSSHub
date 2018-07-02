const util = {
    getArticleData(articles, $) {
        if (!articles) {
            return [];
        }

        return articles
            .map((index, article) => {
                article = $(article);
                const title = article.find('h2').text();
                const description = article.find('.entry-content').text();
                const pubDate = new Date(article.find('.entry-date').attr('datetime')).toUTCString();
                const link = article.find('a[rel=bookmark]').attr('href');

                return {
                    title,
                    description,
                    pubDate,
                    link,
                };
            })
            .get();
    },
};

module.exports = util;
