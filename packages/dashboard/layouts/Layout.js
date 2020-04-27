import classnames from 'classnames';
import React, { Fragment, useEffect, useRef, useState } from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';

export default function Layout({ children }) {
  const menu = useRef();
  const [animating, setAnimating] = useState(false);
  const [visible, setVisible] = useState(false);

  const menuClasses = classnames('menu', {
    'menu--animatable': animating,
    'menu--visible': visible,
  });

  const onClick = () => {
    setAnimating(true);
    setVisible(!visible);
  };

  useEffect(() => {
    if (!menu.current) {
      return;
    }
    const onTransitionEnd = () => setAnimating(false);

    menu.current.addEventListener('transitionend', onTransitionEnd);
    return () =>
      menu.current.removeEventListener('transitionend', onTransitionEnd);
  }, []);

  return (
    <Fragment>
      {/* <aside className={menuClasses} onClick={onClick} ref={menu}>
        <div className="app-menu">
          <h1>Content!</h1>
        </div>
      </aside> */}
      <main className="container">
        <Header onClick={onClick} isActive={visible} />
        {children}
        <Footer />
      </main>
    </Fragment>
  );
}
