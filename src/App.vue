<template>
  <div id="app">
    <Gantt
      :project="project"
    ></Gantt>
  </div>
</template>

<script>
import { Project } from 'gantt-engine'
import Gantt from './Gantt'

localStorage.debug = 'gantt:*'

// #ff0000
export default {
  name: 'app',
  components: {
    Gantt
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
        .addSubTask(t => t
          .name('B')
          .addSubTask('BA')
          .addSubTask('BB')
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
