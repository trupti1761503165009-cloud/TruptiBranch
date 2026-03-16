/**
 * Type declarations for @pnp/spfx-controls-react
 */

declare module '@pnp/spfx-controls-react/lib/Pagination' {
  import * as React from 'react';
  
  export interface IPaginationProps {
    currentPage: number;
    totalPages: number;
    onChange: (page: number) => void;
    limiter?: number;
    hideFirstPageJump?: boolean;
    hideLastPageJump?: boolean;
    limiterIcon?: string;
  }
  
  export class Pagination extends React.Component<IPaginationProps, any> {}
  export default Pagination;
}

declare module '@pnp/spfx-controls-react/lib/PeoplePicker' {
  import * as React from 'react';
  
  export interface IPeoplePickerProps {
    context: any;
    titleText?: string;
    personSelectionLimit?: number;
    groupName?: string;
    showHiddenInUI?: boolean;
    principalTypes?: any[];
    selectedPeople?: any[];
    defaultSelectedUsers?: string[];
    suggestionsLimit?: number;
    disabled?: boolean;
    ensureUser?: boolean;
    placeholder?: string;
    searchTextLimit?: number;
    onChange?: (items: any[]) => void;
    showTooltip?: boolean;
    tooltipMessage?: string;
    peoplePickerWPclassName?: string;
    peoplePickerCntrlclassName?: string;
    errorMessageClassName?: string;
    errorMessage?: string;
  }
  
  export class PeoplePicker extends React.Component<IPeoplePickerProps, any> {}
  export default PeoplePicker;
}
