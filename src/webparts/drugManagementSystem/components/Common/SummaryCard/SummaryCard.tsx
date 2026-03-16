import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
// Styles are provided via the shared DMS styles.css from the reference project.

export interface SummaryCardProps {
  title: string;
  value: number | string;
  icon: IconDefinition;
  color: 'blue' | 'green' | 'orange' | 'red' | 'purple';
  onClick?: () => void;
  subtitle?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  icon,
  color,
  onClick,
  subtitle
}) => {
  return (
    <div
      className={`summary-card summary-card--${color} ${onClick ? 'summary-card--clickable' : ''}`}
      onClick={onClick}
    >
      <div className={`summary-card__border summary-card__border--${color}`} />
      <div className="summary-card__content">
        <div className={`summary-card__icon-wrapper summary-card__icon-wrapper--${color}`}>
          <FontAwesomeIcon icon={icon} className="summary-card__icon" />
        </div>
        <div className="summary-card__info">
          <h3 className="summary-card__count">{value}</h3>
          <p className="summary-card__title">{title}</p>
          {subtitle && <p className="summary-card__subtitle">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
