function getElementChildrenInnerText(element) {
    let text = '';
    for (const child of element.children) {
        if (child.type === 'text') {
            text += child.data.trim();
        }
        if (child.children !== undefined) {
            text += getElementChildrenInnerText(child);
        }
    }

    return text;
}

module.exports = {
    getElementChildrenInnerText,
};
