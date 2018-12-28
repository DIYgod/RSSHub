const pathToRegExp = require('path-to-regexp');
const readall = require('readall');
const crypto = require('crypto');

const paired = (route, path) => {
    const options = {
        sensitive: true,
        strict: true,
    };

    return pathToRegExp(route, [], options).exec(path);
};

// eslint-disable-next-line no-unused-vars
const read = (stream) =>
    new Promise((resolve, reject) => {
        readall(stream, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });

const md5 = (str) =>
    crypto
        .createHash('md5')
        .update(str)
        .digest('hex');

const validityCheck = (routes, exclude, path) => {
    let match = false;
    let routeExpire = false;

    for (let i = 0; i < routes.length; i++) {
        let route = routes[i];

        if (typeof routes[i] === 'object') {
            route = routes[i].path;
            routeExpire = routes[i].expire;
        }

        if (paired(route, path)) {
            match = true;
            break;
        }
    }

    for (let j = 0; j < exclude.length; j++) {
        if (paired(exclude[j], path)) {
            match = false;
            break;
        }
    }

    return { match, routeExpire };
};

module.exports = {
    paired,
    read,
    md5,
    validityCheck,
};
