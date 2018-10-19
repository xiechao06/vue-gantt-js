<template>
  <div id="app">
    <gantt
      :project="project"
    ></gantt>
  </div>
</template>

<script>
import gantt from './Gantt.vue'
import { Project } from 'gantt-engine'

export default {
  name: 'app',
  components: {
    gantt
  },
  data () {
    return {
      project: new Project('sample')
        .addSubTask(t => t
          .name('A')
          .addSubTask(t => t
            .name('AA')
          )
        )
        .addSubTask('C')
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
