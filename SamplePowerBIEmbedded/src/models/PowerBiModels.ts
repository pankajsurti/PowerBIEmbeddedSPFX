// The following interface is mapped to the json result of the following call 
// https://docs.microsoft.com/en-us/rest/api/power-bi/groups/getgroups

export interface PowerBiWorkspace {
    id: string;
    name: string;
}
// The following interface is mapped to the json result of the following call 
//https://docs.microsoft.com/en-us/rest/api/power-bi/reports/getreports
export interface PowerBiReport {
    id: string;
    embedUrl: string;
    name: string;
    webUrl: string;
    datasetId: string;
    accessToken: string;
}
// the following is to hold the report array in memory
export interface EmbedResources {
    reports: PowerBiReport[];
}