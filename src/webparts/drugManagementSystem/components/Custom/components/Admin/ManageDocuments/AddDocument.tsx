import * as React from 'react';
import { CreateDocumentPage } from '../CreateDocumentPage/CreateDocumentPage';
import { Breadcrumb } from '../../../../Common/Breadcrumb/Breadcrumb';
import { useSetAtom } from 'jotai';
import { appGlobalStateAtom } from '../../../../../jotai/appGlobalStateAtom';

export const AddDocument: React.FC<any> = (props) => {
    const setAppGlobalState = useSetAtom(appGlobalStateAtom);

    React.useEffect(() => {
        setAppGlobalState(prev => ({ ...prev, isSidebarHidden: true }));
        return () => {
            setAppGlobalState(prev => ({ ...prev, isSidebarHidden: false }));
        };
    }, [setAppGlobalState]);

    const handleCancel = () => {
        props.manageComponentView?.({ currentComponentName: '' });
    };

    return (
        <div className="manage-templates-wrapper" data-testid="add-document-page">
            {/* ── Breadcrumb ───────────────────────────────────── */}
            <div className="customebreadcrumb" style={{ marginBottom: 12 }}>
                <Breadcrumb
                    items={[
                        { label: 'Home', onClick: () => { } },
                        { label: 'Manage Documents', onClick: handleCancel },
                        { label: 'Create New Document', isActive: true }
                    ]}
                />
            </div>

            {/* ── Page Title ───────────────────────────────────── */}
            <div style={{ marginBottom: 20 }}>
                <h1 className="mainTitle" style={{ margin: 0 }}>Create New Document</h1>
                <p style={{ margin: '4px 0 0', color: '#757575', fontSize: 13 }}>
                    Fill in the details below. The document will be created from the selected template and saved as a Draft.
                </p>
            </div>

            {/* ── Form ─────────────────────────────────────────── */}
            <CreateDocumentPage
                onCancel={handleCancel}
                onSuccess={handleCancel}
            />
        </div>
    );
};
