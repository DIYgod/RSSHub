// @ts-nocheck
function generateRssData(item, index, arr, country) {
    const attributeSet = new Set(['name', 'image', 'short_description', 'slug', `price_${country}`, `discount_price_${country}`]);
    const attributes = item.attribute;
    const data = {};

    for (const attribute of attributes) {
        const key = attribute.name;
        const value = attribute.value[0].value;
        if (attributeSet.has(key)) {
            if (key === `price_${country}`) {
                data.original_price = value;
            } else if (key === `discount_price_${country}`) {
                data.price = value;
            } else {
                data[key] = value;
            }
        }
    }
    return (arr[index] = data);
}
module.exports = {
    generateRssData,
};
