import { getCityInfo, getGeoJSON } from "./request";
let key = import.meta.env.VITE_AMAP_KEY
const getCityInfoApi = (name) => {
  return getCityInfo({
    url: `/config/district?keywords=${name}&subdistrict=1&key=${key}`,
    methods: 'GET'
  })
}

const getGeoJSONApi = (adcode) => {
  return getGeoJSON({
    url: adcode.toString().endsWith('00')&& adcode.toString()!=='710000' ? `/${adcode}_full.json` : `/${adcode}.json`,
    methods: 'GET'
  })
}
const getGeoSingleJSONApi = (adcode) => {
  return getGeoJSON({
    url: `/${adcode}.json`,
    methods: 'GET'
  })
}

const getWeatherApi = (adcode) => {
  return getCityInfo({
    url: `/weather/weatherInfo?city=${adcode}&key=${key}`
  })
}
export { getCityInfoApi, getGeoJSONApi, getWeatherApi,getGeoSingleJSONApi }
