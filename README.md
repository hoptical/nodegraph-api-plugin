# Nodegraph API Plugin for Grafana

[![Build](https://github.com/grafana/grafana-starter-datasource/workflows/CI/badge.svg)](https://github.com/grafana/grafana-starter-datasource/actions?query=workflow%3A%22CI%22)

This plugin provides a datasource to connect a REST API to [nodegraph](https://grafana.com/docs/grafana/latest/visualizations/node-graph/) panel of Grafana.

![](src/img/graph-example.png)

## What is Grafana Data Source Plugin?

Grafana supports a wide range of data sources, including Prometheus, MySQL, and even Datadog. There’s a good chance you can already visualize metrics from the systems you have set up. In some cases, though, you already have an in-house metrics solution that you’d like to add to your Grafana dashboards. Grafana Data Source Plugins enables integrating such solutions with Grafana.



## Getting started

1. Use Grafana 7.4 or higher

- Download and place the datasouce in grafana/plugins directory.

This plugin is not signed yet, Grafana will not allow loading it by default. you should enable it by adding:

for example, if you are using Grafana with containers, add:

```yaml
-e "GF_PLUGINS_ALLOW_LOADING_UNSIGNED_PLUGINS=hamedkarbasi93-nodegraphapi-datasource"
```

2. You can now add the the data source. Just enter the url of your API app and push "Save & Test". You will get an error in case of connection failure. 

   > Note: The browser should have access to the application not the grafana server.

![](src/img/add-datasource.png)

3. In grafana dashboard, pick the Nodegraph panel and have the graph visualization.

## API Configuration

You REST API application should return data in the following format:

endpoint: `/api/fetchgraph`

content type: `application/json`

Data Format example:

```json
{"edges":[{"id":"1","mainStat":"53/s","source":"1","target":"2"}],"nodes":[{"arc__failed":0.7,"arc__passed":0.3,"detail__zone":"load","id":"1","subTitle":"instance:#2","title":"Service1"},{"arc__failed":0.5,"arc__passed":0.5,"detail__zone":"transform","id":"2","subTitle":"instance:#3","title":"Service2"}]}
```

For more detail of the variables please visit [here](https://grafana.com/docs/grafana/latest/visualizations/node-graph/#data-api).

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

## Learn more

- [Build a data source plugin tutorial](https://grafana.com/tutorials/build-a-data-source-plugin)
- [Grafana documentation](https://grafana.com/docs/)
- [Grafana Tutorials](https://grafana.com/tutorials/) - Grafana Tutorials are step-by-step guides that help you make the most of Grafana
- [Grafana UI Library](https://developers.grafana.com/ui) - UI components to help you build interfaces using Grafana Design System



## Contributing

Thank you for considering contributing! If you find an issue, or have a better way to do something, feel free to open an issue, or a PR.

## License

This repository is open-sourced software licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).

