export default function getItems(data) {
    const items = data('.category-list article')
        .toArray()
        .map((item) => {
            const $item = data(item);
            const title = $item.find('h2').text();
            const link = $item.find('a').attr('href');
            const author = $item.find('p').text();
            const image = $item.find('picture img').attr('src');

            return {
                title,
                link,
                description: image ? data('<img>').attr({ src: image, alt: title }).toString() : undefined,
                author,
            };
        });

    return items;
}
