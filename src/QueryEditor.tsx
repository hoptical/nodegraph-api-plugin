import defaults from 'lodash/defaults';

import React, { ChangeEvent, PureComponent } from 'react';
import { LegacyForms } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from './datasource';
import { defaultQuery, MyDataSourceOptions, MyQuery } from './types';

const { FormField } = LegacyForms;

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

export class QueryEditor extends PureComponent<Props> {
  onQueryTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, queryText: event.target.value });
  };

  onFieldApiUrlPathChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, fieldApiUrlPath: event.target.value });
  };

  onDataApiUrlPathChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, dataApiUrlPath: event.target.value });
  };

  render() {
    const query = defaults(this.props.query, defaultQuery);
    const { queryText, fieldApiUrlPath, dataApiUrlPath } = query;
    return (
      <div className="gf-form">
        <FormField
          labelWidth={8}
          inputWidth={20}
          value={queryText || ''}
          onChange={this.onQueryTextChange}
          label="Query String"
          tooltip="The query string for data endpoint of the node graph api; i.e. /api/graph/data?query=sometext"
        />
        <FormField
          labelWidth={8}
          inputWidth={20}
          value={fieldApiUrlPath || '/api/graph/field'}
          onChange={this.onFieldApiUrlPathChange}
          label="Field Endpoint"
          tooltip="The field endpoint of the node graph api"
        />
        <FormField
          labelWidth={8}
          inputWidth={20}
          value={dataApiUrlPath || '/api/graph/data'}
          onChange={this.onDataApiUrlPathChange}
          label="Data Endpoint"
          tooltip="The data endpoint of the node graph api"
        />
      </div>
    );
  }
}
