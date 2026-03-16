// SiteSettingsToggles.tsx

import * as React from 'react';
import { Toggle } from '@fluentui/react';
import { WasteReportViewFields } from '../../../../../Common/Enum/WasteReportEnum';


export interface ISiteSettingsTogglesProps {
    toggleValues: {
        Periodic: boolean;
        HelpDesk: boolean;
        ClientResponse: boolean;
        JobControlChecklist: boolean;
        ManageEvents: boolean;
        SSWasteReport: boolean;
        AmenitiesFeedbackForm: boolean;
        IsDailyCleaningDuties: boolean;
        IsResourceRecovery: boolean;
    };
    isAdmin: boolean;
    onToggleChange: (field: string, value: boolean) => void;
}

export const SiteSettingsToggles: React.FC<ISiteSettingsTogglesProps> = ({ toggleValues, isAdmin, onToggleChange }) => {
    return (
        <div className="radioCheckGroup">
            <Toggle label="Periodic" onText="On" offText="Off"
                checked={toggleValues.Periodic}
                onChange={(e, checked) => onToggleChange('Periodic', !!checked)}
            />
            <Toggle label="Help Desk" onText="On" offText="Off"
                checked={toggleValues.HelpDesk}
                onChange={(e, checked) => onToggleChange('HelpDesk', !!checked)}
            />
            <Toggle label="Client Response" onText="On" offText="Off"
                checked={toggleValues.ClientResponse}
                onChange={(e, checked) => onToggleChange('ClientResponse', !!checked)}
            />
            <Toggle label="Monthly KPI" onText="On" offText="Off"
                checked={toggleValues.JobControlChecklist}
                onChange={(e, checked) => onToggleChange('JobControlChecklist', !!checked)}
            />
            <Toggle label="Manage Events" onText="On" offText="Off"
                checked={toggleValues.ManageEvents}
                onChange={(e, checked) => onToggleChange('ManageEvents', !!checked)}
            />
            <Toggle label={WasteReportViewFields.WasteReport}
                onText="On" offText="Off"
                checked={toggleValues.SSWasteReport}
                onChange={(e, checked) => onToggleChange('SSWasteReport', !!checked)}
                disabled={!isAdmin}
            />
            <Toggle label={WasteReportViewFields.AmenitiesFeedbackForm}
                onText="On" offText="Off"
                checked={toggleValues.AmenitiesFeedbackForm}
                onChange={(e, checked) => onToggleChange('AmenitiesFeedbackForm', !!checked)}
                disabled={!isAdmin}
            />
            <Toggle label={WasteReportViewFields.DailyDutiesChecklists}
                onText="On" offText="Off"
                checked={toggleValues.IsDailyCleaningDuties}
                onChange={(e, checked) => onToggleChange('IsDailyCleaningDuties', !!checked)}
                disabled={!isAdmin}
            />
        </div>
    );
};
