function generateGeoJson(code) {
  const data = require(`./data/${code}.json`)
  const { center, name, coordinates } = data
  return {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      properties: {
        code,
        name,
        center,
      },
      geometry: {
        type: 'MultiPolygon',
        coordinates
      }
    }]
  }
}
