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
        .base(new Date())
        .addSubTask(t => t
          .name('A')
          .addSubTask(t => t
            .name('AA')
            .duration('2d')
          )
        )
        .addSubTask(t => t
          .name('B')
          .addSubTask(t => t
            .name('BA')
            .duration('3d')
            .dependsUpon(['A', 'AA'])
          )
          .addSubTask(t => t
            .name('BB')
            .duration('1d')
            .dependsUpon(['B', 'BA'])
          )
        )
        .addSubTask(t => t
          .name('C')
          .duration('5d')
          .dependsUpon(['B'])
        )
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

.gantt {
  /* height: 10em; */
}
</style>
