function parseJSONP(jsonpData) {
    try {
        const startPos = jsonpData.indexOf('({');
        const endPos = jsonpData.lastIndexOf('})');
        let jsonString = jsonpData.substring(startPos + 1, endPos + 1);

        // remove escaped single quotes since they are not valid json
        jsonString = jsonString.replace(/\\'/g, "'");

        return JSON.parse(jsonString);
    } catch (e) {
        const error = new Error(`Failed to convert jsonp to json. ${e.message}`);
        throw error;
    }
}

module.exports = {
    parseJSONP,
};
