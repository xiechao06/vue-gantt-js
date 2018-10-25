<template>
  <div id="app">
    <Gantt :project="project" @mouseoverTask="mouseoverTask" @mouseoutTask="mouseoutTask"></Gantt>
    <div class="modal" :style="modalStyle" v-if="hoveredTask" ref="modal">
      <h3>{{ hoveredTask.name() }}</h3>
      <ul>
        <li v-if="hoveredTask.startAt()">
          <span>start at - </span>
          <span>{{ format(new Date(hoveredTask.startAt()), 'yyyy-mm-dd HH:MM') }}</span>
        </li>
        <li v-if="hoveredTask.finishAt()">
          <span>finish at - </span>
          <span>{{ format(new Date(hoveredTask.finishAt()), 'yyyy-mm-dd HH:MM') }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { Project } from 'gantt-engine'
import Gantt from './Gantt'
import { addDays, format } from 'date-fns'

localStorage.debug = 'gantt:*'

// #ff0000
export default {
  name: 'app',
  components: {
    Gantt
  },
  data () {
    return {
      format,
      project: new Project('sample')
        .base(new Date())
        .addSubTask(t => t
          .name('A')
          .addSubTask(t => t
            .name('AA')
            .duration('2d')
            .startAt(addDays(new Date(), 1))
            .finishAt(addDays(new Date(), 5))
          )
        )
        .addSubTask(t => t
          .name('B')
          .addSubTask(t => t
            .name('BA')
            .duration('3d')
            .dependsUpon(['A', 'AA'])
            .startAt(addDays(new Date(), 7))
          )
          .addSubTask(t => t
            .name('BB')
            .dependsUpon(['B', 'BA'])
          )
        )
        .addSubTask(t => t
          .name('C')
          .duration('5d')
          .dependsUpon(['B'])
        ),
      hoveredTask: null,
      mouseoverTaskPos: null
    }
  },
  methods: {
    mouseoverTask (task, { x, y }, evt) {
      this.hoveredTask = task
      this.mouseoverTaskPos = { x, y }
    },
    mouseoutTask () {
      this.hoveredTask = null
      this.mouseoverTaskPos = null
    }
  },
  computed: {
    modalStyle () {
      if (!this.hoveredTask) {
        return {}
      }
      let { x, y } = this.mouseoverTaskPos
      console.log(x, y)
      return {
        display: this.hoveredTask ? 'block' : 'none',
        top: y - 220 + 'px',
        left: x - 30 + 'px'
      }
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
  position: relative;
}

/* .gantt {
  height: 10em;
} */

.modal {
  display: block;
  position: absolute;
  z-index: 999;
  background-color: rgba(75, 75, 75, 0.7);
  color: white;
  padding: 5px;
  border-radius: 4px;
  width: 300px;
  max-height: 150px;
  height: 150px;
  box-sizing: border-box;
}

.modal ul {
  list-style-type: none;
  padding-left: 0%;
  text-align: left;
}
</style>
