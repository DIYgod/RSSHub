const pathToRegExp = require('path-to-regexp');

const paired = (route, path) => {
    const options = {
        sensitive: true,
        strict: true,
    };

    return pathToRegExp(route, [], options).exec(path);
};

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
    validityCheck,
};
