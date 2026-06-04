export default function getItems(data) {
    const items = data('.category-list li')
        .toArray()
        .map((item) => {
            item = data(item);
            const title = item.find('h2').text();
            const link = item.find('a').attr('href');
            const author = item.find('p').text();
            const image = item.find('picture img').attr('src');

            return {
                title,
                link,
                description: `<img src="${image}" alt="${title}">`,
                author,
            };
        });

    return items;
}
