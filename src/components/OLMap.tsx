import { useEffect, useRef } from "react";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat, toLonLat } from "ol/proj";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { Style, Icon, Circle as CircleStyle, Fill, Stroke } from "ol/style";

export interface OLMarker {
  id?: string;
  lat: number;
  lng: number;
  color?: string; // hex
  label?: string;
}

interface Props {
  markers?: OLMarker[];
  center?: [number, number]; // [lng, lat]
  zoom?: number;
  height?: number | string;
  className?: string;
  showMyLocation?: boolean;
  onPick?: (lat: number, lng: number) => void;
  pickedMarker?: { lat: number; lng: number } | null;
}

function svgPin(color: string) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='40' viewBox='0 0 32 40'><path d='M16 0C7.2 0 0 7.2 0 16c0 11 16 24 16 24s16-13 16-24C32 7.2 24.8 0 16 0z' fill='${color}'/><circle cx='16' cy='16' r='6' fill='white'/></svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

export function OLMap({
  markers = [],
  center = [32.5732, -25.9692], // Maputo
  zoom = 12,
  height = 300,
  className = "",
  showMyLocation = false,
  onPick,
  pickedMarker = null,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const markersSource = useRef(new VectorSource());
  const meSource = useRef(new VectorSource());
  const pickSource = useRef(new VectorSource());

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const map = new Map({
      target: ref.current,
      layers: [
        new TileLayer({ source: new OSM() }),
        new VectorLayer({ source: markersSource.current }),
        new VectorLayer({
          source: meSource.current,
          style: new Style({
            image: new CircleStyle({
              radius: 8,
              fill: new Fill({ color: "#2563eb" }),
              stroke: new Stroke({ color: "white", width: 3 }),
            }),
          }),
        }),
        new VectorLayer({ source: pickSource.current }),
      ],
      view: new View({ center: fromLonLat(center), zoom }),
      controls: [],
    });
    mapRef.current = map;

    if (onPick) {
      map.on("click", (evt) => {
        const [lng, lat] = toLonLat(evt.coordinate);
        onPick(lat, lng);
      });
    }
    return () => { map.setTarget(undefined); mapRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // markers
  useEffect(() => {
    markersSource.current.clear();
    markers.forEach((m) => {
      const f = new Feature(new Point(fromLonLat([m.lng, m.lat])));
      f.setStyle(new Style({ image: new Icon({ src: svgPin(m.color ?? "#16a34a"), anchor: [0.5, 1] }) }));
      markersSource.current.addFeature(f);
    });
  }, [markers]);

  // picked marker
  useEffect(() => {
    pickSource.current.clear();
    if (pickedMarker) {
      const f = new Feature(new Point(fromLonLat([pickedMarker.lng, pickedMarker.lat])));
      f.setStyle(new Style({ image: new Icon({ src: svgPin("#dc2626"), anchor: [0.5, 1] }) }));
      pickSource.current.addFeature(f);
    }
  }, [pickedMarker]);

  // my location
  useEffect(() => {
    if (!showMyLocation || !("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c: [number, number] = [pos.coords.longitude, pos.coords.latitude];
        meSource.current.clear();
        meSource.current.addFeature(new Feature(new Point(fromLonLat(c))));
        mapRef.current?.getView().animate({ center: fromLonLat(c), zoom: 13, duration: 600 });
      },
      () => {},
      { enableHighAccuracy: true, timeout: 6000 }
    );
  }, [showMyLocation]);

  return <div ref={ref} className={className} style={{ width: "100%", height }} />;
}
