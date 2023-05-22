import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { reactive } from 'vue'

export const useMapStore = defineStore('map', () => {
  let map = ref({})
  let adcode = ref({})
  let searchRes = ref([])
  let cityName = ref('')
  let showCityInfoFlag = ref(false)
  let city = ref({})
  let weather = ref({})
  let geoSource = ref({})
  let geoLayer = ref({})
  let strokeLayer = ref({})
  let zooming = ref(0)
  let popup = ref()
  let marker = ref()
  let weatherFlag = ref(true)
  return { map, adcode, searchRes, cityName, zooming, showCityInfoFlag, city, weather, geoSource, geoLayer, strokeLayer, popup, marker, weatherFlag }
})
