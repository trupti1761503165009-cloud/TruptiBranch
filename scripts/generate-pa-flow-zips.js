'use strict';

const JSZip = require('jszip');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const OUTPUT_DIR = path.join(__dirname, '..', 'power-automate-flows');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function newGuid() {
  return crypto.randomUUID ? crypto.randomUUID() : ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.randomBytes(1)[0] & 15 >> c / 4).toString(16));
}

const FLOW1_GUID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567801';
const FLOW2_GUID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567802';
const FLOW3_GUID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567803';

const SP_CONN_REF  = 'shared_sharepointonline';
const ADOBE_CONN_REF = 'shared_adobesign';
const OUTLOOK_CONN_REF = 'shared_office365';

function buildManifest(flowName, flowGuid, connectorRefs) {
  const now = new Date().toISOString();
  const resources = {
    [flowGuid]: {
      type: 'Microsoft.Flow/flows',
      id: flowGuid,
      name: flowGuid,
      order: 1,
      displayName: flowName,
      description: '',
      creator: 'N/A',
      suggestedCreationPrecedence: 'New',
      configureAll: false
    }
  };

  connectorRefs.forEach((ref, idx) => {
    resources[ref.id] = {
      type: 'Microsoft.PowerApps/apis/connections',
      id: `/providers/Microsoft.PowerApps/apis/${ref.id}`,
      name: ref.id,
      order: idx + 2,
      displayName: ref.displayName,
      description: ref.description,
      suggestedCreationPrecedence: 'Existing',
      configureAll: false
    };
  });

  return {
    packageSchemaVersion: '1.0',
    packageTelemetryId: newGuid(),
    publisher: 'N/A',
    publisherVersion: '1.0.0.0',
    packageName: flowName,
    packageDescription: '',
    createdTime: now,
    lastModifiedTime: now,
    resources
  };
}

