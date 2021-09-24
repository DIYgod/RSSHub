const { art } = require('@/utils/render');
const path = require('path');

const BASE_URL = 'https://www.icac.org.hk';

function renderDesc(desc, thumb) {
    return art(path.join(__dirname, 'templates/description.art'), {
        desc,
        thumb,
    });
}

module.exports = {
    BASE_URL,
    renderDesc,
};
