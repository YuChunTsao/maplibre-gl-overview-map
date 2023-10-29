import {
  IControl,
  LngLatBoundsLike,
  LngLat,
  Map,
  StyleSpecification,
  PointLike,
  GeoJSONSource,
  MapMouseEvent,
  Listener,
} from "maplibre-gl";
import classes from "./maplibre-gl-overview-map.module.css";

const TILE_SIZE: number = 512;
const EQUATORIAL_RADIUS: number = 6378137.0; // 6378.137 km
const DISTANCE_PER_PIXEL: number =
  (2 * Math.PI * EQUATORIAL_RADIUS) / TILE_SIZE;
const MAX_LAT: number = 85.05112878;

class Box {
  public width: number = 0;
  public height: number = 0;
  public center: LngLat = new LngLat(0, 0);
  public source: GeoJSONSource | undefined;
  public feature: GeoJSON.Feature | undefined;

  // Below variables user can change the value
  public sourceName: string = "maplibre-gl-overview-map-box-source";
  public outlineLayerId: string = "maplibre-gl-overview-map-box-outline-layer";
  public fillLayerId: string = "maplibre-gl-overview-map-box-fill-layer";
  // Allow user can use mapbox style to set complex style.
  public fillStyle: object = {
    "fill-color": "red",
    "fill-opacity": 0.1,
  };
  public outlineStyle: object = {
    "line-color": "red",
    "line-width": 1.5,
    "line-opacity": 0.5,
  };
}

type Options = {
  mapContainerId: string;
  mapStyle: StyleSpecification | string;
  zoomOffset: number;
  customClassName: string;
  allowRotate: Boolean;
  box: object;
};

class OverviewMapControl implements IControl {
  private overviewMap: Map | undefined;
  private parentMap: Map | undefined;

  private container: HTMLElement | undefined;

  private isDragging: Boolean = false;
  private isOverBox: Boolean = false;
  private previousPoint: LngLat = new LngLat(0, 0);
  private currentPoint: LngLat = new LngLat(0, 0);

  private box: Box = new Box();
  private options: Options = {
    mapContainerId: "maplibre-gl-overview-map",
    mapStyle: "",
    zoomOffset: 4,
    customClassName: "",
    allowRotate: true,
    box: this.box,
  };

  private initOverviewMap: Listener | undefined;
  private updateOverviewCenter: Listener | undefined;
  private updateBox: Listener | undefined;
  private updateOverviewBearing: Listener | undefined;
  private updateOverviewZoom: Listener | undefined;
  private overviewOnLoad: Listener | undefined;
  private overviewOnMouseMove: Listener | undefined;
  private overviewOnMouseUp: Listener | undefined;
  private overviewOnMouseDown: Listener | undefined;

  constructor(options?: Options) {
    if (options) {
      Object.assign(this.options, options);
      Object.assign(this.box, this.options.box);
    }
  }

  onAdd(map: Map): HTMLElement {
    this.parentMap = map;

    this.container = this.createOverviewContainer();

    this.initParentMapEvent();
    this.initGlobalEvent();

    return this.container;
  }

  initGlobalEvent() {
    document.addEventListener("mouseup", this.detectMouseUpOutside.bind(this));
  }

  detectMouseUpOutside() {
    // If user mouse up and out of overview map container, update overview map and parent map center.
    if (this.isDragging) {
      if (this.overviewMap === undefined) {
        throw new Error("The overview map object is undefined");
      }

      if (this.parentMap === undefined) {
        throw new Error("The parent map object is undefined");
      }

      this.parentMap.setCenter(this.box.center);
      this.overviewMap.setCenter(this.box.center);
      this.isDragging = false;
      this.isOverBox = false;
    }
  }

  initParentMapEvent() {
    if (this.parentMap === undefined) {
      throw new Error("The parent map object is undefined");
    }

    this.initOverviewMap = this._initOverviewMap.bind(this);
    this.updateOverviewCenter = this._updateOverviewCenter.bind(this);
    this.updateOverviewBearing = this._updateOverviewBearing.bind(this);
    this.updateOverviewZoom = this._updateOverviewZoom.bind(this);
    this.updateBox = this._updateBox.bind(this);

    this.parentMap.on("load", this.initOverviewMap);
    this.parentMap.on("move", this.updateOverviewCenter);
    this.parentMap.on("move", this.updateOverviewBearing);
    this.parentMap.on("move", this.updateBox);
    this.parentMap.on("zoom", this.updateBox);
    this.parentMap.on("zoom", this.updateOverviewZoom);
  }

