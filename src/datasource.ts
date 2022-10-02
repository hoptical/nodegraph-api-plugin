import defaults from 'lodash/defaults';
import _ from 'lodash';
import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  MutableDataFrame,
  FieldType,
  FieldColorModeId,
} from '@grafana/data';

import { getBackendSrv } from '@grafana/runtime';

import { getTemplateSrv } from '@grafana/runtime';

import { MyQuery, MyDataSourceOptions, defaultQuery } from './types';

// proxy route
const routePath = '/nodegraphds';

export class DataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
  url: string;
  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);

    // proxy url
    this.url = instanceSettings.url || '';
  }

  async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
    const promises = options.targets.map(async target => {
      const query = defaults(target, defaultQuery);
      const dataQuery = getTemplateSrv().replace(query.queryText, options.scopedVars);
      // fetch graph fields from api
      const fieldApiUrlPath = getTemplateSrv().replace(query.fieldApiUrlPath, options.scopedVars);
      const responseGraphFields = await this.doRequest(`${fieldApiUrlPath}`, `${dataQuery}`);
      // fetch graph data from api
      const dataApiUrlPath = getTemplateSrv().replace(query.dataApiUrlPath, options.scopedVars);
      const responseGraphData = await this.doRequest(`${dataApiUrlPath}`, `${dataQuery}`);
      // extract fields of the nodes and edges in the graph fields object
      const nodeFieldsResponse = responseGraphFields.data.nodes_fields;
      const edgeFieldsResponse = responseGraphFields.data.edges_fields;
      // Define an interface for types of the FrameField
      interface FrameFieldType {
        name: string;
        type: any;
        config: Record<string, any>;
      }
      // This function gets the fields of the api and transforms them to what grafana dataframe prefers
      function fieldAssignator(FieldsResponse: any): FrameFieldType[] {
        var outputFields: FrameFieldType[] = [];
        FieldsResponse.forEach((field: any) => {
          // fieldType can be either number of string
          var fieldType = field['type'] === 'number' ? FieldType.number : FieldType.string;
          // add 'name' and 'type' items to the output object
          var outputField: FrameFieldType = { name: field['field_name'], type: fieldType, config: {} };
          // add color for 'arc__*' items(only apperas for the nodes)
          if ('color' in field) {
            outputField.config.color = { fixedColor: field['color'], mode: FieldColorModeId.Fixed };
          }
          // add disPlayName for 'detail__*' items
          if ('displayName' in field) {
            outputField.config.displayName = field['displayName'];
          }
          outputFields.push(outputField);
        });
        return outputFields;
      }
      // Define Frames Meta Data
      const frameMetaData: any = { preferredVisualisationType: 'nodeGraph' };
      // Extract node fields
      const nodeFields: FrameFieldType[] = fieldAssignator(nodeFieldsResponse);
      // Create nodes dataframe
      const nodeFrame = new MutableDataFrame({
        name: 'Nodes',
        refId: query.refId,
        fields: nodeFields,
        meta: frameMetaData,
      });
      // Extract edge fields
      const edgeFields: FrameFieldType[] = fieldAssignator(edgeFieldsResponse);
      // Create Edges dataframe
      const edgeFrame = new MutableDataFrame({
        name: 'Edges',
        refId: query.refId,
        fields: edgeFields,
        meta: frameMetaData,
      });
      // Extract graph data of the related api response
      const nodes = responseGraphData.data.nodes;
      const edges = responseGraphData.data.edges;
      // add nodes to the node dataframe
      nodes.forEach((node: any) => {
        nodeFrame.add(node);
      });
      // add edges to the edges dataframe
      edges.forEach((edge: any) => {
        edgeFrame.add(edge);
      });
      return [nodeFrame, edgeFrame];
    });

    return Promise.all(promises).then(data => ({ data: data[0] }));
  }
  async doRequest(endpoint: string, params?: string) {
    // Do the request on proxy; the server will replace url + routePath with the url
    // defined in plugin.json
    const result = getBackendSrv().datasourceRequest({
      method: 'GET',
      url: `${this.url}${routePath}${endpoint}${params?.length ? `?${params}` : ''}`,
    });
    return result;
  }

  /**
   * Checks whether we can connect to the API.
   */
  async testDatasource() {
    const defaultErrorMessage = 'Cannot connect to API';
    try {
      const response = await this.doRequest('/api/health');
      if (response.status === 200) {
        return {
          status: 'success',
          message: 'Success',
        };
      } else {
        return {
          status: 'error',
          message: response.statusText ? response.statusText : defaultErrorMessage,
        };
      }
    } catch (err) {
      if (_.isString(err)) {
        return {
          status: 'error',
          message: err,
        };
      } else {
        let message = '';
        message += err.statusText ? err.statusText : defaultErrorMessage;
        if (err.data && err.data.error && err.data.error.code) {
          message += ': ' + err.data.error.code + '. ' + err.data.error.message;
        }

        return {
          status: 'error',
          message,
        };
      }
    }
  }
}
