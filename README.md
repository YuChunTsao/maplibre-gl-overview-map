# maplibre-gl-overview-map

![npm](https://img.shields.io/npm/v/maplibre-gl-overview-map)
![GitHub](https://img.shields.io/github/license/YuChunTsao/maplibre-gl-overview-map)
![GitHub Workflow Status (with event)](https://img.shields.io/github/actions/workflow/status/YuChunTsao/maplibre-gl-overview-map/deploy.yml)

The **maplibre-gl-overview-map** plugin is designed to provide users with a high-level spatial perspective when working with Maplibre GL JS. This feature allows you to include a simplified, smaller-scale map alongside your primary map, offering valuable context and aiding in navigation.

[Live example](https://yuchuntsao.github.io/maplibre-gl-overview-map/)

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Options](#options)
- [Development](#development)
- [Build](#build)
- [License](#license)

## Installation

```bash
npm install maplibre-gl-overview-map
```

## Usage

### When using modules

```javascript
import { Map } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

import OverviewMapControl from 'maplibre-gl-overview-map'
import 'maplibre-gl-overview-map/dist/maplibre-gl-overview-map.css'
```

### When using a CDN

```html
<script src="https://unpkg.com/maplibre-gl/dist/maplibre-gl.js"></script>
<script src="https://unpkg.com/maplibre-gl-overview-map@1.0.4/dist/maplibre-gl-overview-map.umd.js"></script>
<link
  href="https://unpkg.com/maplibre-gl/dist/maplibre-gl.css"
  rel="stylesheet"
/>
<link
  href="https://unpkg.com/maplibre-gl-overview-map@1.0.4/dist/maplibre-gl-overview-map.css"
  rel="stylesheet"
/>
```

### Example Usage

```javascript
let map = new Map({
  container: 'map',
  style: 'https://yuchuntsao.github.io/simple-vector-tiles/style.json',
  center: [0, 0],
  zoom: 4
})

map.addControl(new OverviewMapControl())
```

[Live example](https://yuchuntsao.github.io/maplibre-gl-overview-map/) | [code](examples/index.html)

If you want to customize the overview map control, you can see the [custom example](examples/custom.html) or read the document about [options](#options).

## Options

All of the following options are optional.

| Attribute       | Type                           | Default                      | Description                                                                                                 |
| --------------- | ------------------------------ | ---------------------------- | ----------------------------------------------------------------------------------------------------------- |
| mapContainerId  | `string`                       | `'maplibre-gl-overview-map'` | The map id for overview map container.                                                                      |
| mapStyle        | `StyleSpecification \| string` | `''`                         | The style for overview map. If the mapStyle is empty, it will use the style of primary map.                 |
| zoomOffset      | `number`                       | `4`                          | The zoom level offset between primary map and overview map.                                                 |
| customClassName | `string`                       | `''`                         | You can specific custom css style for the container of control. See [custom example](examples/custom.html). |
| allowRotate     | `Boolean`                      | `true`                       | Allow the overview map can rotate when the primary map rotated.                                             |
| box             | `object`                       | [Box](#box-options)          | The option is a object about the source, layer and style of the box on the overview map.                    |

### Box Options

| Attribute      | Type     | Default                                                       | Description                                                                                                                               |
| -------------- | -------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| sourceName     | `string` | `maplibre-gl-overview-map-box-source`                         | The box source name.                                                                                                                      |
| outlineLayerId | `string` | `maplibre-gl-overview-map-box-outline-layer`                  | The box outline layer id.                                                                                                                 |
| fillLayerId    | `string` | `maplibre-gl-overview-map-box-fill-layer`                     | The box fill layer id.                                                                                                                    |
| fillStyle      | `object` | `{'fill-color': 'red','fill-opacity': 0.1}`                   | The style of the fill layer. You can override the default style with [MapLibre Style Spec](https://maplibre.org/maplibre-style-spec/).    |
| outlineStyle   | `object` | `{'line-color': 'red','line-width': 1.5,'line-opacity': 0.5}` | The style of the outline layer. You can override the default style with [MapLibre Style Spec](https://maplibre.org/maplibre-style-spec/). |

## Development

```bash
pnpm install
pnpm run dev
```

## Build

Build library

```bash
pnpm run release
```

Build example

```bash
pnpm run build
```

## License

This plugin is open-source and released under the MIT License.
