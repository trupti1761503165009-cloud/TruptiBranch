import * as React from 'react';
import { Spinner, SpinnerSize } from '@fluentui/react';

const LoadingSpinner: React.FC = () => (
  <div className="dms-spinner-container" role="alert" aria-live="assertive">
    <Spinner size={SpinnerSize.large} label="Loading..." ariaLive="assertive" />
  </div>
);

export default LoadingSpinner;
