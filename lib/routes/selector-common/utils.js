const fs = require('fs');
const path = require('path');

function transElemText($, prop) {
    const regex = new RegExp(/\$\((.*)\)/g);
    let result = prop;
    if (regex.test(prop)) {
        result = eval(prop);
    }
    return result;
}

function replaceParams(data, prop, $) {
    const regex = new RegExp(/%(.*)%/g);
    let result = prop;
    let group = regex.exec(prop);
    while (group) {
        group = regex.exec(prop);
        result = result.replace(group[0], transElemText($, replaceParams(data, data.params[group[1]], $)));
    }
    return result;
}

module.exports = {
    listSpecTypeFiles: (dir, type) => {
        const files = fs.readdirSync(path.resolve(__dirname, dir));
        const resultArray = [];
        for (const file of files) {
            if (file.endsWith(`.${type}`)) {
                resultArray.push(file);
            }
        }
        return resultArray;
    },
    replaceParams,
    getProp(data, prop, $) {
        let result = data;
        if (Array.isArray(prop)) {
            for (const e of prop) {
                result = transElemText($, result[e]);
            }
        } else {
            result = data[prop];
        }
        return replaceParams(data, result, $);
    },
};
