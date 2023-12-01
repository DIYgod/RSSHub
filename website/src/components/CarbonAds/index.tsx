import React from 'react';
import styles from './styles.module.css';

function buildScript(src, attrs = {}) {
  const script = document.createElement('script');
  script.async = true;
  Object.keys(attrs).forEach((attr) => script.setAttribute(attr, attrs[attr]));
  script.src = src;

  return script;
}

export default function CarbonAds(props) {
  const ref = React.useRef<HTMLSpanElement>();

  React.useEffect(() => {
    const script = buildScript('//cdn.carbonads.com/carbon.js?serve=CEAI653E&placement=docsrsshubapp', {
      type: 'text/javascript',
      id: '_carbonads_js',
    });
    const sidebarWrapper = ref.current;
    if (!sidebarWrapper) {
      return;
    }
    sidebarWrapper.classList.remove(styles.roomForCarbon);

    const carbonWrapper = document.createElement('div');
    carbonWrapper.classList.add(styles.carbonWrapper);

    carbonWrapper.appendChild(script);
    // append at the end
    sidebarWrapper.firstChild.insertBefore(carbonWrapper, null);

    return () => {
      sidebarWrapper.classList.add(styles.roomForCarbon);
      carbonWrapper.parentElement.removeChild(carbonWrapper);
    }
  }, []);

  // use span to avoid creating containing block so that OriginalDocSidebar keeps being sticky positioned to the existing block ancestor
  return (
    <span ref={ref} className={styles.roomForCarbon}>
      <span></span>
    </span>
  );
}
