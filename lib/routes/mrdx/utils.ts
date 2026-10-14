function getElementChildrenInnerText(element) {
    if (!element) {
        return '';
    }
    let text = '';
    for (const child of element.children) {
        if (child.type === 'text') {
            text += child.data;
        }
        if (child.children !== undefined) {
            text += getElementChildrenInnerText(child);
        }
    }

    return text;
}

export { getElementChildrenInnerText };