const flow1Definition = {
  $schema: 'https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#',
  contentVersion: '1.0.0.0',
  parameters: {
    $connections: { defaultValue: {}, type: 'Object' },
    $authentication: { defaultValue: {}, type: 'SecureObject' }
  },
  triggers: {
    When_an_item_is_created: {
      type: 'ApiConnection',
      inputs: {
        host: {
          connection: { name: "@parameters('$connections')['shared_sharepointonline']['connectionId']" }
        },
        method: 'get',
        path: '/datasets/@{encodeURIComponent(encodeURIComponent(\'[YOUR_SHAREPOINT_SITE_URL]\'))}/tables/@{encodeURIComponent(encodeURIComponent(\'eSignature\'))}/onnewitems',
        queries: {}
      },
      recurrence: { frequency: 'Minute', interval: 1 },
      splitOn: '@triggerBody()?[\'value\']',
      metadata: {
        operationMetadataId: 'trigger-flow1'
      }
    }
  },
  actions: {
    Condition_SignatureStatus_Pending: {
      type: 'If',
      expression: {
        and: [{
          equals: ["@triggerOutputs()?['body/SignatureStatus']", 'Pending']
        }]
      },
      actions: {
        Get_file_content: {
          type: 'ApiConnection',
          inputs: {
            host: {
              connection: { name: "@parameters('$connections')['shared_sharepointonline']['connectionId']" }
            },
            method: 'get',
            path: "/datasets/@{encodeURIComponent(encodeURIComponent('[YOUR_SHAREPOINT_SITE_URL]'))}/GetFileContentByPath",
            queries: {
              path: "@triggerOutputs()?['body/FilePath']"
            }
          },
          runAfter: {}
        },
        Create_an_agreement: {
          type: 'ApiConnection',
          inputs: {
            host: {
              connection: { name: "@parameters('$connections')['shared_adobesign']['connectionId']" }
            },
            method: 'post',
            path: '/agreements',
            body: {
              name: "@triggerOutputs()?['body/Title']",
              fileInfos: [{
                transientDocumentId: "@outputs('Get_file_content')?['body/$content']",
                name: "@triggerOutputs()?['body/FileName']"
              }],
              signatureType: 'ESIGN',
              state: 'IN_PROCESS',
              participantSetsInfo: [
                {
                  role: 'APPROVER',
                  order: 1,
                  memberInfos: [{
                    email: "@triggerOutputs()?['body/ApproverEmail']"
                  }]
                },
                {
                  role: 'SIGNER',
                  order: 2,
                  memberInfos: [{
                    email: "@triggerOutputs()?['body/SignerEmail']"
                  }]
                }
              ]
            }
          },
          runAfter: {
            Get_file_content: ['Succeeded']
          }
        },
        Update_eSignature_Sent: {
          type: 'ApiConnection',
          inputs: {
            host: {
              connection: { name: "@parameters('$connections')['shared_sharepointonline']['connectionId']" }
            },
            method: 'patch',
            path: "/datasets/@{encodeURIComponent(encodeURIComponent('[YOUR_SHAREPOINT_SITE_URL]'))}/tables/@{encodeURIComponent(encodeURIComponent('eSignature'))}/items/@{encodeURIComponent(triggerOutputs()?['body/ID'])}",
            body: {
              SignatureStatus: 'Sent',
              AgreementId: "@outputs('Create_an_agreement')?['body/id']"
            }
          },
          runAfter: {
            Create_an_agreement: ['Succeeded']
          }
        },
        Get_item: {
          type: 'ApiConnection',
          inputs: {
            host: {
              connection: { name: "@parameters('$connections')['shared_sharepointonline']['connectionId']" }
            },
            method: 'get',
            path: "/datasets/@{encodeURIComponent(encodeURIComponent('[YOUR_SHAREPOINT_SITE_URL]'))}/tables/@{encodeURIComponent(encodeURIComponent('DMS Documents'))}/items/@{encodeURIComponent(triggerOutputs()?['body/DocumentId'])}"
          },
          runAfter: {
            Update_eSignature_Sent: ['Succeeded']
          }
        },
        Update_DMS_IsEmailSend_True: {
          type: 'ApiConnection',
          inputs: {
            host: {
              connection: { name: "@parameters('$connections')['shared_sharepointonline']['connectionId']" }
            },
            method: 'patch',
            path: "/datasets/@{encodeURIComponent(encodeURIComponent('[YOUR_SHAREPOINT_SITE_URL]'))}/tables/@{encodeURIComponent(encodeURIComponent('DMS Documents'))}/items/@{encodeURIComponent(outputs('Get_item')?['body/ID'])}",
            body: {
              IsEmailSend: true
            }
          },
          runAfter: {
            Get_item: ['Succeeded']
          }
        }
      },
      else: {
        actions: {
          Terminate_NotPending: {
            type: 'Terminate',
            inputs: {
              runStatus: 'Cancelled',
              runError: {
                code: '400',
                message: 'SignatureStatus is not Pending — flow terminated.'
              }
            },
            runAfter: {}
          }
        }
      },
      runAfter: {}
    }
  },
  outputs: {}
};

