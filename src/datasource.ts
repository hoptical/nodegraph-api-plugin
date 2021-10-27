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

import { MyQuery, MyDataSourceOptions, defaultQuery } from './types';

export class DataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
  baseUrl: string;
  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);
  
    this.baseUrl = instanceSettings.jsonData.baseUrl || '';
  }

  async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
    const promises = options.targets.map(async target => {
      const query = defaults(target, defaultQuery);
      const responseFields = await this.doRequest('/api/graph/fields', `query=${query.queryText}`);
      const response = await this.doRequest('/api/graph/data', `query=${query.queryText}`);
      const nodeFieldsResponse = responseFields.data.nodes_fields;
      const edgeFieldsResponse = responseFields.data.edges_fields;
      interface FrameFieldType {
        name: string;
        type: any;
        config?: any;
      }
      function fieldAssignator(FieldsResponse: any): FrameFieldType[] {
        var outputFields: FrameFieldType[] = [];
        FieldsResponse.forEach((field: any) => {
          var fieldType = field['type'] === 'number' ? FieldType.number : FieldType.string;
          var outputField: FrameFieldType = { name: field['field_name'], type: fieldType };
          if ('color' in field) {
            outputField.config = { color: { fixedColor: field['color'], mode: FieldColorModeId.Fixed } };
          }
          if ('displayName' in field) {
            outputField.config = { displayName: field['displayName'] };
          }
          outputFields.push(outputField);
        });
        return outputFields;
      }
      const nodeFields: FrameFieldType[] = fieldAssignator(nodeFieldsResponse);
      const nodeFrame = new MutableDataFrame({
        name: 'Nodes',
        refId: query.refId,
        fields: nodeFields,
      });
      const edgeFields: FrameFieldType[] = fieldAssignator(edgeFieldsResponse);
      const edgeFrame = new MutableDataFrame({
        name: 'Edges',
        refId: query.refId,
        fields: edgeFields,
        //  [] { name: 'id', type: FieldType.string },
        //   { name: 'source', type: FieldType.string },
        //   { name: 'target', type: FieldType.string },
        //   { name: 'mainStat', type: FieldType.string },
        //   // { name: 'secondaryStat', type: FieldType.number },
        // ],
      });
      const nodes = response.data.nodes;
      const edges = response.data.edges;
      nodes.forEach((node: any) => {
        nodeFrame.add(node);
      });
      edges.forEach((edge: any) => {
        edgeFrame.add(edge);
      });
      return [nodeFrame, edgeFrame];
    });

    return Promise.all(promises).then(data => ({ data: data[0] }));
  }
  async doRequest(endpoint: string, params?: string) {
    const result = await getBackendSrv().datasourceRequest({
      method: 'GET',
      url: `${this.baseUrl}${endpoint}${params?.length ? `?${params}` : ''}`,
    });

    return result;
  }

  /**
   * Checks whether we can connect to the API.
   */
  async testDatasource() {
    const defaultErrorMessage = 'Cannot connect to API';
    try {
      const response = await this.doRequest('/health');
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
