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

  render() {
    const query = defaults(this.props.query, defaultQuery);
    const { queryText } = query;
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
      </div>
    );
  }
}