  _updateOverviewCenter(e: MapMouseEvent): void {
    if (this.overviewMap === undefined) {
      throw new Error("The overview map object is undefined");
    }

    let center = e.target.getCenter();
    this.overviewMap.setCenter(center);
  }

  _updateOverviewZoom(e: MapMouseEvent): void {
    if (this.overviewMap === undefined) {
      throw new Error("The overview map object is undefined");
    }

    let zoom = e.target.getZoom() - this.options.zoomOffset;
    this.overviewMap.setZoom(zoom);
  }

  _updateOverviewBearing(): void {
    if (this.overviewMap === undefined) {
      throw new Error("The overview map object is undefined");
    }

    if (this.parentMap === undefined) {
      throw new Error("The parent map object is undefined");
    }

    // Allow overview map rotate with parent map
    if (this.options.allowRotate) {
      let bearing = this.parentMap.getBearing();
      this.overviewMap.setBearing(bearing);
    }
  }

  _initOverviewMap(): void {
    // If the map style without setting with user, get the style of parent map.
    if (this.options.mapStyle === "") {
      if (this.parentMap === undefined) {
        throw new Error("The parent map object is undefined.");
      }
      this.options.mapStyle = this.parentMap.getStyle();
    }

    this.createOverviewMapObject();

    this.initOverviewMapEvent();
  }

  createOverviewMapObject(): void {
    this.overviewMap = new Map({
      attributionControl: false,
      container: this.options.mapContainerId,
      style: this.options.mapStyle,
      interactive: false,
    });
  }

  initOverviewMapEvent() {
    if (this.overviewMap === undefined) {
      throw new Error("The overview map object is undefined.");
    }

    this.overviewOnLoad = this._overviewOnLoad.bind(this);
    this.overviewOnMouseMove = this._overviewOnMouseMove.bind(this);
    this.overviewOnMouseUp = this._overviewOnMouseUp.bind(this);
    this.overviewOnMouseDown = this._overviewOnMouseDown.bind(this);

    this.overviewMap.on("load", this.overviewOnLoad);
    this.overviewMap.on("mousemove", this.overviewOnMouseMove);
    this.overviewMap.on("mouseup", this.overviewOnMouseUp);
    this.overviewMap.on("mousedown", this.overviewOnMouseDown);
  }

  _overviewOnLoad(): void {
    if (this.parentMap === undefined) {
      throw new Error("The parent map object is undefined.");
    }

    if (this.overviewMap === undefined) {
      throw new Error("The overview map object is undefined.");
    }

    let initZoom = this.parentMap.getZoom() - this.options.zoomOffset;
    this.overviewMap.setZoom(initZoom);

    let initCenter = this.parentMap.getCenter();
    this.overviewMap.setCenter(initCenter);

    this.initBox();
    this._updateBox();
  }

  _overviewOnMouseDown(e: MapMouseEvent & Object) {
    if (this.isOverBox) {
      this.isDragging = true;
      this.previousPoint = e.lngLat;
    }
  }

  _overviewOnMouseUp(e: MapMouseEvent & Object) {
    if (this.parentMap === undefined) {
      throw new Error("The parent map object is undefined.");
    }

    if (this.overviewMap === undefined) {
      throw new Error("The overview map object is undefined.");
    }

    if (this.isDragging) {
      // parentMap onMove will update overview map center
      this.parentMap.setCenter(this.box.center);
    }

    this.isDragging = false;

    let features = this.overviewMap.queryRenderedFeatures(e.point, {
      layers: [this.box.fillLayerId],
    });

    this.isOverBox = features.length > 0;

    // Update cursor style when hover the box layer.
    this.updateCursor();
  }

  _overviewOnMouseMove(e: MapMouseEvent & Object) {
    if (this.overviewMap === undefined) {
      throw new Error("The overview map is undefined.");
    }

    const fillLayer = this.overviewMap.getLayer(this.box.fillLayerId);
    if (fillLayer === undefined) return;

    let features = this.overviewMap.queryRenderedFeatures(e.point, {
      layers: [this.box.fillLayerId],
    });

    this.isOverBox = features.length > 0;

    // Update cursor style when hover the box layer.
    this.updateCursor();

    if (this.isDragging) {
      this.currentPoint = e.lngLat;
      let offset = new LngLat(
        this.currentPoint.lng - this.previousPoint.lng,
        this.currentPoint.lat - this.previousPoint.lat,
      );

      // update box center
      let newLng = this.box.center.lng + offset.lng;
      let newLat = this.box.center.lat + offset.lat;

      // Avoid set invalid value for LngLat
      if (newLat > MAX_LAT) newLat = MAX_LAT;
      if (newLat < -MAX_LAT) newLat = -MAX_LAT;
      this.box.center = new LngLat(newLng, newLat);

      this.previousPoint = this.currentPoint;

      this.box.feature = this.createBoxGeoJSON(
        this.box.center,
        this.box.width,
        this.box.height,
      );

      if (this.box.source === undefined) {
        throw new Error("The box source is undefined.");
      }
      this.box.source.setData(this.box.feature);
    }
  }

