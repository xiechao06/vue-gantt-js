<template>
  <div class="swim-pool" :style="{
    height: swimLaneWidth * tasks.length + 'px'
  }" ref='pool'>
    <v-stage :config="{
      width: poolWidth,
      height: swimLaneWidth * tasks.length
    }">
      <v-layer name="swim-lanes">
        <v-line
          v-for="(task, idx) in tasks"
          :key="task.canonicalName.join('.')"
          :config="{
            x: 0,
            y: (idx + 1) * swimLaneWidth - 1,
            points: [0, 0, poolWidth, 0],
            stroke: '#EEEEEE',
            strokeWidth: 1
          }"
        >
        </v-line>
      </v-layer>
      <v-layer name="task-bars">
        <v-rect
          v-for="(task, idx) in tasks"
          :key="task.canonicalName.join('.')"
          :config="taskBarConfig(task, idx)"
        >
        </v-rect>
      </v-layer>
    </v-stage>
  </div>
</template>

<script>

import outerWidth from './util/outer-width'
import debug_ from 'debug'
import { isBefore, isAfter } from 'date-fns'

const debug = debug_('gantt:swim-pool')

export default {
  props: {
    project: Object,
    start: [String, Date],
    end: [String, Date],
    tasks: {
      type: Array,
      default () {
        return []
      }
    },
    swimLaneWidth: Number,
    timeUnitPixels: Object
  },
  mounted () {
    this.poolWidth = outerWidth(this.$refs.pool)
    debug('pool width', this.poolWidth)
  },
  data () {
    return {
      poolWidth: 0
    }
  },
  computed: {
    tasksInWindow () {
      return this.tasks.filter(it =>
        isBefore(it.expectedToStartAt, this.end) &&
        isAfter(it.expectedToFinishAt, this.start)
      )
    }
  },
  methods: {
    taskBarConfig (task, idx) {
      let width = 0
      let x = 0
      if (this.timeUnitPixels) {
        let { unit, pixels } = this.timeUnitPixels
        width = Math.round(task.duration * pixels / unit)
        x = Math.round((task.expectedToStartAt - new Date(this.start).getTime()) * pixels / unit)
      }
      return {
        fill: 'lightgreen',
        x,
        y: (idx + 1) * this.swimLaneWidth - 1,
        height: this.swimLaneWidth - 8,
        offsetY: this.swimLaneWidth - 4,
        width: width
      }
    }
  }
}
</script>

<style scoped>
.swim-pool {
  border: 1px solid #EEEEEE;
}
</style>
