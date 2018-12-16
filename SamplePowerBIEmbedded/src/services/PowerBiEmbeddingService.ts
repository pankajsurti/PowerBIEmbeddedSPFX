import {
    PowerBiReport,
  }
    from "./../models/PowerBiModels";
  
  import { PowerBiService } from "./PowerBiService";
  
  import * as powerbi from "powerbi-client";
  import * as models from "powerbi-models";
  
  
  export class PowerBiEmbeddingService {

    public static reset(embedContainer: HTMLElement) {
        window.powerbi.reset(embedContainer);
    }


    public static embedReport(report: PowerBiReport, embedContainer: HTMLElement) {

        console.log("embed report");
        console.log(embedContainer);
        
        require('powerbi-models');
        require('powerbi-client');
    
        var config: any = {
          type: 'report',
          id: report.id,
          embedUrl: report.embedUrl,
          accessToken: report.accessToken,
          tokenType: models.TokenType.Aad,
          permissions: models.Permissions.All,
          viewMode: models.ViewMode.View,
          settings: {
            filterPaneEnabled: false,
            navContentPaneEnabled: true,
          }
        };
    
        window.powerbi.reset(embedContainer);
        window.powerbi.embed(embedContainer, config);
      }
      
  }