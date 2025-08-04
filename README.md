> **⚠️ This project is archived!**
>
> This plugin is no longer maintained and is archived in favor of the [Infinity plugin](https://grafana.com/grafana/plugins/yesoreyeram-infinity-datasource/), which is a much better and more flexible option for connecting REST APIs to Grafana.
>
> To visualize node graphs using Infinity, refer to the official documentation:  
> [Using Node Graph with Infinity](https://grafana.com/docs/plugins/yesoreyeram-infinity-datasource/latest/references/display-options/node-graph/)
>
> We highly recommend migrating to Infinity for new and existing dashboards.

# Nodegraph API Plugin for Grafana

[![License](https://img.shields.io/github/license/hoptical/nodegraph-api-plugin)](LICENSE)
[![CI](https://github.com/hoptical/nodegraph-api-plugin/actions/workflows/ci.yml/badge.svg)](https://github.com/hoptical/nodegraph-api-plugin/actions/workflows/ci.yml)
[![Release](https://github.com/hoptical/nodegraph-api-plugin/actions/workflows/release.yml/badge.svg)](https://github.com/hoptical/nodegraph-api-plugin/actions/workflows/release.yml)

This plugin provides a data source to connect a REST API to [nodegraph](https://grafana.com/docs/grafana/latest/visualizations/node-graph/) panel of Grafana. It is [signed and published by Grafana](https://grafana.com/grafana/plugins/hamedkarbasi93-nodegraphapi-datasource/).

![Graph Example](https://raw.githubusercontent.com/hoptical/nodegraph-api-plugin/f447b74ecefd827b388e791a34792730e9a9a11d/src/img/graph-example.png)

## Requirements
- **Grafana 7.5+**

## Getting started

### Installation via grafana-cli tool

Use the grafana-cli tool to install Node Graph API from the commandline:

```bash
grafana-cli plugins install hamedkarbasi93-nodegraphapi-datasource
```

The plugin will be installed into your grafana plugins directory; the default is `/var/lib/grafana/plugins`. [More information on the cli tool](https://grafana.com/docs/grafana/latest/administration/cli/#plugins-commands).

### Installation via zip file

Alternatively, you can manually download the [latest](https://github.com/hoptical/nodegraph-api-plugin/releases/latest) release .zip file and unpack it into your grafana plugins directory; the default is `/var/lib/grafana/plugins`.

### Plugin Configuration

You can now add the data source. Just enter the URL of your API app and push "Save & Test." You will get an error in case of connection failure.

![Add Datasource](https://raw.githubusercontent.com/hoptical/nodegraph-api-plugin/f447b74ecefd827b388e791a34792730e9a9a11d/src/img/add-datasource.png)

In the Grafana dashboard, pick the Nodegraph panel and visualize the graph.

> Note on Application Access: 
> - Versions 0.x.x work in *direct* mode. i.e., The browser must have access to the API application.
> - Versions 1.x.x+ work in *proxy* mode. i.e., The Grafana server should have access to the API application.

## API Configuration

The REST API application should handle three requests: *fields*, *data*, and *health*. They are described below.

### Fetch Graph Fields

This route returns the nodes and edges fields defined in the [parameter tables](https://grafana.com/docs/grafana/latest/visualizations/node-graph/#data-api).
It would help the plugin to create desired parameters for the graph.
For nodes, `id` and for edges, `id`, `source`, and `target` fields are required. Other fields are optional.

endpoint: `/api/graph/fields`

method: `GET`

content type: `application/json`

content format example:

```json
{
  "edges_fields": [
    {
      "field_name": "id",
      "type": "string"
    },
    {
      "field_name": "source",
      "type": "string"
    },
    {
      "field_name": "target",
      "type": "string"
    },
    {
      "field_name": "mainStat",
      "type": "number"
    }
  ],
  "nodes_fields": [
    {
      "field_name": "id",
      "type": "string"
    },
    {
      "field_name": "title",
      "type": "string"
    },
    {
      "field_name": "mainStat",
      "type": "string"
    },
    {
      "field_name": "secondaryStat",
      "type": "number"
    },
    {
      "color": "red",
      "field_name": "arc__failed",
      "type": "number"
    },
    {
      "color": "green",
      "field_name": "arc__passed",
      "type": "number"
    },
    {
      "displayName": "Role",
      "field_name": "detail__role",
      "type": "string"
    }
  ]
}
```

### Fetch Graph Data

This route returns the graph data, which is intended to visualize.

endpoint: `/api/graph/data`

method: `GET`

content type: `application/json`

Data Format example:

```json
{
    "edges": [
        {
            "id": "1",
            "mainStat": "53/s",
            "source": "1",
            "target": "2"
        }
    ],
    "nodes": [
        {
            "arc__failed": 0.7,
            "arc__passed": 0.3,
            "detail__zone": "load",
            "id": "1",
            "subTitle": "instance:#2",
            "title": "Service1"
        },
        {
            "arc__failed": 0.5,
            "arc__passed": 0.5,
            "detail__zone": "transform",
            "id": "2",
            "subTitle": "instance:#3",
            "title": "Service2"
        }
    ]
}
```

For more detail of the variables, please visit [here](https://grafana.com/docs/grafana/latest/visualizations/node-graph/#data-api).

### Health

This route is for testing the health of the API, which is used by the *Save & Test* action while adding the plugin.[(Part 2 of the Getting Started Section)](#getting-started).
Currently, it only needs to return the `200` status code in case of a successful connection.

endpoint: `/api/health`

method: `GET`

success status code: `200`

## API Example

In the `example` folder, you can find a simple API application in Python Flask.

### Requirements:

- flask

### Run

```bash
python run.py
```
The application will be started on `http://localhost:5000`

## Query Configuration
You can pass a query string to apply for the data endpoint of the graph via *Query String*. Like any other query, you can utilize variables too:

 ![Add Datasource](https://raw.githubusercontent.com/hoptical/nodegraph-api-plugin/22a1933b1e012602c817817f4583697e25028382/src/img/query-string.png)

 With variable `$service` defined as `processors`, above query will produce this endpoint:
 `/api/graph/data?query=text1&service=processors`
## Compiling the data source by yourself

1. Install dependencies

   ```bash
   yarn install
   ```

2. Build plugin in development mode or run in watch mode

   ```bash
   yarn dev
   ```

   or

   ```bash
   yarn watch
   ```

3. Build plugin in production mode

   ```bash
   yarn build
   ```

## Roadmap

- [x] Utilize BackenSrv in proxy mode. This will prevent the client browser necessity to connect to the API server.
- [ ] Write unit tests.

## Learn more

- [Build a data source plugin tutorial](https://grafana.com/tutorials/build-a-data-source-plugin)
- [Grafana documentation](https://grafana.com/docs/)
- [Grafana Tutorials](https://grafana.com/tutorials/) - Grafana Tutorials are step-by-step guides that help you make the most of Grafana
- [Grafana UI Library](https://developers.grafana.com/ui) - UI components to help you build interfaces using Grafana Design System

## Contributing

Thank you for considering contributing! If you find an issue or have a better way to do something, feel free to open an issue or a PR.

## License

This repository is open-sourced software licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).
