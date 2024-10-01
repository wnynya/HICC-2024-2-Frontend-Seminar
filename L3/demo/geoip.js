let map;
let marker;

async function initMap(pos) {
  const { Map } = await google.maps.importLibrary('maps');
  const { AdvancedMarkerElement } = await google.maps.importLibrary('marker');

  map = new Map(document.querySelector('#map'), {
    zoom: 10,
    center: pos,
    mapId: 'demo',
  });

  marker = new AdvancedMarkerElement({
    map: map,
    position: pos,
    title: 'here',
  });
}

async function init() {
  const pos = { lat: 0, lng: 0 };
  await initMap(pos);
  query('14.1.1.1');
}

init();

async function getGeoloc(ip) {
  const API_KEY = 'aav8h6vteavg0ucxbiartbe4dlnzudeiz2nuau6ufm';
  let url = `https://api.wany.io/network/geoip/${ip}?o=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  return data;
}

async function query(ip) {
  const geoloc = await getGeoloc(ip);
  if (!geoloc?.data?.coordinate) {
    return;
  }
  const pos = {
    lat: geoloc.data.coordinate.latitude,
    lng: geoloc.data.coordinate.longtitude,
  };
  map.setCenter(pos);
  marker.position = pos;
}
