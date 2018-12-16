import {
    PowerBiWorkspace,
    PowerBiReport,
  }
from "./../models/PowerBiModels";

import { AadHttpClient, HttpClientResponse } from '@microsoft/sp-http';
import { ServiceKey, ServiceScope } from '@microsoft/sp-core-library';

import { Log } from '@microsoft/sp-core-library';


import * as powerbi from 'powerbi-client';
import * as pbimodels from 'powerbi-models';
import { WebPartContext } from '@microsoft/sp-webpart-base';

import { IPowerBiElement } from 'service';

require('powerbi-models');
require('powerbi-client');

export class PowerBiService {

    private static powerbiApiResourceId = "https://analysis.windows.net/powerbi/api"; 
    
    private static workspacesUrl = "https://api.powerbi.com/v1.0/myorg/groups/"; 
    private static adalAccessTokenStorageKey: string = "adal.access.token.key" + PowerBiService.powerbiApiResourceId;

    public static GetWorkspaces = (context: WebPartContext): Promise<PowerBiWorkspace[]> => {
      console.log("PowerBiService.GetWorkspaces 1");
      var reqHeaders: HeadersInit = new Headers();
      reqHeaders.append("Accept", "*");
      return context.aadHttpClientFactory
        .getClient(PowerBiService.powerbiApiResourceId)
        .then((pbiClient: AadHttpClient) => {
          // get the workspaces
          console.log("PowerBiService.GetWorkspaces 2");
          return pbiClient
            .get(
              PowerBiService.workspacesUrl,
              AadHttpClient.configurations.v1,
              { headers: reqHeaders }
            )
            .then((response: HttpClientResponse): Promise<any> => {
              console.log("PowerBiService.GetWorkspaces 3");
              return response.json();
            })
            .then((workspacesOdataResult: any): PowerBiWorkspace[] => {
              console.log("PowerBiService.GetWorkspaces 4");
              return workspacesOdataResult.value;
          })
      });
    }
    public static GetReports = (context: WebPartContext, workspaceId: string): Promise<PowerBiReport[]> => {
      console.log("PowerBiService.GetReports 1");
      let reportsUrl = PowerBiService.workspacesUrl + workspaceId + "/reports/";
      var reqHeaders: HeadersInit = new Headers();
      reqHeaders.append("Accept", "*");
      return context.aadHttpClientFactory
        .getClient(PowerBiService.powerbiApiResourceId)
        .then((pbiClient: AadHttpClient) => {
          console.log("PowerBiService.GetReports 2");
          // get the reports
          return pbiClient
            .get(
              reportsUrl,
              AadHttpClient.configurations.v1,
              { headers: reqHeaders }
            )
            .then((response: HttpClientResponse): Promise<any> => {
              console.log("PowerBiService.GetWorkspaces 3" + response.statusText );
              return response.json();
            })
            .then((reportsOdataResult: any): PowerBiReport[] => {
              console.log("PowerBiService.GetReports 4");
              return reportsOdataResult.value.map((report: PowerBiReport) => {
                console.log("PowerBiService.GetReports 5" + report.name + " " + report.id);
                return {
                  id: report.id,
                  embedUrl: report.embedUrl,
                  name: report.name,
                  webUrl: report.webUrl,
                  datasetId: report.datasetId,
                  accessToken: window.sessionStorage[PowerBiService.adalAccessTokenStorageKey]
                };
              });
            });
      });
    }
    public static GetReport = (context: WebPartContext, workspaceId: string, reportId: string): Promise<PowerBiReport> => {
      console.log("PowerBiService.GetReport 1");
      let reportUrl = PowerBiService.workspacesUrl + workspaceId + "/reports/" + reportId + "/";
      var reqHeaders: HeadersInit = new Headers();
      reqHeaders.append("Accept", "*");
      return context.aadHttpClientFactory
        .getClient(PowerBiService.powerbiApiResourceId)
        .then( (pbiClient: AadHttpClient) => {
          console.log("PowerBiService.GetReport 2");
          // get the reports
          return pbiClient
            .get(
              reportUrl,
              AadHttpClient.configurations.v1,
              { headers: reqHeaders }
            )
            .then((response: HttpClientResponse): Promise<any> => {
              console.log("PowerBiService.GetReport 3");
              return response.json();
            })
            .then((reportsOdataResult: any): PowerBiReport => {
              console.log("PowerBiService.GetReport 4");
              return {
                id: reportsOdataResult.id,
                embedUrl: reportsOdataResult.embedUrl,
                name: reportsOdataResult.name,
                webUrl: reportsOdataResult.webUrl,
                datasetId: reportsOdataResult.datasetId,
                accessToken: window.sessionStorage[PowerBiService.adalAccessTokenStorageKey]
              };
        });
      });     
    }
}