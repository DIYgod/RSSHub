function parseJSONP(jsonpData) {
    try {
        const startPos = jsonpData.indexOf('({');
        const endPos = jsonpData.lastIndexOf('})');
        let jsonString = jsonpData.slice(startPos + 1, endPos + 1);

        // remove escaped single quotes since they are not valid json
        jsonString = jsonString.replaceAll(String.raw`\'`, "'");

        return JSON.parse(jsonString);
    } catch (error_) {
        const error = new Error(`Failed to convert jsonp to json. ${error_.message}`);
        throw error;
    }
}

export { parseJSONP };
