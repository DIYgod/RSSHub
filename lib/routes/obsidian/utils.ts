const regex = /([^/]+)\.md$/;

const getTitle = (path: string): string => {
    const match = path.match(regex);
    return match ? match[1] : '';
};

export { getTitle };
