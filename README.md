# maplibre-gl-overview-map

The plugin is designed to provide users with a high-level spatial perspective when working with Maplibre GL JS. This feature allows you to include a simplified, smaller-scale map alongside your primary map, offering valuable context and aiding in navigation.

[Demo](https://yuchuntsao.github.io/maplibre-gl-overview-map/)

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Options](#Options)
- [Customization](#customization)

## Installation

```bash
npm install maplibre-gl-overview-map
```

## Usage

```javascript
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import OverviewMapControl from "./maplibre-gl-overview-map";

let map = new maplibregl.Map({
  container: "map",
  style: "https://yuchuntsao.github.io/simple-vector-tiles/style.json",
  center: [0, 0],
  zoom: 4,
});

map.addControl(new OverviewMapControl());
```

## Options

```javascript
// default options
{
  mapContainerId: 'maplibre-gl-overview-map',
  mapStyle: '',
  zoomOffset: 4,
  customClassName: '',
  allowRotate: true,
  box: {
    sourceName: 'maplibre-gl-overview-map-box-source',
    outlineLayerId: 'maplibre-gl-overview-map-box-outline-layer',
    fillLayerId: 'maplibre-gl-overview-map-box-fill-layer',
    fillStyle: {
    'fill-color': 'red',
    'fill-opacity': 0.1,
    },
    outlineStyle: {
    'line-color': 'red',
    'line-width': 1.5,
    'line-opacity': 0.5,
    },
  }
}
```

## Customization

```javascript
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import OverviewMapControl from "./maplibre-gl-overview-map";

let map = new maplibregl.Map({
  container: "map",
  style: "https://yuchuntsao.github.io/simple-vector-tiles/style.json",
  center: [0, 0],
  zoom: 4,
});

map.addControl(
  new OverviewMapControl({
    mapContainerId: "custom-overview-map-id",
    customClassName: classes["custom-overview-map-style"],
    mapStyle: "https://demotiles.maplibre.org/style.json",
    zoomOffset: 4,
    allowRotate: true,
    box: {
      sourceName: "Custom Box Source Name",
      outlineLayerId: "Custom Box Outline Layer Id",
      fillLayerId: "Custom Box Fill Layer Id",
      fillStyle: {
        "fill-color": "#6995FA",
        "fill-opacity": 0.2,
      },
      outlineStyle: {
        "line-color": "#3E55C5",
        "line-width": ["interpolate", ["linear"], ["zoom"], 0, 2, 10, 4],
        "line-dasharray": [2, 2],
        "line-opacity": 0.7,
      },
    },
  }),
  "top-left",
);
```

## Development

```bash
pnpm install
pnpm run dev
```

## Build package

```bash
pnpm run build-lib
```

## License

This plugin is open-source and released under the MIT License.