  updateCursor() {
    if (this.overviewMap === undefined) {
      throw new Error("The overview map object is undefined.");
    }

    this.overviewMap.getCanvasContainer().style.cursor = this.isOverBox
      ? "move"
      : "";
  }

  _updateBox() {
    if (this.parentMap === undefined) {
      throw new Error("The parent map object is undefined.");
    }

    if (this.overviewMap === undefined) {
      throw new Error("The overview map object is undefined.");
    }

    if (this.box.source === undefined) {
      this.box.source = this.overviewMap.getSource(
        this.box.sourceName,
      ) as GeoJSONSource;
      return;
    }

    let overviewMapLat = this.overviewMap.getCenter().lat;
    let parentMapZoom = this.parentMap.getZoom();
    let overviewMapZoom = this.overviewMap.getZoom();

    // Use the latitude of overview map to calculate resolution in different zoom level.
    // Use the same latitude, so we can know the ratio between two map.
    let parentMapResolution = this.calculateResolution(
      overviewMapLat,
      parentMapZoom,
    );
    let overviewResolution = this.calculateResolution(
      overviewMapLat,
      overviewMapZoom,
    );

    let mapCanvas = this.parentMap.getCanvas();

    let mapWidth = mapCanvas.clientWidth;
    let mapHeight = mapCanvas.clientHeight;

    this.box.width = (mapWidth * parentMapResolution) / overviewResolution;
    this.box.height = (mapHeight * parentMapResolution) / overviewResolution;

    this.box.center = this.parentMap.getCenter();

    // Fix longitude boundary issue (world copy)
    this.fixLngBoundary(this.box.center);

    this.box.feature = this.createBoxGeoJSON(
      this.box.center,
      this.box.width,
      this.box.height,
    );

    if (this.box.source === undefined) {
      throw new Error("The box source is undefined.");
    }

    this.box.source.setData(this.box.feature);
  }

  createBoxGeoJSON(
    center: LngLat,
    width: number,
    height: number,
  ): GeoJSON.Feature {
    this.fixLatBoundary(center, width, height);
    if (this.overviewMap === undefined) {
      throw new Error("The overview map object is undefined.");
    }

    if (this.box.center === undefined) {
      throw new Error("The box center is undefined.");
    }

    // geographical coordinates to pixel coordinates
    let boxPixelCenter = this.overviewMap.project(this.box.center);

    let boxPixelCenterX = boxPixelCenter.x;
    let boxPixelCenterY = boxPixelCenter.y;

    let minX = boxPixelCenterX - width / 2;
    let maxX = boxPixelCenterX + width / 2;
    let minY = boxPixelCenterY - height / 2;
    let maxY = boxPixelCenterY + height / 2;

    // The left top of canvas is (0, 0)
    let topLeft: PointLike = [minX, minY];
    let topRight: PointLike = [maxX, minY];
    let bottomLeft: PointLike = [minX, maxY];
    let bottomRight: PointLike = [maxX, maxY];

    // pixel coordinates to geographical coordinates
    let topLeftPoint = this.overviewMap.unproject(topLeft).toArray();
    let topRightPoint = this.overviewMap.unproject(topRight).toArray();
    let bottomLeftPoint = this.overviewMap.unproject(bottomLeft).toArray();
    let bottomRightPoint = this.overviewMap.unproject(bottomRight).toArray();

    let boxCoordinates = [
      [
        topLeftPoint,
        topRightPoint,
        bottomRightPoint,
        bottomLeftPoint,
        topLeftPoint,
      ],
    ];

    let boxFeature: GeoJSON.Feature = {
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates: boxCoordinates,
      },
    };

