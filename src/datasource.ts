//import defaults from 'lodash/defaults';

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

import { MyQuery, MyDataSourceOptions } from './types';

export class DataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
  resolution: number;
  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);

    this.resolution = instanceSettings.jsonData.resolution || 1000.0;
  }

  async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
    //const { range } = options;
    //const from = range!.from.valueOf();
    //const to = range!.to.valueOf();
    // duration of the time range, in milliseconds.
    //const duration = to - from;
    // step determines how close in time (ms) the points will be to each other.
    //const step = duration / this.resolution;
    // Return a constant for each query.
    const promises = options.targets.map(query =>
      this.doRequest(query).then(response => {
        //const data = options.targets.flatMap(target => {
        //const query = defaults(target, defaultQuery);
        const nodeFrame = new MutableDataFrame({
          name: 'Nodes',
          refId: query.refId,
          fields: [
            //{ name: 'Time', values: [from, to], type: FieldType.time },
            //{ name: 'Value', values: [query.constant, query.constant], type: FieldType.number },
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
        return nodeFrame;
        //return [nodeFrame, edgeFrame];
        //return { data: [nodeFrame, edgeFrame] } as DataQueryResponse;
      })
    );
    return Promise.all(promises).then(data => ({ data }));
    //return { data };
  }
  async doRequest(query: MyQuery) {
    const result = await getBackendSrv().datasourceRequest({
      method: 'GET',
      url: 'http://localhost:5000',
      params: query,
    });

    return result;
  }

  async testDatasource() {
    // Implement a health check for your data source.
    return {
      status: 'success',
      message: 'Success',
    };
  }
}
