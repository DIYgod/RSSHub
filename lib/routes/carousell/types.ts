type TimestampSeconds = {
    low: number;
    high: number;
    unsigned: boolean;
};
type TimestampContent = {
    seconds: TimestampSeconds;
};
type Seller = {
    id: string;
    profilePicture: string;
    username: string;
    firstName?: string;
    lastName?: string;
};
type AboveFoldItem = {
    component: string;
    timestampContent: TimestampContent;
};
type BelowFoldItem = {
    component: string;
    stringContent: string;
};
type MarketPlaceId = {
    low: number;
    high: number;
    unsigned: boolean;
};
type CountryId = {
    low: number;
    high: number;
    unsigned: boolean;
};
type Country = {
    code: string;
    id: CountryId;
    name: string;
};
type Location = {
    longitude: number;
    latitude: number;
};
type MarketPlace = {
    id: MarketPlaceId;
    name: string;
    country: Country;
    location: Location;
};
type Photo = {
    thumbnailUrl: string;
    thumbnailProgressiveUrl: string;
    thumbnailProgressiveLowRange: number;
    thumbnailProgressiveMediumRange: number;
    thumbnailHeight: number;
    thumbnailWidth: number;
};
type PhotoItem = {
    url: string;
    progressiveUrl: string;
    progressiveLowRange: number;
    progressiveMediumRange: number;
    height: number;
    width: number;
};
type VideoThumbnail = {
    url: string;
    progressiveUrl: string;
    progressiveLowRange: number;
    progressiveMediumRange: number;
    height: number;
    width: number;
};
type SupportedFormat = {
    dash: string;
    hls: string;
};
type PlayConfig = {
    isLoop: boolean;
    onlyWifi: boolean;
    isAutoPlay: boolean;
    isMuted: boolean;
};
type VideoItem = {
    thumbnail: VideoThumbnail;
    supportedFormat: SupportedFormat;
    playConfig: PlayConfig;
};
type MediaItem = {
    photoItem?: PhotoItem;
    videoItem?: VideoItem;
};
type OverlayContent = {
    timestampContent: TimestampContent;
    iconUrl?: {
        value: string;
    };
};
type OriginalPrice = {
    value: string;
};
type Tag = {
    content: string;
    backgroundColor: string;
    fontColor: string;
};
export type ListingCard = {
    id: string;
    seller: Seller;
    photoUrls: string[];
    aboveFold: AboveFoldItem[];
    belowFold: BelowFoldItem[];
    status: string;
    marketPlace: MarketPlace;
    photos: Photo[];
    media: MediaItem[];
    price: string;
    title: string;
    overlayContent: OverlayContent;
    isSellerVisible: boolean;
    countryCollectionId: string;
    ctaButtons: string[];
    likesCount?: number;
    originalPrice?: OriginalPrice;
    cardType?: number;
    tags?: Tag[];
};
