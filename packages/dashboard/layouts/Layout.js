/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable consistent-return */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react/prop-types */
import classnames from 'classnames';
import React, { Fragment, useEffect, useRef, useState } from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';
import Navigation from '../components/Navigation';

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
    const element = menu.current;

    const onTransitionEnd = () => setAnimating(false);

    element.addEventListener('transitionend', onTransitionEnd);
    return () => element.removeEventListener('transitionend', onTransitionEnd);
  }, []);

  return (
    <Fragment>
      <aside className={menuClasses} onClick={onClick} ref={menu}>
        <div className="app-menu">
          <h1>Content!</h1>
          <Navigation />
        </div>
      </aside>
      <main className="container">
        <Header onClick={onClick} isActive={visible} />
        <section className="main">{children}</section>
        <Footer />
      </main>
    </Fragment>
  );
}
