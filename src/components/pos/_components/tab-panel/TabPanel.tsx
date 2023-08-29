import classNames from 'classnames';
import React from 'react';
import styles from './TabPanel.module.scss';

export const TabPanel = (props: any) => {
  const { onTabChange, lang, activeTab } = props;

  return (
    <ul
      className={classNames(
        'nav nav-tabs-pos nav-justified nav-border-top  mb-3',
        styles['panel-container']
      )}
      role="tablist">
      <li
        className="nav-item"
        onClick={() => {
          onTabChange('category');
        }}>
        <a
          className={classNames('nav-link-pos', {
            active: activeTab === 'category',
          })}
          data-bs-toggle="tab"
          role="tab"
          aria-selected="false">
          {lang.category}
        </a>
      </li>

      <li
        className="nav-item"
        onClick={() => {
          onTabChange('brand');
        }}>
        <a
          className={classNames('nav-link-pos', {
            active: activeTab === 'brand',
          })}
          data-bs-toggle="tab"
          role="tab"
          aria-selected="false">
          {lang.brand}
        </a>
      </li>
    </ul>
  );
};
