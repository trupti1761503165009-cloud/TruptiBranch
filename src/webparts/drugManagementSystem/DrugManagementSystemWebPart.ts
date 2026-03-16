import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import * as strings from 'DrugManagementSystemWebPartStrings';
import { IDrugManagementSystemProps } from './components/IDrugManagementSystemProps';
import Service from '../Service/Service';
import { ICurrentUser } from '../jotai/IcurrentUseratom';
import { IDataProvider } from '../Service/models/IDataProvider';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faTachometerAlt,
  faFileAlt,
  faUser,
  faCogs,
  faClipboardCheck,
  faTools,
  faArrowLeft, faArrowRight, faBars, faCaretDown, faCog, faEye, faFile, faFilePdf, faFileWord, faGear, faEdit, faRotate, faFileUpload, faTrash, faChevronDown, faChevronUp, faPaperclip, faFileExcel, faUserTie, faCheckCircle, faTrashAlt
} from '@fortawesome/free-solid-svg-icons';
import { DrugManagementSystem } from './components/DrugManagementSystem';

library.add(faTachometerAlt,
  faFileAlt,
  faUser,
  faCogs,
  faClipboardCheck,
  faTools,
  faArrowRight, faGear, faBars, faCaretDown, faCog, faEye, faArrowLeft, faFileWord, faFilePdf, faFile, faEdit, faRotate, faFileUpload, faTrash, faChevronDown, faChevronUp, faPaperclip, faFileExcel, faUserTie, faCheckCircle, faTrashAlt)

export interface IDrugManagementSystemWebPartProps {
  description: string;
}

export default class DrugManagementSystemWebPart extends BaseClientSideWebPart<IDrugManagementSystemWebPartProps> {

  private _provider: IDataProvider;
  private _currentUser: ICurrentUser;

  public render(): void {
    const element: React.ReactElement<IDrugManagementSystemProps> = React.createElement(
      DrugManagementSystem,
      {
        description: this.properties.description,
        currentUser: this._currentUser,
        provider: this._provider,
        context: this.context
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onInit(): Promise<void> {
    this._provider = new Service(this.context);
    this._currentUser = {
      displayName: this.context.pageContext.user.displayName,
      userId: this.context.pageContext.legacyPageContext.userId,
      email: this.context.pageContext.user.email,
      loginName: this.context.pageContext.user.loginName,
      isAdmin: this.context.pageContext.legacyPageContext?.isSiteAdmin,
    };
    return super.onInit();
  }


  // private _getEnvironmentMessage(): Promise<string> {
  //   if (!!this.context.sdks.microsoftTeams) { // running in Teams, office.com or Outlook
  //     return this.context.sdks.microsoftTeams.teamsJs.app.getContext()
  //       .then(context => {
  //         let environmentMessage: string = '';
  //         switch (context.app.host.name) {
  //           case 'Office': // running in Office
  //             environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOffice : strings.AppOfficeEnvironment;
  //             break;
  //           case 'Outlook': // running in Outlook
  //             environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOutlook : strings.AppOutlookEnvironment;
  //             break;
  //           case 'Teams': // running in Teams
  //           case 'TeamsModern':
  //             environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentTeams : strings.AppTeamsTabEnvironment;
  //           default:
  //             environmentMessage = strings.UnknownEnvironment;
  //         }

  //         return environmentMessage;
  //       });
  //   }

  //   return Promise.resolve(this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentSharePoint : strings.AppSharePointEnvironment);
  // }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    // this._isDarkTheme = !!currentTheme.isInverted;
    const {
      semanticColors
    } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || null);
      this.domElement.style.setProperty('--link', semanticColors.link || null);
      this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || null);
    }

  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}