    return boxFeature;
  }

  // Fix boundary issue when latitude value is larger than MAX_LAT
  fixLatBoundary(latLng: LngLat, width: number, height: number) {
    if (this.overviewMap === undefined) {
      throw new Error("The overview map object is undefined.");
    }

    let boxPixelCenter = this.overviewMap.project(latLng);

    let boxPixelCenterX = boxPixelCenter.x;
    let boxPixelCenterY = boxPixelCenter.y;

    let minX: number = boxPixelCenterX - width / 2;
    let minY: number = boxPixelCenterY - height / 2;
    let maxY: number = boxPixelCenterY + height / 2;

    // The left top of canvas is (0, 0)
    let topLeft: PointLike = [minX, minY];
    let bottomLeft: PointLike = [minX, maxY];

    // Calculate pxiel to lnglat
    let topLeftPoint = this.overviewMap.unproject(topLeft);
    let bottomLeftPoint = this.overviewMap.unproject(bottomLeft);

    if (topLeftPoint.lat > MAX_LAT) {
      let lat_offset = topLeftPoint.lat - MAX_LAT;
      this.box.center.lat = this.box.center.lat - lat_offset;
    }

    if (bottomLeftPoint.lat < -MAX_LAT) {
      let lat_offset = bottomLeftPoint.lat + MAX_LAT;
      this.box.center.lat = this.box.center.lat - lat_offset;
    }
  }

  fixLngBoundary(lngLat: LngLat): LngLat {
    if (lngLat.lng > 180) {
      lngLat.lng = lngLat.lng - 360;
    }

    if (lngLat.lng < -180) {
      lngLat.lng = lngLat.lng + 360;
    }

    return lngLat;
  }

  calculateResolution(lat: number, zoom: number): number {
    lat = Math.abs(lat);
    let resolution = Math.abs(
      (DISTANCE_PER_PIXEL * Math.cos(lat)) / Math.pow(2, zoom),
    );
    return resolution;
  }

  initBox() {
    if (this.parentMap === undefined) {
      throw new Error("The parent map object is undefined.");
    }

    if (this.overviewMap === undefined) {
      throw new Error("The overview map object is undefined.");
    }

    let parentBounds: LngLatBoundsLike = this.parentMap.getBounds();

    let minX = parentBounds._sw.lng;
    let maxX = parentBounds._ne.lng;
    let minY = parentBounds._sw.lat;
    let maxY = parentBounds._ne.lat;

    let topLeft = [minX, maxY];
    let topRight = [maxX, maxY];
    let bottomLeft = [minX, minY];
    let bottomRight = [maxX, minY];

    let boxCoordinates = [
      [topLeft, topRight, bottomRight, bottomLeft, topLeft],
    ];

    this.overviewMap.addSource(this.box.sourceName, {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Polygon",
          coordinates: boxCoordinates,
        },
      },
    });

    this.overviewMap.addLayer({
      id: this.box.outlineLayerId,
      type: "line",
      source: this.box.sourceName,
      layout: {},
      paint: this.box.outlineStyle,
    });

    this.overviewMap.addLayer({
      id: this.box.fillLayerId,
      type: "fill",
      source: this.box.sourceName,
      layout: {},
      paint: this.box.fillStyle,
    });

    this.box.source = this.overviewMap.getSource(
      this.box.sourceName,
    ) as GeoJSONSource;
  }

  createOverviewContainer(): HTMLElement {
    let container = document.createElement("div");
    container.classList.add("maplibregl-ctrl");
    container.classList.add(`${classes["maplibre-gl-overview-map"]}`);
    if (this.options.customClassName !== "") {
      container.classList.add(this.options.customClassName);
    }

    container.addEventListener("contextmenu", this.preventDefault);

    if (this.options.mapContainerId !== "") {
      container.id = this.options.mapContainerId;
    }

    return container;
  }

  preventDefault(e: Event): void {
    e.preventDefault();
  }

  onRemove(): void {
    document.removeEventListener("mouseup", this.detectMouseUpOutside);

    if (this.parentMap === undefined) {
      throw new Error("The parent map object is undefined.");
    }

    if (this.overviewMap === undefined) {
      throw new Error("The parent map object is undefined.");
    }

    this.parentMap.off("load", this.initOverviewMap as Listener);
    this.parentMap.off("move", this.updateOverviewCenter as Listener);
    this.parentMap.off("move", this.updateBox as Listener);
    this.parentMap.off("move", this.updateOverviewBearing as Listener);
    this.parentMap.off("zoom", this.updateBox as Listener);
    this.parentMap.off("zoom", this.updateOverviewZoom as Listener);

    this.overviewMap.off("load", this.overviewOnLoad as Listener);
    this.overviewMap.off("mousemove", this.overviewOnMouseMove as Listener);
    this.overviewMap.off("mouseup", this.overviewOnMouseUp as Listener);
    this.overviewMap.off("mousedown", this.overviewOnMouseDown as Listener);

    this.container?.parentNode?.removeChild(this.container);
    this.container = undefined;
    this.parentMap = undefined;
    this.overviewMap = undefined;
  }
}

export default OverviewMapControl;
