import axios from "axios";
const getCityInfo = axios.create({
  baseURL: 'https://restapi.amap.com/v3',
  timeout: 3000
})

const getGeoJSON = axios.create({
  baseURL: 'https://geo.datav.aliyun.com/areas_v3/bound',
  timeout: 3000
})

export { getCityInfo, getGeoJSON }
