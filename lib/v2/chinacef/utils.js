const { art } = require('@/utils/render');
const path = require('path');

const renderDesc = (desc) =>
    art(path.join(__dirname, 'templates/description.art'), {
        desc,
    });

module.exports = {
    renderDesc,
};
