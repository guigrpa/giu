import { library as faLibrary } from '@fortawesome/fontawesome-svg-core';
import { far as farIcons } from '@fortawesome/free-regular-svg-icons';
import { fas as fasIcons } from '@fortawesome/free-solid-svg-icons';
import 'giu/lib/css/reset.css';
import 'giu/lib/css/giu.css';

faLibrary.add(farIcons, fasIcons);

const MyApp = (props) => {
  const { pageProps, Component } = props;
  return <Component {...pageProps} />;
}

export default MyApp;