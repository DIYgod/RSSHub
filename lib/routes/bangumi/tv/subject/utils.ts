// @ts-nocheck
const getLocalName = (obj, showOriginalName) => (showOriginalName ? obj.name || obj.name_cn : obj.name_cn || obj.name);

module.exports = {
    getLocalName,
};
