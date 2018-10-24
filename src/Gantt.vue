<template>
  <div class="gantt">
    <tree-grid
      :project="project"
      :headerHeight="timeRulerHeight"
      @toggle="toggleTask"
      :tasks="visibleTasks"
      @reportSwimLaneWidth="reportSwimLaneWidth"
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
          @reportTimeUnitPixels="reportTimeUnitPixels"
        >
        </time-ruler>
        <swim-pool
          :project="project"
          :start="start"
          :end="end"
          :collapsed="collapsed"
          :swimLaneWidth="swimLaneWidth"
          :tasks="visibleTasks"
          :timeUnitPixels="timeUnitPixels"
          @mouseoverTask="mouseoverTask"
          @mouseoutTask="mouseoutTask"
          ref="swimPool"
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
import VueKonva from 'vue-konva'
import Vue from 'vue'

Vue.use(VueKonva)

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
      swimLaneWidth: 0,
      start: null,
      end: null,
      timeUnitPixels: null
    }
  },
  components: {
    'time-ruler': TimeRuler,
    'swim-pool': SwimPool,
    'tree-grid': TreeGrid
  },
  computed: {
    visibleTasks () {
      return this._flattenTaskIter(this.project)
        .map(it => it.toJSON())
        .map(it => {
          it.collapsed = ~this.collapsed.indexOf(it.canonicalName.join('.'))
          return it
        })
    }
  },
  methods: {
    _flattenTaskIter (task) {
      if (~this.collapsed.indexOf(task.canonicalName.join('.'))) {
        return [task]
      }
      return task.subTasks
        .reduce((a, b) => a.concat(this._flattenTaskIter(b)), [task])
    },
    onWheelTaskPanel (e) {
      this.taskPanelOffset += e.deltaX
    },
    getTimeRulerHeight (h) {
      this.timeRulerHeight = h
    },
    timeRulerChange (start, end) {
      debug('start date', start)
      debug('end date', end)
      this.start = start
      this.end = end
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
    },
    reportSwimLaneWidth (swimLaneWidth) {
      debug('swim lane width', swimLaneWidth)
      this.swimLaneWidth = swimLaneWidth
    },
    reportTimeUnitPixels (unit, pixels) {
      this.timeUnitPixels = { unit, pixels }
    },
    mouseoverTask (task, evt) {
      debug('mouse over task', task, evt)
      let $swimPoolEl = this.$refs.swimPool.$el
      console.log($swimPoolEl)
      this.$emit('mouseoverTask', task, {
        x: evt.evt.clientX,
        y: evt.evt.clientY
      }, evt)
    },
    mouseoutTask (task, evt) {
      debug('mouse out task', task, evt)
      let $swimPoolEl = this.$refs.swimPool.$el
      this.$emit('mouseoutTask', task, {
        x: evt.evt.clientX + $swimPoolEl.offsetLeft,
        y: evt.evt.clientY + $swimPoolEl.offsetTop
      }, evt)
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
