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
      const response = await this.doRequest('/api/fetchgraph', `query=${query.queryText}`);
      const nodeFrame = new MutableDataFrame({
        name: 'Nodes',
        refId: query.refId,
        fields: [
          { name: 'id', type: FieldType.string },
          { name: 'title', type: FieldType.string },
          { name: 'subTitle', type: FieldType.string },
          { name: 'detail__role', type: FieldType.string },
          {
            name: 'arc__failed',
            type: FieldType.number,
            config: { color: { fixedColor: 'red', mode: FieldColorModeId.Fixed } },
          },
          {
            name: 'arc__passed',
            type: FieldType.number,
            config: { color: { fixedColor: 'green', mode: FieldColorModeId.Fixed } },
          },
        ],
      });

      const edgeFrame = new MutableDataFrame({
        name: 'Edges',
        refId: query.refId,
        fields: [
          { name: 'id', type: FieldType.string },
          { name: 'source', type: FieldType.string },
          { name: 'target', type: FieldType.string },
          { name: 'mainStat', type: FieldType.string },
          // { name: 'secondaryStat', type: FieldType.number },
        ],
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
    } catch (err:any) {
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