const flow2Definition = {
  $schema: 'https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#',
  contentVersion: '1.0.0.0',
  parameters: {
    $connections: { defaultValue: {}, type: 'Object' },
    $authentication: { defaultValue: {}, type: 'SecureObject' }
  },
  triggers: {
    When_agreement_status_changes: {
      type: 'ApiConnectionWebhook',
      inputs: {
        host: {
          connection: { name: "@parameters('$connections')['shared_adobesign']['connectionId']" }
        },
        path: '/triggers/agreementstatechanged',
        body: {
          agreementState: 'SIGNED'
        }
      },
      metadata: {
        operationMetadataId: 'trigger-flow2'
      }
    }
  },
  actions: {
    Compose_AgreementId: {
      type: 'Compose',
      inputs: "@triggerOutputs()?['body/id']",
      runAfter: {}
    },
    Initialize_variable_varAgreementStatus: {
      type: 'InitializeVariable',
      inputs: {
        variables: [{
          name: 'varAgreementStatus',
          type: 'String',
          value: "@triggerOutputs()?['body/status']"
        }]
      },
      runAfter: {
        Compose_AgreementId: ['Succeeded']
      }
    },
    Condition_AgreementStatus_SIGNED: {
      type: 'If',
      expression: {
        and: [{
          equals: ["@variables('varAgreementStatus')", 'SIGNED']
        }]
      },
      actions: {
        Get_document: {
          type: 'ApiConnection',
          inputs: {
            host: {
              connection: { name: "@parameters('$connections')['shared_adobesign']['connectionId']" }
            },
            method: 'get',
            path: "/agreements/@{outputs('Compose_AgreementId')}/combinedDocument",
            queries: {
              attachSupportingDocuments: false,
              attachAuditReport: false
            }
          },
          runAfter: {}
        },
        'Get_-_eSignature_Record_by_AgreementId': {
          type: 'ApiConnection',
          inputs: {
            host: {
              connection: { name: "@parameters('$connections')['shared_sharepointonline']['connectionId']" }
            },
            method: 'get',
            path: "/datasets/@{encodeURIComponent(encodeURIComponent('[YOUR_SHAREPOINT_SITE_URL]'))}/tables/@{encodeURIComponent(encodeURIComponent('eSignature'))}/items",
            queries: {
              '$filter': "AgreementId eq '@{outputs('Compose_AgreementId')}'",
              '$top': 1
            }
          },
          runAfter: {
            Get_document: ['Succeeded']
          }
        },
        'Compose_-_Signed_File_Name': {
          type: 'Compose',
          inputs: "Signed_@{first(outputs('Get_-_eSignature_Record_by_AgreementId')?['body/value'])?['Title']}_@{utcNow('yyyyMMddHHmmss')}.pdf",
          runAfter: {
            'Get_-_eSignature_Record_by_AgreementId': ['Succeeded']
          }
        },
        'Compose_-_Storage_Folder_Path': {
          type: 'Compose',
          inputs: "/sites/[YOUR_SHAREPOINT_SITE]/Shared Documents/Signed Documents/@{first(outputs('Get_-_eSignature_Record_by_AgreementId')?['body/value'])?['DocumentType']}/@{first(outputs('Get_-_eSignature_Record_by_AgreementId')?['body/value'])?['DrugName']}/@{first(outputs('Get_-_eSignature_Record_by_AgreementId')?['body/value'])?['CTDFolder']}/",
          runAfter: {
            'Compose_-_Signed_File_Name': ['Succeeded']
          }
        },
        'Create_file_-_Signed_Document': {
          type: 'ApiConnection',
          inputs: {
            host: {
              connection: { name: "@parameters('$connections')['shared_sharepointonline']['connectionId']" }
            },
            method: 'post',
            path: "/datasets/@{encodeURIComponent(encodeURIComponent('[YOUR_SHAREPOINT_SITE_URL]'))}/files",
            body: "@outputs('Get_document')?['body/$content']",
            queries: {
              folderPath: "@outputs('Compose_-_Storage_Folder_Path')",
              name: "@outputs('Compose_-_Signed_File_Name')"
            }
          },
          runAfter: {
            'Compose_-_Storage_Folder_Path': ['Succeeded']
          }
        },
        Update_eSignature_Signed: {
          type: 'ApiConnection',
          inputs: {
            host: {
              connection: { name: "@parameters('$connections')['shared_sharepointonline']['connectionId']" }
            },
            method: 'patch',
            path: "/datasets/@{encodeURIComponent(encodeURIComponent('[YOUR_SHAREPOINT_SITE_URL]'))}/tables/@{encodeURIComponent(encodeURIComponent('eSignature'))}/items/@{encodeURIComponent(first(outputs('Get_-_eSignature_Record_by_AgreementId')?['body/value'])?['ID'])}",
            body: {
              SignatureStatus: 'Signed',
              SignatureCompletedOn: "@utcNow()",
              SignedDocumentPath: "@outputs('Create_file_-_Signed_Document')?['body/Path']"
            }
          },
          runAfter: {
            'Create_file_-_Signed_Document': ['Succeeded']
          }
        },
        Get_item: {
          type: 'ApiConnection',
          inputs: {
            host: {
              connection: { name: "@parameters('$connections')['shared_sharepointonline']['connectionId']" }
            },
            method: 'get',
            path: "/datasets/@{encodeURIComponent(encodeURIComponent('[YOUR_SHAREPOINT_SITE_URL]'))}/tables/@{encodeURIComponent(encodeURIComponent('DMS Documents'))}/items/@{encodeURIComponent(first(outputs('Get_-_eSignature_Record_by_AgreementId')?['body/value'])?['DocumentId'])}"
          },
          runAfter: {
            Update_eSignature_Signed: ['Succeeded']
          }
        },
        Update_DMS_Signed: {
          type: 'ApiConnection',
          inputs: {
            host: {
              connection: { name: "@parameters('$connections')['shared_sharepointonline']['connectionId']" }
            },
            method: 'patch',
            path: "/datasets/@{encodeURIComponent(encodeURIComponent('[YOUR_SHAREPOINT_SITE_URL]'))}/tables/@{encodeURIComponent(encodeURIComponent('DMS Documents'))}/items/@{encodeURIComponent(outputs('Get_item')?['body/ID'])}",
            body: {
              Status: 'Signed',
              IsEmailSend: true
            }
          },
          runAfter: {
            Get_item: ['Succeeded']
          }
        }
      },
      else: {
        actions: {
          Terminate_NotSigned: {
            type: 'Terminate',
            inputs: {
              runStatus: 'Cancelled',
              runError: {
                code: '400',
                message: 'Agreement status is not SIGNED — flow terminated.'
              }
            },
            runAfter: {}
          }
        }
      },
      runAfter: {
        Initialize_variable_varAgreementStatus: ['Succeeded']
      }
    }
  },
  outputs: {}
};

