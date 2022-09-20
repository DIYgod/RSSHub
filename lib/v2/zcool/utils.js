const { art } = require('@/utils/render');
const path = require('path');

const extractArticle = (data) => data.props.pageProps.data.summary + data.props.pageProps.data.memo;

const extractWork = (data) =>
    art(path.join(__dirname, 'templates/work.art'), {
        data: data.props.pageProps.data,
    });

module.exports = {
    extractArticle,
    extractWork,
};
