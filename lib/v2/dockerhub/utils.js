const md5 = require('@/utils/md5');

function hash(images) {
    const entries = Object.entries(images)
        .map((x) => [`${x.os}/${x.architecture}`, x.digest])
        .sort((a, b) => a[0] - b[0]);
    return md5(entries.map((x) => x.join(',')).join('|'));
}

module.exports = { hash };