const flow3Definition = {
  $schema: 'https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#',
  contentVersion: '1.0.0.0',
  parameters: {
    $connections: { defaultValue: {}, type: 'Object' },
    $authentication: { defaultValue: {}, type: 'SecureObject' }
  },
  triggers: {
    When_an_existing_item_is_modified: {
      type: 'ApiConnection',
      inputs: {
        host: {
          connection: { name: "@parameters('$connections')['shared_sharepointonline']['connectionId']" }
        },
        method: 'get',
        path: "/datasets/@{encodeURIComponent(encodeURIComponent('[YOUR_SHAREPOINT_SITE_URL]'))}/tables/@{encodeURIComponent(encodeURIComponent('DMS Documents'))}/onupdateditems",
        queries: {}
      },
      recurrence: { frequency: 'Minute', interval: 1 },
      splitOn: "@triggerBody()?['value']",
      metadata: {
        operationMetadataId: 'trigger-flow3'
      }
    }
  },
  actions: {
    Condition_IsEmailSend_True: {
      type: 'If',
      expression: {
        and: [{
          equals: ["@triggerOutputs()?['body/IsEmailSend']", true]
        }]
      },
      actions: {
        Switch_on_Status: {
          type: 'Switch',
          expression: "@triggerOutputs()?['body/Status']",
          cases: {
            'Case_Pending_Approval': {
              case: 'Pending Approval',
              actions: {
                Send_email_Pending_Approval: {
                  type: 'ApiConnection',
                  inputs: {
                    host: {
                      connection: { name: "@parameters('$connections')['shared_office365']['connectionId']" }
                    },
                    method: 'post',
                    path: '/v2/Mail',
                    body: {
                      To: "@triggerOutputs()?['body/Approver/Email']",
                      Subject: "Action Required: Document Pending Your Approval — @{triggerOutputs()?['body/Title']}",
                      Body: "<p>Dear @{triggerOutputs()?['body/Approver/DisplayName']},</p><p>A document has been submitted and is awaiting your approval in the Drug Management System (DMS).</p><p><b>Document Details:</b><br/>- Document Name: @{triggerOutputs()?['body/Title']}<br/>- Author: @{triggerOutputs()?['body/Author/DisplayName']}<br/>- Drug / Product: @{triggerOutputs()?['body/Drug/LookupValue']}<br/>- CTD Folder: @{triggerOutputs()?['body/CTDFolder']}<br/>- Submitted On: @{triggerOutputs()?['body/Modified']}</p><p>Please log in to the DMS portal to review and approve or reject the document.</p><p>[Open DMS Portal]</p><p>Regards,<br/>Drug Management System — Automated Notification</p>",
                      Importance: 'Normal',
                      IsHtml: true
                    }
                  },
                  runAfter: {}
                }
              }
            },
            'Case_Approved': {
              case: 'Approved',
              actions: {
                Send_email_Approved: {
                  type: 'ApiConnection',
                  inputs: {
                    host: {
                      connection: { name: "@parameters('$connections')['shared_office365']['connectionId']" }
                    },
                    method: 'post',
                    path: '/v2/Mail',
                    body: {
                      To: "@triggerOutputs()?['body/Author/Email']",
                      Subject: "Your Document Has Been Approved — @{triggerOutputs()?['body/Title']}",
                      Body: "<p>Dear @{triggerOutputs()?['body/Author/DisplayName']},</p><p>Your document has been approved in the Drug Management System (DMS).</p><p><b>Document Details:</b><br/>- Document Name: @{triggerOutputs()?['body/Title']}<br/>- Approved By: @{triggerOutputs()?['body/Approver/DisplayName']}<br/>- Drug / Product: @{triggerOutputs()?['body/Drug/LookupValue']}<br/>- CTD Folder: @{triggerOutputs()?['body/CTDFolder']}<br/>- Approved On: @{triggerOutputs()?['body/Modified']}</p><p>The document is now ready to proceed to the e-signature stage.</p><p>[Open DMS Portal]</p><p>Regards,<br/>Drug Management System — Automated Notification</p>",
                      Importance: 'Normal',
                      IsHtml: true
                    }
                  },
                  runAfter: {}
                }
              }
            },
            'Case_Rejected': {
              case: 'Rejected',
              actions: {
                Send_email_Rejected: {
                  type: 'ApiConnection',
                  inputs: {
                    host: {
                      connection: { name: "@parameters('$connections')['shared_office365']['connectionId']" }
                    },
                    method: 'post',
                    path: '/v2/Mail',
                    body: {
                      To: "@triggerOutputs()?['body/Author/Email']",
                      Subject: "Document Rejected — Action Required: @{triggerOutputs()?['body/Title']}",
                      Body: "<p>Dear @{triggerOutputs()?['body/Author/DisplayName']},</p><p>Unfortunately, your document has been rejected in the Drug Management System (DMS). Please review the comments below and revise accordingly.</p><p><b>Document Details:</b><br/>- Document Name: @{triggerOutputs()?['body/Title']}<br/>- Rejected By: @{triggerOutputs()?['body/Approver/DisplayName']}<br/>- Drug / Product: @{triggerOutputs()?['body/Drug/LookupValue']}<br/>- CTD Folder: @{triggerOutputs()?['body/CTDFolder']}<br/>- Rejected On: @{triggerOutputs()?['body/Modified']}</p><p><b>Reviewer / Approver Comments:</b><br/>@{triggerOutputs()?['body/Comments']}</p><p>Please log in to the DMS portal to revise and resubmit the document.</p><p>[Open DMS Portal]</p><p>Regards,<br/>Drug Management System — Automated Notification</p>",
                      Importance: 'Normal',
                      IsHtml: true
                    }
                  },
                  runAfter: {}
                }
              }
            },
            'Case_Pending_for_Signature': {
              case: 'Pending for Signature',
              actions: {
                Send_email_Pending_for_Signature: {
                  type: 'ApiConnection',
                  inputs: {
                    host: {
                      connection: { name: "@parameters('$connections')['shared_office365']['connectionId']" }
                    },
                    method: 'post',
                    path: '/v2/Mail',
                    body: {
                      To: "@triggerOutputs()?['body/Reviewer/Email']",
                      Cc: "@triggerOutputs()?['body/Approver/Email']",
                      Subject: "Action Required: E-Signature Requested — @{triggerOutputs()?['body/Title']}",
                      Body: "<p>Dear @{triggerOutputs()?['body/Reviewer/DisplayName']},</p><p>An e-signature has been requested for the following document in the Drug Management System (DMS). You will receive a separate email from Adobe Sign with the signing link.</p><p><b>Document Details:</b><br/>- Document Name: @{triggerOutputs()?['body/Title']}<br/>- Initiated By: @{triggerOutputs()?['body/Author/DisplayName']}<br/>- Drug / Product: @{triggerOutputs()?['body/Drug/LookupValue']}<br/>- CTD Folder: @{triggerOutputs()?['body/CTDFolder']}<br/>- Requested On: @{triggerOutputs()?['body/Modified']}</p><p>Please check your email for the Adobe Sign signing request and complete your signature at your earliest convenience.</p><p>[Open DMS Portal]</p><p>Regards,<br/>Drug Management System — Automated Notification</p>",
                      Importance: 'Normal',
                      IsHtml: true
                    }
                  },
                  runAfter: {}
                }
              }
            },
            'Case_Signed': {
              case: 'Signed',
              actions: {
                Send_email_Signed: {
                  type: 'ApiConnection',
                  inputs: {
                    host: {
                      connection: { name: "@parameters('$connections')['shared_office365']['connectionId']" }
                    },
                    method: 'post',
                    path: '/v2/Mail',
                    body: {
                      To: "@triggerOutputs()?['body/Author/Email']",
                      Cc: "@triggerOutputs()?['body/Approver/Email']",
                      Subject: "Document Signed Successfully — @{triggerOutputs()?['body/Title']}",
                      Body: "<p>Dear @{triggerOutputs()?['body/Author/DisplayName']},</p><p>All required signatures have been collected for the following document. The signed PDF has been automatically saved to the Signed Documents library.</p><p><b>Document Details:</b><br/>- Document Name: @{triggerOutputs()?['body/Title']}<br/>- Drug / Product: @{triggerOutputs()?['body/Drug/LookupValue']}<br/>- CTD Folder: @{triggerOutputs()?['body/CTDFolder']}<br/>- Signed On: @{triggerOutputs()?['body/Modified']}<br/>- Signed By: @{triggerOutputs()?['body/Reviewer/DisplayName']}</p><p>The document has been filed under:<br/>Signed Documents / @{triggerOutputs()?['body/CTDFolder']}</p><p>[Open DMS Portal]</p><p>Regards,<br/>Drug Management System — Automated Notification</p>",
                      Importance: 'Normal',
                      IsHtml: true
                    }
                  },
                  runAfter: {}
                }
              }
            },
            'Case_Final': {
              case: 'Final',
              actions: {
                Send_email_Final: {
                  type: 'ApiConnection',
                  inputs: {
                    host: {
                      connection: { name: "@parameters('$connections')['shared_office365']['connectionId']" }
                    },
                    method: 'post',
                    path: '/v2/Mail',
                    body: {
                      To: "@triggerOutputs()?['body/Author/Email']",
                      Cc: "@{triggerOutputs()?['body/Reviewer/Email']}; @{triggerOutputs()?['body/Approver/Email']}",
                      Subject: "Document Finalized — @{triggerOutputs()?['body/Title']}",
                      Body: "<p>Dear @{triggerOutputs()?['body/Author/DisplayName']},</p><p>The following document has been finalized in the Drug Management System (DMS) and is now available in the Signed Documents library for reference.</p><p><b>Document Details:</b><br/>- Document Name: @{triggerOutputs()?['body/Title']}<br/>- Drug / Product: @{triggerOutputs()?['body/Drug/LookupValue']}<br/>- CTD Folder: @{triggerOutputs()?['body/CTDFolder']}<br/>- Finalized On: @{triggerOutputs()?['body/Modified']}</p><p>No further action is required. The signed and finalized document has been filed in the DMS repository.</p><p>[Open DMS Portal]</p><p>Regards,<br/>Drug Management System — Automated Notification</p>",
                      Importance: 'Normal',
                      IsHtml: true
                    }
                  },
                  runAfter: {}
                }
              }
            }
          },
          default: {
            actions: {}
          },
          runAfter: {}
        },
        Reset_IsEmailSend_False: {
          type: 'ApiConnection',
          inputs: {
            host: {
              connection: { name: "@parameters('$connections')['shared_sharepointonline']['connectionId']" }
            },
            method: 'patch',
            path: "/datasets/@{encodeURIComponent(encodeURIComponent('[YOUR_SHAREPOINT_SITE_URL]'))}/tables/@{encodeURIComponent(encodeURIComponent('DMS Documents'))}/items/@{encodeURIComponent(triggerOutputs()?['body/ID'])}",
            body: {
              IsEmailSend: false
            }
          },
          runAfter: {
            Switch_on_Status: ['Succeeded', 'Skipped']
          }
        }
      },
      else: {
        actions: {
          Terminate_EmailSendFalse: {
            type: 'Terminate',
            inputs: {
              runStatus: 'Cancelled',
              runError: {
                code: '400',
                message: 'IsEmailSend is not true — flow terminated.'
              }
            },
            runAfter: {}
          }
        }
      },
      runAfter: {}
    }
  },
  outputs: {}
};

