const getLocalName = (obj, showOriginalName) => (showOriginalName ? obj.name || obj.name_cn : obj.name_cn || obj.name);

export { getLocalName };
