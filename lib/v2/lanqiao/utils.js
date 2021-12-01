const { art } = require('@/utils/render');
const path = require('path');

const courseDesc = (picurl, desc) =>
    art(path.join(__dirname, 'templates/courseDesc.art'), {
        picurl,
        desc,
    });

module.exports = {
    courseDesc,
};
