const { art } = require('@/utils/render');
const path = require('path');

const courseDesc = (desc, picurl) =>
    art(path.join(__dirname, 'templates/courseDesc.art'), {
        desc,
        picurl,
    });

module.exports = {
    courseDesc,
};
