export interface City {
    id: string;
    icon: string;
    city: string;
    enCityName: string;
    cityName: string;
    chCityName: string;
    twCityName: string;
    statics: {
        total_text: string;
        online_text: string;
        total_count: number;
        online_count: number;
    };
    district: District[];
}

export interface District {
    id: string;
    longitude: number;
    latitude: number;
    name: string;
    business: Array<{
        id: string;
        name: string;
    }>;
}

export interface House {
    id: string;
    imgs: string[];
    ev: number;
    city: string;
    district: string;
    tagsText: string;
    tags: string[];
    typeTags: string[];
    rent: string;
    video: string;
    personalDesc: string;
    address: string;
    longitude: number;
    latitude: number;
    collectNum: number;
    isCollect: boolean;
    userInfo: {
        id: string;
        name: string;
        gender: number;
        avatar: string;
        language: string[];
        loginTime: string;
        tenant_status: number;
        landlord_status: number;
    };
    loginTime: number;
    dailyRent: string;
}
