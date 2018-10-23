<template>
  <div class="gantt">
    <tree-grid
      :project="project"
      :headerHeight="timeRulerHeight"
      @toggle="toggleTask"
      :collapsed="collapsed"
    ></tree-grid>
    <div class="gantt-task-panel-container">
      <div class="gantt-task-panel"  @wheel="onWheelTaskPanel">
        <time-ruler
          type="d/w"
          :offset="taskPanelOffset"
          ref="timeRuler"
          @getHeight="getTimeRulerHeight"
          :startFrom="new Date(project.base())"
          @change="timeRulerChange"
        >
        </time-ruler>
        <swim-pool
          :project="project"
          :start="start"
          :end="end"
        >
        </swim-pool>
      </div>
    </div>
  </div>
</template>

<script>
import { Project } from 'gantt-engine'
import SwimPool from './SwimPool'
import TimeRuler from './TimeRuler'
import TreeGrid from './TreeGrid'
import debug_ from 'debug'

const debug = debug_('gantt:index')

export default {
  props: {
    project: Project
  },
  data () {
    return {
      collapsed: [],
      taskPanelOffset: 0,
      timeRulerHeight: 0,
      start: null,
      end: null
    }
  },
  components: {
    'time-ruler': TimeRuler,
    'swim-pool': SwimPool,
    'tree-grid': TreeGrid
  },
  methods: {
    onWheelTaskPanel (e) {
      this.taskPanelOffset += e.deltaX
    },
    getTimeRulerHeight (h) {
      this.timeRulerHeight = h
    },
    timeRulerChange (start, end) {
    },
    toggleTask (task) {
      let cn = task.canonicalName.join('.')
      debug('toggle task', cn)
      if (~this.collapsed.indexOf(cn)) {
        this.collapsed = this.collapsed.filter(it => it !== cn)
      } else {
        this.collapsed = this.collapsed.concat(cn)
      }
      debug('collapsed tasks', this.collapsed)
    }
  }
}
</script>

<style scoped>

.gantt {
  display: flex;
  flex-wrap: nowrap;
  width: 100%;
  font-size: 12px;
}

.gantt .tree-grid {
  flex: 3;
}

.gantt-task-panel-container {
  flex: 7;
  overflow-x: hidden;
  overflow-y: auto;
}

</style>
