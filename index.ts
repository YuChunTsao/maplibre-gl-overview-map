import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import OverviewMapControl from './src/maplibre-gl-overview-map'

let map = new maplibregl.Map({
  container: 'map',
  style: 'https://yuchuntsao.github.io/simple-vector-tiles/style.json',
  center: [0, 0],
  zoom: 4
})

map.addControl(new maplibregl.NavigationControl(), 'bottom-right')

map.addControl(new OverviewMapControl())