const flows = [
  {
    name: 'DMS - Adobe Sign Implementation',
    guid: FLOW1_GUID,
    zipName: 'Flow1-DMS-Adobe-Sign-Implementation.zip',
    definition: flow1Definition,
    connectors: [
      { id: SP_CONN_REF, displayName: 'SharePoint', description: 'SharePoint Online connection (configure during import)' },
      { id: ADOBE_CONN_REF, displayName: 'Adobe Acrobat Sign', description: 'Adobe Acrobat Sign connection (configure during import)' }
    ]
  },
  {
    name: 'DMS - Adobe Auto Save Signed Document',
    guid: FLOW2_GUID,
    zipName: 'Flow2-DMS-Adobe-Auto-Save-Signed-Document.zip',
    definition: flow2Definition,
    connectors: [
      { id: SP_CONN_REF, displayName: 'SharePoint', description: 'SharePoint Online connection (configure during import)' },
      { id: ADOBE_CONN_REF, displayName: 'Adobe Acrobat Sign', description: 'Adobe Acrobat Sign connection (configure during import)' }
    ]
  },
  {
    name: 'DMS - Status Email Notification',
    guid: FLOW3_GUID,
    zipName: 'Flow3-DMS-Status-Email-Notification.zip',
    definition: flow3Definition,
    connectors: [
      { id: SP_CONN_REF, displayName: 'SharePoint', description: 'SharePoint Online connection (configure during import)' },
      { id: OUTLOOK_CONN_REF, displayName: 'Office 365 Outlook', description: 'Office 365 Outlook connection (configure during import)' }
    ]
  }
];

