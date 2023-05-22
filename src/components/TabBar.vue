<template>
  <ul id="search-bar">
    <li>
      <div class="city-name" @click="zoomDistrict"><span>{{ cityName }}</span></div>
    </li>
    <li>
      <input type="text" class="search-city" v-model="name" placeholder="请输入要搜索的城市" @input.lazy="searchCity(name)">
    </li>
    <li class="search-res" v-show="name && showCityInfoFlag">
      <div class="search-res-name" v-for="(item, index) in searchRes" @click="showCityInfo(item)">{{
        item.name }}</div>
    </li>
  </ul>
</template>


<script setup>
import { useMapStore } from '@/stores/mapStore'
import { toRefs, ref } from 'vue';
import { getCityInfoApi, getGeoJSONApi, getWeatherApi, getGeoSingleJSONApi } from '../api/city';
import { onMounted } from 'vue';
import { inject } from 'vue';
import * as turf from '@turf/turf'
let { searchRes, cityName, showCityInfoFlag, city, weather, strokeLayer, geoSource, weatherFlag, geoLayer, zooming } = toRefs(useMapStore())
let name = ref('')
let $map
const searchCity = (name) => {
  if (name) {
    getCityInfoApi(name).then(res => {
      searchRes.value = res.data.districts.filter(item => item.name.endsWith('省') || item.name.endsWith('市') || item.name.endsWith('州') || item.name.endsWith('区') && (item.level === 'district' || 'province') || item.name.endsWith('县') || (item.name.endsWith('城区') && item.level !== 'city'))
    })
  }
  showCityInfoFlag.value = true
}
const zoomDistrict = () => {
  if ($map.getLayer('city') && $map.getSource('city-source') && $map.getLayer('city-stroke')) {
    $map.removeLayer('city')
    $map.removeLayer('city-stroke')
    $map.removeSource('city-source')
  }
  getCityInfoApi(cityName.value).then(res => {
    city.value = res.data.districts[0]
    showCityInfoFlag.value = false
    getGeoSingleJSONApi(city.value.adcode).then(res => {
      getCityInfoApi(res.data.features[0].properties.parent.adcode).then(res => {
        city.value = res.data.districts[0]
        localStorage.setItem('city', JSON.stringify(city.value))
      }).then(() => {
        if (city.value.adcode !== '100000'&&city.value.adcode !== '710000') {
          weatherFlag.value = true
          getWeatherApi(city.value.adcode).then(res => {
            weather.value = res.data.lives[0]
          })
        } else {
          weatherFlag.value = false
        }
        getGeoJSONApi(city.value.adcode).then(res => {
          cityName.value = city.value.name
          zooming.value = turf.bbox(res.data)
          geoSource.value = {
            type: 'geojson',
            data: res.data,
            generateId: true
          }
          $map.addSource('city-source', geoSource.value)
          geoLayer.value = {
            id: 'city',
            type: 'fill',
            source: 'city-source',
            paint: {
              'fill-color': '#fff',
              'fill-opacity': 0.8
            }
          }
          strokeLayer.value = {
            id: 'city-stroke',
            type: 'line',
            source: 'city-source',
            paint: {
              'line-color': '#f8b0d8',
              'line-opacity': 0.8,
              'line-width': 3
            }
          }
          $map.addLayer(geoLayer.value)
          $map.addLayer(strokeLayer.value)
          $map.flyTo({
            center: city.value.center.split(','),
            pitch: 30
          })
          $map.fitBounds(zooming.value, {
            padding: { top: 160, bottom: 100 }
          })
        })
      })
    })
  })
}
const showCityInfo = (item) => {
  name.value = ''
  if ($map.getLayer('city') && $map.getSource('city-source') && $map.getLayer('city-stroke')) {
    $map.removeLayer('city')
    $map.removeLayer('city-stroke')
    $map.removeSource('city-source')
  }
  city.value = item
  localStorage.setItem('city', JSON.stringify(city.value))
  cityName.value = item.name
  showCityInfoFlag.value = false
  getGeoJSONApi(item.adcode).then(res => {
    geoSource.value = {
      type: 'geojson',
      data: res.data,
      generateId: true
    }
    zooming.value = turf.bbox(res.data)
    $map.addSource('city-source', geoSource.value)
    geoLayer.value = {
      id: 'city',
      type: 'fill',
      source: 'city-source',
      paint: {
        'fill-color': '#fff',
        'fill-opacity': 0.8
      }
    }
    strokeLayer.value = {
      id: 'city-stroke',
      type: 'line',
      source: 'city-source',
      paint: {
        'line-color': '#f8b0d8',
        'line-opacity': 0.8,
        'line-width': 3
      }
    }
    $map.addLayer(geoLayer.value)
    $map.addLayer(strokeLayer.value)
    $map.flyTo({
      center: item.center.split(','),
      pitch: 30
    })
    $map.fitBounds(zooming.value, {
      padding: { top: 160, bottom: 100 }
    })
  })
  getWeatherApi(item.adcode).then(res => {
    weather.value = res.data.lives[0]
  })
}
onMounted(() => {
  $map = inject('$map')
})
</script>
<style scoped>
#search-bar {
  position: fixed;
  width: 100vw;
  height: 60px;
  top: 0;
  background-color: rgba(255, 255, 255, .8);
  z-index: 1000;
  display: flex;
  justify-content: start;
  align-items: center;
  gap: 100px;
  padding-left: 100px;
}

.city-name {
  width: 200px;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: #2e0357;
  transition: all .5s;
}

.city-name:hover {
  background-color: #ffbefc99;
  transition: all .5s;
}

.search-city {
  width: 300px;
  height: 40px;
  padding: 10px;
  box-sizing: border-box;
  outline: none;
  border: 1px solid #bef2ff;
  transition: all .5s;
}

.search-city:focus {
  border: 1px solid #4e147e;
  background-color: #bef2ff;
  transition: all .5s;
}

.search-res {
  position: fixed;
  top: 50px;
  left: 400px;
  z-index: 1000;
  min-height: 40px;
  max-height: 400px;
  width: 300px;
  color: #6b15bb;
  cursor: pointer;
  overflow-y: auto;
  overflow-x: hidden;
}

.search-res-name {
  width: inherit;
  height: 40px;
  padding: 10px;
  box-sizing: border-box;
  transition: all .5s;
  background-color: rgba(255, 255, 255, .4);
}

.search-res-name:hover {
  transition: all .5s;
  background-color: #ffbefc;
}
</style>
