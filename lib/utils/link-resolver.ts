// A relative link takes from its base whatever it leaves out, and `#` leaves out everything, so resolving n links
// against a base of m characters allocates n * m characters. Both numbers come from the upstream: 100,000 `<a href="#">`
// in an item whose own link has 60,000 characters ask for 6 GB, and running out of heap aborts the process.
// The characters that resolving may add to one feed are capped; the links after that are left as they are.
export const defaultLinkResolveBudget = 4 * 1024 * 1024;

export const createLinkResolver = (budget = defaultLinkResolveBudget) => {
    let remaining = budget;
    return (link: string, base?: string) => {
        if (remaining <= 0) {
            return link;
        }
        const { href } = new URL(link, base);
        remaining -= href.length - link.length;
        return href;
    };
};

export type LinkResolver = ReturnType<typeof createLinkResolver>;
