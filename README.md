# Power BI Embedded Deep Dive

The following steps will guide you to build **Power BI Embedded** SPFx Web Part. 


## Getting started with writing SPFx for Power BI Embedded

### What is needed first?

Just start with very simple [Getting Started SPFx web part](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/get-started/build-a-hello-world-web-part).

### Steps 

#### Step#1: Install 'powerbi-client' npm package

Run the following command to install [powerbi-client](https://www.npmjs.com/package/powerbi-client)

`npm install powerbi-client -D`

#### Step#2: Power BI Service Permission request

Open the project in VS Code 
Under the config folder open package-solution.json & add following

	"webApiPermissionRequests": [
      {
        "resource": "Power BI Service",
        "scope": "Group.Read.All"
      },
      {
        "resource": "Power BI Service",
        "scope": "Dataset.Read.All"
      },
      {
        "resource": "Power BI Service",
        "scope": "Report.Read.All"
      },
      {
        "resource": "Power BI Service",
        "scope": "Dashboard.Read.All"
      }
    ]

The above permissions are required. After deploying the web these permission must be approved by global tenant admin. Please refer [here](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/use-aadhttpclient#manage-permission-requests) for more information.

#### Step#3: Add models directory to the src
Create 'models' folder under src 
	Copy PowerBiModels.ts file from [here](https://github.com/pankajsurti/PowerBIEmbeddedSPFX/blob/master/SamplePowerBIEmbedded/src/models/PowerBiModels.ts). The file has following three interfaces.
PowerBiWorkspace, PowerBiReport & PowerBiReport. The purpose of first two interfaces to hold the JSON response from the REST call to Power BI API Service.


#### Step#4: Add services directory to the src
- Copy PowerBiService.ts file from [here](https://github.com/pankajsurti/PowerBIEmbeddedSPFX/blob/master/SamplePowerBIEmbedded/src/services/PowerBiService.ts)

- Copy PowerBiEmbeddingService.ts file from [here](https://github.com/pankajsurti/PowerBIEmbeddedSPFX/blob/master/SamplePowerBIEmbedded/src/services/PowerBiEmbeddingService.ts)

- **What is in PowerBiService.ts?**

	This file acts as a service for making a call to Power BI Service. It has three methods GetWorkspaces, GetReports & GetReport. All three methods expects the WebPartContext to create [AADHttpClient](https://spblog.net/post/2018/07/21/Call-Azure-AD-secured-API-from-your-SPFx-code-Story-1-use-cookie-authentication) class. These methods makes call to REST service.

[Get work spaces in the org](https://docs.microsoft.com/en-us/rest/api/power-bi/groups/getgroups)
		

			
		REST API: https://api.powerbi.com/v1.0/myorg/groups/{GroupID}/reports/
		GetWorkspaces use the above API call returns following values. It maps to populate PowerBiWorkspace 
		 {
		  "value": [
			{
			  "datasetId": "cfafbeb1-8037-4d0c-896e-a46fb27ff229",
			  "id": "5b218778-e7a5-4d73-8187-f10824047715",
			  "name": "SalesMarketing",
			  "webUrl": "https://app.powerbi.com//reports/5b218778-e7a5-4d73-8187-f10824047715",
			  "embedUrl": "https://app.powerbi.com/reportEmbed?reportId=5b218778-e7a5-4d73-8187-f10824047715"
			}
		  ]
		}
				
		

[Get reports by work space](https://docs.microsoft.com/en-us/rest/api/power-bi/reports/getreports)



		REST API: https://api.powerbi.com/v1.0/myorg/groups/{GroupID}/reports/
		GetReports use the above API call returns following values. It maps to populate PowerBiReport  
		{
		  "value": [
			{
			  "datasetId": "cfafbeb1-8037-4d0c-896e-a46fb27ff229",
			  "id": "5b218778-e7a5-4d73-8187-f10824047715",
			  "name": "SalesMarketing",
			  "webUrl": "https://app.powerbi.com//reports/5b218778-e7a5-4d73-8187-f10824047715",
			  "embedUrl": "https://app.powerbi.com/reportEmbed?reportId=5b218778-e7a5-4d73-8187-f10824047715"
			}
		  ]
		}
	


[Get a report by work space and report Ids](https://docs.microsoft.com/en-us/rest/api/power-bi/reports/getreport)


		https://api.powerbi.com/v1.0/myorg/groups/{GroupID}/reports/{ReportID}
		REST API: GetReport use the above API call with the following return values. It maps to populate PowerBiReport  
		For the above API call the following is the return values in JSON object
		{
		  "datasetId": "cfafbeb1-8037-4d0c-896e-a46fb27ff229",
		  "id": "5b218778-e7a5-4d73-8187-f10824047715",
		  "name": "SalesMarketing",
		  "webUrl": "https://app.powerbi.com//reports/5b218778-e7a5-4d73-8187-f10824047715",
		  "embedUrl": "https://app.powerbi.com/reportEmbed?reportId=5b218778-e7a5-4d73-8187-f10824047715"
		}	
			


- **What is in PowerBiEmbeddingService.ts?**

This file has one method 'embedReport'. It constructs config for powerbi-client and calls embed method with the config.
 

    public static embedReport(report: PowerBiReport, embedContainer: HTMLElement) {
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

#### Step#5: Time to modify the 

Copy SamplePowerBiEmbeddedWebPart file from [here](https://github.com/pankajsurti/PowerBIEmbeddedSPFX/blob/master/SamplePowerBIEmbedded/src/webparts/samplePowerBiEmbedded/SamplePowerBiEmbeddedWebPart.ts)

**Explanation of Web Part Code**

- Import PropertyPaneDropdown in the 
- The 'onPropertyPaneConfigurationStart' method is called for pane initialization during web part edit. The first steps is to check whether workspaces and reports being fetched. If not call method 'fetchWorkspaceOptions'. 
- The 'fetchWorkspaceOptions' method makes the call to the 'PowerBiService.GetWorkspaces'. 
- The same pattern is followed to get the reports for an user selected work space.
- Once user makes the selection for the work space and report in the pane. The final call is to hand over to the render which in turn calls the 'PowerBiEmbeddingService.embed'.
- The pane is using the cascading drop down. Please refer [Use cascading dropdowns in web part properties](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/guidance/use-cascading-dropdowns-in-web-part-properties) 
for more details.


## Reference

**The following link will explain further the AADHttpClient. **

[Connect to Azure AD-secured APIs in SharePoint Framework solutions](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/use-aadhttpclient#manage-permission-requests)

**The following link has the URLs for the sovereign clouds such as Government Community Cloud (GCC) etc. **

[Tutorial: Embed a Power BI dashboard, tile, or report into your application for sovereign clouds](https://docs.microsoft.com/en-us/power-bi/developer/embed-sample-for-customers-sovereign-clouds)


