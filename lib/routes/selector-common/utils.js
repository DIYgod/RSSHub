const fs = require('fs');
const path = require('path');

function transElemText($, prop) {
    const regex = new RegExp(/\$\((.*)\)/g);
    let result = prop;
    if (regex.test(result)) {
        result = eval(result);
    }
    return result;
}

function replaceParams(data, prop, $) {
    const regex = new RegExp(/%(.*)%/g);
    let result = prop;
    let group = regex.exec(prop);
    while (group) {
        // FIXME Multi vars
        result = result.replace(group[0], transElemText($, data.params[group[1]]));
        group = regex.exec(prop);
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
            result = transElemText($, result[prop]);
        }
        return replaceParams(data, result, $);
    },
};
