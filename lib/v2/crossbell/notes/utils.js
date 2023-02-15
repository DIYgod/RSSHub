module.exports = {
    getItem: (note) => {
        let link = note.metadata?.content?.external_urls?.[0] ?? `https://crossbell.io/notes/${note.characterId}-${note.noteId}`;
        if (link.startsWith('https://xn--')) {
            link = `https://crossbell.io/notes/${note.characterId}-${note.noteId}`;
        }
        return {
            title: note.metadata?.content?.title || '',
            description: note.metadata?.content?.content,
            link,
            pubDate: note.metadata?.content?.publishedAt,
            updated: note.metadata?.content?.updatedAt,
            author: note.metadata?.content?.authors?.[0] || note.character?.metadata?.content?.name || note.character?.handle,
            guid: `https://crossbell.io/notes/${note.characterId}-${note.noteId}`,
            category: [...(note.metadata?.content?.sources || []), ...(note.metadata?.content?.tags || [])],
        };
    },
};
