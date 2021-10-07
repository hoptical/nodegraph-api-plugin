import defaults from 'lodash/defaults';

import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  MutableDataFrame,
  FieldType,
  FieldColorModeId,
} from '@grafana/data';

import { MyQuery, MyDataSourceOptions, defaultQuery } from './types';

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
    const data = options.targets.flatMap(target => {
      const query = defaults(target, defaultQuery);
      const nodeFrame = new MutableDataFrame({
        name: 'Nodes',
        refId: query.refId,
        fields: [
          //{ name: 'Time', values: [from, to], type: FieldType.time },
          //{ name: 'Value', values: [query.constant, query.constant], type: FieldType.number },
          { name: 'id', values: ['1', '2'], type: FieldType.string },
          { name: 'title', values: ['Hamed', 'Mohsen'], type: FieldType.string },
          { name: 'subTitle', values: ['Karbasi', 'Khazeni'], type: FieldType.string },
          { name: 'detail__role', values: ['CTO', 'PO'], type: FieldType.string },
          {
            name: 'arc__failed',
            values: [0.7, 0.3],
            type: FieldType.number,
            config: { color: { fixedColor: 'red', mode: FieldColorModeId.Fixed } },
          },
          {
            name: 'arc__passed',
            values: [0.3, 0.7],
            type: FieldType.number,
            config: { color: { fixedColor: 'green', mode: FieldColorModeId.Fixed } },
          },
          // { name: 'time', type: FieldType.time },
          // { name: 'value', type: FieldType.number },
        ],
      });

      const edgeFrame = new MutableDataFrame({
        name: 'Edges',
        refId: query.refId,
        fields: [
          { name: 'id', values: ['1'], type: FieldType.string },
          { name: 'source', values: ['1'], type: FieldType.string },
          { name: 'target', values: ['2'], type: FieldType.string },
          { name: 'mainStat', values: ['50/s'], type: FieldType.string },
          { name: 'secondaryStat', values: [120], type: FieldType.number },
          { name: 'detail__type', values: ['REST'], type: FieldType.string },
        ],
      });
      //edgeFrame.meta.preferredVisualisationType = 'table'
      // for (let t = 0; t < duration; t += step) {
      //   frame.add({ time: from + t, value: Math.sin((2 * Math.PI * query.frequency * t) / duration) });
      // }
      return [nodeFrame, edgeFrame];
    });

    return { data };
  }

  async testDatasource() {
    // Implement a health check for your data source.
    return {
      status: 'success',
      message: 'Success',
    };
  }
}
