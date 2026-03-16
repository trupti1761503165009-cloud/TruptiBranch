import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faHome } from '@fortawesome/free-solid-svg-icons';
// Breadcrumb styling is provided by global DMS styles.css classes.

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  isActive?: boolean;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
  onHomeClick?: () => void;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  showHome = false,
  onHomeClick
}) => {
  return (
    <nav className="dms-breadcrumb breadcrumb-nav">
      <ol className="dms-breadcrumb__list">
        {showHome && (
          <li className="dms-breadcrumb__item breadcrumb-item">
            <button
              className="dms-breadcrumb__link dms-breadcrumb__link--home breadcrumb-link"
              onClick={onHomeClick}
            >
              <FontAwesomeIcon icon={faHome} className="dms-breadcrumb__home-icon" />
              <span>Dashboard</span>
            </button>
            <FontAwesomeIcon icon={faChevronRight} className="dms-breadcrumb__separator" />
          </li>
        )}
        {items.map((item, index) => (
          <li key={index} className={`dms-breadcrumb__item breadcrumb-item ${item.isActive ? 'active' : ''}`}>
            {item.onClick && !item.isActive ? (
              <button
                className="dms-breadcrumb__link breadcrumb-link"
                onClick={item.onClick}
              >
                {item.label}
              </button>
            ) : (
              <span className={`dms-breadcrumb__text ${item.isActive ? 'dms-breadcrumb__text--active' : ''}`}>
                {item.label}
              </span>
            )}
            {index < items.length - 1 && (
              <FontAwesomeIcon icon={faChevronRight} className="dms-breadcrumb__separator" />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
