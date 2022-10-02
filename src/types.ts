import { DataQuery, DataSourceJsonData } from '@grafana/data';

export interface MyQuery extends DataQuery {
  queryText?: string;
  fieldApiUrlPath: string;
  dataApiUrlPath: string;
}

export const defaultQuery: Partial<MyQuery> = {
  fieldApiUrlPath: '/api/graph/fields',
  dataApiUrlPath: '/api/graph/data',
};

/**
 * These are options configured for each DataSource instance
 */
export interface MyDataSourceOptions extends DataSourceJsonData {
  url: string;
}

/**
 * Value that is used in the backend, but never sent over HTTP to the frontend
 */
export interface MySecureJsonData {}
