<template>
  <div id="map-container"></div>
</template>
<script setup>
import mapboxgl from 'mapbox-gl'
import { useMapStore } from '@/stores/mapStore'
import { onBeforeMount, onMounted, toRefs } from 'vue';
import { app } from '../main'
import { getCityInfoApi, getGeoJSONApi, getWeatherApi } from '../api/city';
import * as turf from '@turf/turf'
let { map, cityName, showCityInfoFlag, city, weather, weatherFlag, strokeLayer, geoSource, geoLayer, zooming, popup } = toRefs(useMapStore())
const [styleSatellite, styleVector] = ['mapbox://styles/mapbox/satellite-streets-v12', 'mapbox://styles/mapbox/streets-v12']
const initMap = () => {
  mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN
  map.value = new mapboxgl.Map({
    container: 'map-container',
    style: styleVector,
    center: [114.30, 30.50],
    zoom: 6
  })
  map.value.on('style.load', () => {
    map.value.setFog({
      color: '#eee',
      'high-color': 'red',
      'space-color': '#3a81d3'
    })
    map.value.on('mousemove', 'city', (e) => {
      if (e.features[0].properties.level === 'city' || 'district') {
        let matchArr = ['match', ['id'], e.features[0].id, '#8edfff', '#fff']
        map.value.setPaintProperty(
          'city',
          'fill-color',
          matchArr
        )
        popup.value?.remove()
        let extentLatWithLon = e.features[0].geometry.coordinates.flat(2).filter(item => item.length == 2).length !== 0 ? e.features[0].geometry.coordinates.flat(2).find(item => item.includes(turf.bbox(e.features[0])[3])) : e.features[0].geometry.coordinates.flat().find(item => item.includes(turf.bbox(e.features[0])[3]))
        popup.value = new mapboxgl.Popup({ offset: 0, closeButton: false }).setLngLat(extentLatWithLon).setHTML(
          `<ul class="popup">
            <li class="title">name:<span class="content">${e.features[0].properties.name}</span></li>
            <li class="title">adcode:<span class="content">${e.features[0].properties.adcode}</span></li>
            <li class="title">level:<span class="content">${e.features[0].properties.level}</span></li>
          </ul>`
        )
        popup.value.addTo(map.value)
      }
    })
    map.value.addSource('city-source', geoSource.value)
    map.value.addLayer(geoLayer.value)
    map.value.addLayer(strokeLayer.value)
    map.value.flyTo({
      center: city.value.center.split(','),
      pitch: 30
    })
    map.value.fitBounds(zooming.value, {
      padding: { top: 160, bottom: 100 }
    })
    map.value.on('click', 'city', (e) => {
      if (e.features[0].properties.level === 'city' || 'district' && map.value.getLayer('city') && map.value.getSource('city-source') && map.value.getLayer('city-stroke')) {
        if (e.features[0].properties.adcode !== 100000 && e.features[0].properties.adcode !== 710000) {
          weatherFlag.value = true
        } else {
          weatherFlag.value = false
        }
        map.value.removeLayer('city')
        map.value.removeLayer('city-stroke')
        map.value.removeSource('city-source')
        getWeatherApi(e.features[0].properties.adcode).then(res => {
          weather.value = res.data.lives[0]
        })
        getCityInfoApi(e.features[0].properties.adcode).then(res => {
          city.value = res.data.districts[0]
          cityName.value = city.value.name
          localStorage.setItem('city', JSON.stringify(city.value))
        })
        getGeoJSONApi(e.features[0].properties.adcode).then(res => {
          zooming.value = turf.bbox(res.data)
          geoSource.value = {
            type: 'geojson',
            data: res.data,
            generateId: true
          }
          map.value.addSource('city-source', geoSource.value)
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
          map.value.addLayer(geoLayer.value)
          map.value.addLayer(strokeLayer.value)
          map.value.flyTo({
            center: res.data.features[0].properties.center,
            pitch: 30
          })
          map.value.fitBounds(zooming.value, {
            padding: {
              top: 160, bottom: 100
            }
          })
        })
      }
    })
    map.value.on('mouseleave', 'city', () => {
      if (map.value.getLayer('city')) {
        map.value.setPaintProperty(
          'city',
          'fill-color',
          '#fff'
        )
        popup.value?.remove()
      }
    })
  })
  app.provide('$map', map.value)
}
const initInfo = () => {
  if (localStorage.getItem('city')) {
    city.value = JSON.parse(localStorage.getItem('city'))
    cityName.value = city.value.name
    showCityInfoFlag.value = false
    if (city.value.adcode !== '100000'&&city.value.adcode !== '710000') {
      weatherFlag.value = true
      getWeatherApi(city.value.adcode).then(res => {
        weather.value = res.data.lives[0]
      })
    } else {
      weatherFlag.value = false
    }
    getWeatherApi(city.value.adcode).then(res => {
      weather.value = res.data.lives[0]
    })
    getGeoJSONApi(city.value.adcode).then(res => {
      geoSource.value = {
        type: 'geojson',
        data: res.data,
        generateId: true
      }
      zooming.value = turf.bbox(res.data)
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
    })
  }
}
onBeforeMount(() => {
  initInfo()
})
onMounted(() => {
  initMap()
})
</script>
<style scoped>
#map-container {
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100vh;
}

*>>>.content {
  color: #3275f5;
}
</style>
