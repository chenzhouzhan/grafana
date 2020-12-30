import React, { FC } from 'react';
import { css, cx } from 'emotion';
import { useTheme } from '@grafana/ui';

export interface BrandComponentProps {
  className?: string;
  children?: JSX.Element | JSX.Element[];
}

const LoginLogo: FC<BrandComponentProps> = ({ className }) => {
  return <img className={className} src="public/img/login_abba_logo.png" alt="国家电投" />;
};

const LoginBackground: FC<BrandComponentProps> = ({ className, children }) => {
  const background = css`
    background: url(public/img/login_background_abba.jpg);
    background-size: cover;
  `;

  return <div className={cx(background, className)}>{children}</div>;
};

const MenuLogo: FC<BrandComponentProps> = ({ className }) => {
  return <img className={className} src="public/img/grafana_icon.svg" alt="Grafana" />;
};

const LoginBoxBackground = () => {
  const theme = useTheme();
  return css`
    background: ${theme.isLight ? 'rgba(6, 30, 200, 0.1 )' : '#0D1C32'};
    background-size: cover;
  `;
};

export class Branding {
  static LoginLogo = LoginLogo;
  static LoginBackground = LoginBackground;
  static MenuLogo = MenuLogo;
  static LoginBoxBackground = LoginBoxBackground;
  static AppTitle = '上海电力智慧云平台';
  static LoginTitle = '上海电力智慧云平台';
  static GetLoginSubTitle = () => {
    return '';
    // const slogans = [
    //   "Don't get in the way of the data",
    //   'Your single pane of glass',
    //   'Built better together',
    //   'Democratising data',
    // ];
    // const count = slogans.length;
    // return slogans[Math.floor(Math.random() * count)];
  };
}
