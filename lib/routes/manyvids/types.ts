export interface UserProfile {
    createdAt: string;
    displayName: string;
    profileId: string;
    urlHandle: string;
    userId: string;
    legacyUserId: string;
    userStatus: string;
    userType: string;
    avatar: string;
    bio: string;
    description: string;
    dob: string;
    identification: string;
    location: string;
    orientation: string;
    currentRank: number;
    bodyType: string;
    hairColor: string;
    ethnicity: string;
    poAddress: string;
    poCity: string;
    poName: string;
    poZip: string;
    portrait: string;
    shortLinkUrl: string;
    profession: string;
    socLnkFacebook: string;
    socLnkInstagram: string;
    socLnkReddit: string;
    socLnkTwitter: string;
    socLnkYoutube: string;
    profileType: string;
    hasPremiumMembership: boolean;
}

interface Avatar {
    url: string;
}

interface Creator {
    id: string;
    slug: string;
    stageName: string;
    avatar: Avatar;
}

interface Thumbnail {
    url: string;
}

interface Preview {
    url: string;
}

interface Price {
    free: boolean;
    onSale: boolean;
    regular: string;
}

interface Video {
    id: string;
    title: string;
    slug: string;
    duration: string;
    creator: Creator;
    thumbnail: Thumbnail;
    preview: Preview;
    price: Price;
    likes: number;
    views: number;
    type: string;
}

interface Pagination {
    total: number;
    totalWithoutFilters: number;
    currentPage: number;
    totalPages: number;
    nextPage: number;
}

export interface Videos {
    statusCode: number;
    statusMessage: string;
    data: Video[];
    pagination: Pagination;
}
