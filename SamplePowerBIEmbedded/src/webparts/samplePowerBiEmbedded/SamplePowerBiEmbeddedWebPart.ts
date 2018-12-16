import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneDropdown,
  IPropertyPaneDropdownOption
} from '@microsoft/sp-webpart-base';

import { PowerBiWorkspace, PowerBiReport } from './../../models/PowerBiModels';
import { PowerBiService } from './../../services/PowerBiService';
import { PowerBiEmbeddingService } from './../../services/PowerBiEmbeddingService';
import { Log } from '@microsoft/sp-core-library';

import * as strings from 'SamplePowerBiEmbeddedWebPartStrings';
import SamplePowerBiEmbedded from './components/SamplePowerBiEmbedded';
import { ISamplePowerBiEmbeddedProps } from './components/ISamplePowerBiEmbeddedProps';

export interface ISamplePowerBiEmbeddedWebPartProps {
  description: string;
  workspaceId: string;
  reportId: string;
}

export default class SamplePowerBiEmbeddedWebPart extends BaseClientSideWebPart<ISamplePowerBiEmbeddedWebPartProps> {

  private workspaceOptions: IPropertyPaneDropdownOption[];
  private workspacesFetched: boolean = false;
  private reportOptions: IPropertyPaneDropdownOption[];
  private reportsFetched: boolean = false;  

  private fetchWorkspaceOptions(): Promise<IPropertyPaneDropdownOption[]> {
    Log.info("SamplePbiEmbeddedWebPartWebPart", "fetchWorkspaceOptions", this.context.serviceScope);
    return PowerBiService.GetWorkspaces(this.context)
      .then((workspaces: PowerBiWorkspace[]) => {
        var options: Array<IPropertyPaneDropdownOption> = new Array<IPropertyPaneDropdownOption>();
        workspaces.map((workspace: PowerBiWorkspace) => {
          options.push({ key: workspace.id, text: workspace.name });
        });
        return options;
      })
      .catch (error => {
        console.error(error);
        return null;
      });
  }

  private fetchReportOptions(): Promise<IPropertyPaneDropdownOption[]> {
    Log.info("SamplePbiEmbeddedWebPartWebPart", "fetchReportOptions", this.context.serviceScope);
    return PowerBiService.GetReports(this.context, this.properties.workspaceId)
      .then((workspaces: PowerBiWorkspace[]) => {
          var options: Array<IPropertyPaneDropdownOption> = new Array<IPropertyPaneDropdownOption>();
          workspaces.map((report: PowerBiReport) => {
            options.push({ key: report.id, text: report.name });
          });
          return options;
      })
      .catch (error => {
        console.error(error);
        return null;
      });
  }


  public render(): void {

    if (this.properties.workspaceId === "") {
      this.domElement.innerHTML = "<div class='message-container'>Select a workspace from the web part property pane</div>";
    }
    else {
      if (this.properties.reportId === "") {
        this.domElement.innerHTML = "<div class='message-container'>Select a report from the web part property pane</div>";
      }
      else {

        // here we go
        this.context.statusRenderer.displayLoadingIndicator(this.domElement, 'Calling Power BI Service API to get report info');

        PowerBiService.GetReport(this.context, this.properties.workspaceId, this.properties.reportId)
          .then(
            (report: PowerBiReport) => {
              this.context.statusRenderer.clearLoadingIndicator(this.domElement);
              this.domElement.style.height = "480px";
              PowerBiEmbeddingService.embedReport(report, this.domElement);
          })
          .catch (error => {
            console.error(error);
            this.domElement.innerHTML = "<div class='message-container'>" + error + "</div>";
          });
      }
    }
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected onPropertyPaneConfigurationStart(): void {
    Log.info("SamplePbiEmbeddedWebPartWebPart", "onPropertyPaneConfigurationStart 1", this.context.serviceScope);

    if (this.workspacesFetched && this.reportsFetched) {
      Log.info("SamplePbiEmbeddedWebPartWebPart", "onPropertyPaneConfigurationStart 2", this.context.serviceScope);
      return;
    }

    if (this.workspacesFetched && !this.reportsFetched) {
      Log.info("SamplePbiEmbeddedWebPartWebPart", "onPropertyPaneConfigurationStart 3", this.context.serviceScope);
      this.context.statusRenderer.displayLoadingIndicator(this.domElement, 'Calling Power BI Service API to get reports');
      this.fetchReportOptions().then((options: IPropertyPaneDropdownOption[]) => {
        Log.info("SamplePbiEmbeddedWebPartWebPart", "onPropertyPaneConfigurationStart 4", this.context.serviceScope);
        this.reportOptions = options;
        this.reportsFetched = true;
        this.context.propertyPane.refresh();
        this.context.statusRenderer.clearLoadingIndicator(this.domElement);
        this.render();
      });
      return;
    }

    Log.info("SamplePbiEmbeddedWebPartWebPart", "onPropertyPaneConfigurationStart 5", this.context.serviceScope);
    this.context.statusRenderer.displayLoadingIndicator(this.domElement, 'Calling Power BI Service API to get workspaces');

    Log.info("SamplePbiEmbeddedWebPartWebPart", "onPropertyPaneConfigurationStart 6", this.context.serviceScope);
    this.fetchWorkspaceOptions().then((options: IPropertyPaneDropdownOption[]) => {
      Log.info("SamplePbiEmbeddedWebPartWebPart", "onPropertyPaneConfigurationStart 7", this.context.serviceScope);
      this.workspaceOptions = options;
      this.workspacesFetched = true;
      this.context.propertyPane.refresh();
      this.context.statusRenderer.clearLoadingIndicator(this.domElement);
      this.render();
    }).catch(function(e) {
      Log.info("SamplePbiEmbeddedWebPartWebPart", "onPropertyPaneConfigurationStart 8", this.context.serviceScope);
      console.log(e);
    });
  }

  protected onPropertyPaneFieldChanged(propertyPath: string, oldValue: any, newValue: any): void {
    super.onPropertyPaneFieldChanged(propertyPath, oldValue, newValue);

    if (propertyPath === 'workspaceId' && newValue) {
      console.log("Workspace ID updated: " + newValue);
      // reset report settings
      this.properties.reportId = "";
      this.reportOptions = [];
      this.reportsFetched = false;
      // refresh the item selector control by repainting the property pane
      this.context.propertyPane.refresh();
      // communicate loading items
      this.context.statusRenderer.displayLoadingIndicator(this.domElement, 'Calling Power BI Service API to get reports');
      this.fetchReportOptions().then((options: IPropertyPaneDropdownOption[]) => {
        console.log("report options fetched");
        console.log(options);
        this.reportOptions = options;
        this.reportsFetched = true;
        this.context.propertyPane.refresh();
        this.context.statusRenderer.clearLoadingIndicator(this.domElement);
        this.render();
      });
    }

    if (propertyPath === 'reportId' && newValue) {
      this.render();
    }
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
            },
            {
              groupName: "Power BI Configuration",
              groupFields: [
                PropertyPaneDropdown(
                  "workspaceId", {
                    label: "Select a Workspace",
                    options: this.workspaceOptions,
                    disabled: !this.workspacesFetched
                  }),
                PropertyPaneDropdown(
                  "reportId", {
                    label: "Select a Report",
                    options: this.reportOptions,
                    disabled: !this.reportsFetched
                  })
              ]
            }
          ]
        }
      ]
    };
  }
}
