<template>
  <table class="weather-table" v-if="weatherFlag">
    <tr>
      <th>地区</th>
      <td>{{ weather.city }}</td>
    </tr>
    <tr>
      <th>天气</th>
      <td>{{ weather.weather }}</td>
    </tr>
    <tr>
      <th>温度</th>
      <td>{{ weather.temperature + '℃' }}</td>
    </tr>
    <tr>
      <th>风向</th>
      <td>{{ weather.winddirection }}</td>
    </tr>
    <tr>
      <th>风力</th>
      <td>{{ weather.windpower + '级' }}</td>
    </tr>
  </table>
</template>
<script setup>
import { toRefs } from 'vue';
import { useMapStore } from '../stores/mapStore';
let { weather, weatherFlag } = toRefs(useMapStore())
</script>
<style scoped>
.weather-table {
  position: fixed;
  top: 100px;
  right: 100px;
  width: 250px;
  z-index: 1000;
  border: 1px solid #fff;
  background-color: #762bb399;
  border-collapse: collapse;
}

.weather-table>>>tr,
th,
td {
  border: 1px solid #fff;
  font-size: 15px;
  font-weight: normal;
  color: #fff;
  padding: 10px;
}
</style>
