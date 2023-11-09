import DocSidebarItem from '@theme-original/DocSidebarItem';
import CarbonAds from '@site/src/components/CarbonAds';

export default function DocSidebarItemWrapper(props) {
    if (props.item.value === 'CarbonAds') {
        return (
            <>
                <CarbonAds />
            </>
        );
    }
    return (
        <>
            <DocSidebarItem {...props} />
        </>
    );
}