function buildConnectionReferences(connectors) {
  const refs = {};
  connectors.forEach(ref => {
    refs[ref.id] = {
      connectionName: ref.id,
      source: 'NotSpecified',
      id: `/providers/Microsoft.PowerApps/apis/${ref.id}`,
      tier: 'Standard',
      apiTier: 'Standard',
      isCustomApiConnection: false
    };
  });
  return refs;
}

async function generateZip(flow) {
  const zip = new JSZip();

  const manifest = buildManifest(flow.name, flow.guid, flow.connectors);
  zip.file('manifest.json', JSON.stringify(manifest, null, 2));

  const wrappedDefinition = {
    properties: {
      connectionReferences: buildConnectionReferences(flow.connectors),
      definition: flow.definition,
      parameters: {}
    }
  };

  const definitionPath = `Microsoft.Flow/flows/${flow.guid}/definition.json`;
  zip.file(definitionPath, JSON.stringify(wrappedDefinition, null, 2));

  const content = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  const outPath = path.join(OUTPUT_DIR, flow.zipName);
  fs.writeFileSync(outPath, content);
  console.log(`Created: ${outPath}`);

  const check = await JSZip.loadAsync(content);
  const files = Object.keys(check.files);
  console.log(`  Contents: ${files.join(', ')}`);
  return outPath;
}

(async () => {
  console.log('Generating Power Automate flow ZIP packages...\n');
  for (const flow of flows) {
    await generateZip(flow);
  }
  console.log('\nAll done. Import each ZIP via Power Automate → My Flows → Import → Import Package (Legacy).');
  console.log('Replace all [YOUR_SHAREPOINT_SITE_URL] and [YOUR_SHAREPOINT_SITE] placeholders after import.');
})();
