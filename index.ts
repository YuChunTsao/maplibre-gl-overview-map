import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import OverviewMapControl from "./src/maplibre-gl-overview-map";

let map = new maplibregl.Map({
  container: "map",
  style: "https://yuchuntsao.github.io/simple-vector-tiles/style.json",
  center: [0, 0],
  zoom: 4,
});

// Default style
const defaultOverviewMapControl = new OverviewMapControl();
map.addControl(defaultOverviewMapControl);

// Custom style
const customOverviewMapControl = new OverviewMapControl({
  mapContainerId: "custom-overview-map-id",
  customClassName: "custom-overview-map-style",
  mapStyle: {
    version: 8,
    name: "Natural Earth Vector Tile",
    metadata: {},
    center: [0, 0],
    zoom: 0,
    bearing: 0,
    pitch: 0,
    sources: {
      tiles: {
        type: "vector",
        tiles: [
          "https://yuchuntsao.github.io/simple-vector-tiles/tiles/{z}/{x}/{y}.pbf",
        ],
        maxzoom: 2,
        minzoom: 0,
      },
    },
    layers: [
      {
        id: "countries",
        type: "fill",
        source: "tiles",
        "source-layer": "countries",
        paint: {
          "fill-color": "rgba(243, 243, 243, 1)",
          "fill-outline-color": "rgba(195, 195, 195, 0.5)",
        },
      },
    ],
  },
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
});

map.addControl(customOverviewMapControl, "top-left");

map.addControl(new maplibregl.NavigationControl(), "bottom-right");
