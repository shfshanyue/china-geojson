const axios = require('axios')
const fs = require('fs')
const cn = require('china-region')
const { map } = require('@shanyue/promise-utils')

const key = process.env.AMAP_KEY

function isExistRegion (code) {
  return fs.existsSync(`./data/${code}.json`) 
}

async function fetchGeoJSON (code) {
  const url = `https://restapi.amap.com/v3/config/district?keywords=${code}&subdistrict=0&key=${key}&extensions=all`
  const { data } = await axios.get(url)  
  if (data.info !== 'OK') {
    throw new Error(`Fetch Failed: ${code}`)
  }
  const district = data.districts[0]
  if (!district || data.districts.length !== 1) {
    throw new Error(`District not exist: ${code}`)
  }
  const { polyline, center, adcode, name } = district
  const coordinates = polyline.split('|')
    .map(x =>
      [x.split(';').map(x => x.split(',').map(x => Number(x)))]
    )
  const json = {
    coordinates,
    center: center.split(','),
    code: adcode,
    name
  }
  return json
}

async function downloadGeoJSON (code) {
  const json = await fetchGeoJSON(code)
  fs.writeFileSync(`./data/${code}.json`, JSON.stringify(json, null, 2))
}

async function main () {
  const regions = cn.getAllRegions()
  await map(regions, async region => {
    if (!isExistRegion(region.code)) {
      await downloadGeoJSON(region.code)
      console.log(`Done: ${region.code}`)
    }
  }, {
    concurrency: 5
  })
}


main().then(() => {
  console.log('Done')
  process.exit(0)
}).catch(e => {
  console.log('Exit')
  console.error(e)
  process.exitCode = 1
})
