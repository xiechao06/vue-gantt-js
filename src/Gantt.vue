<template>
  <div class="gantt">
    <tree-grid
      :project="project"
      :headerHeight="timeRulerHeight"
      @toggle="toggleTask"
      :tasks="visibleTasks"
      @reportSwimLaneWidth="reportSwimLaneWidth"
      @scroll="scrollTreeGrid"
      @startTask="startTask"
      @finishTask="finishTask"
    >
    </tree-grid>
    <div class="gantt-task-panel-container">
      <div class="gantt-task-panel" @wheel.prevent="wheelTaskPanel">
        <time-ruler type="d/w" :offset="taskPanelOffset" ref="timeRuler" @getHeight="getTimeRulerHeight" :startFrom="new Date(project.base())" @change="timeRulerChange" @reportTimeUnitPixels="reportTimeUnitPixels">
        </time-ruler>
        <div class="swim-pool-container" :style="{
          height: (totalHeight - timeRulerHeight) + 'px'
        }">
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
            :offsetTop="treeGridOffsetTop"
            ref="swimPool">
          </swim-pool>
        </div>
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
import outerHeight from './util/outer-height'

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
      timeUnitPixels: null,
      treeGridOffsetTop: 0,
      totalHeight: 0
    }
  },
  mounted () {
    this.totalHeight = outerHeight(this.$el)
  },
  components: {
    'time-ruler': TimeRuler,
    'swim-pool': SwimPool,
    'tree-grid': TreeGrid
  },
  computed: {
    visibleTasks () {
      return this._flattenTaskIter(this.projectJSON)
        .map(it => {
          it.collapsed = ~this.collapsed.indexOf(it.canonicalName.join('.'))
          return it
        })
    },
    projectJSON () {
      return this.project.toJSON()
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
    wheelTaskPanel (e) {
      this.taskPanelOffset += e.deltaX
      this.taskPanelOffset -= e.deltaY
    },
    getTimeRulerHeight (h) {
      this.timeRulerHeight = h
    },
    timeRulerChange (start, end) {
      debug('start date', start)
      debug('end date', end)
      const day = 24 * 3600 * 1000
      if (this.start && Math.floor(this.start.getTime() / day) === start.getTime() / day) {
        return
      }
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
      this.$emit('mouseoverTask', task, {
        x: evt.evt.clientX,
        y: evt.evt.clientY
      }, evt)
    },
    mouseoutTask (task, evt) {
      debug('mouse out task', task, evt)
      this.$emit('mouseoutTask', task, {
        x: evt.evt.clientX,
        y: evt.evt.clientY
      }, evt)
    },
    scrollTreeGrid (offsetTop) {
      this.treeGridOffsetTop = offsetTop
    },
    startTask (...args) {
      this.$emit('startTask', ...args)
    },
    finishTask (...args) {
      this.$emit('finishTask', ...args)
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
  overflow-y: hidden;
}

.gantt .tree-grid {
  flex: 3;
}

.gantt-task-panel-container {
  flex: 7;
  overflow: hidden;
  border-bottom: 1px solid #E0E0E0;
}

.gantt-task-panel {
  border: 1px solid #e5e5e5;
  overflow: hidden;
}

.swim-pool-container {
  overflow: hidden;
  box-sizing: border-box;
}
</style>
