<template>
  <div class="swim-pool" :style="{
    height: swimLaneWidth * tasks.length + 'px'
  }" ref='pool'>
    <v-stage
      v-if="swimLaneWidth && timeUnitPixels" 
      :config="{
        width: poolWidth,
        height: swimLaneWidth * tasks.length
      }"
    >
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
        <v-group
          v-for="(task, idx) in tasks"
          :key="task.canonicalName.join('.')"
          :config="taskBarConfig(task, idx)"
        >
          <v-rect
            name="leaf task"
            v-if="task.isLeaf"
            :config="(function () {
              return {
                height: swimLaneWidth - 2 * laneMargin,
                fill: '#B3E5FC',
                cornerRadius,
                width: timeUnitPixels
                  ? Math.round(task.duration * timeUnitPixels.pixels / timeUnitPixels.unit) 
                  : 0
              }
            })()"
          >
          </v-rect>
          <v-group
            name="non-leaf task"
            v-else
          >
            <v-rect
              :config="(function () {
                return {
                  height: swimLaneWidth - 2 * laneMargin,
                  fill: '#A7FFEB',
                  cornerRadius,
                  width: timeUnitPixels
                    ? Math.round(task.duration * timeUnitPixels.pixels / timeUnitPixels.unit) 
                    : 0
                }
              })()"
            >
            </v-rect>
            <v-path
              :config="(function () {
                let barHeight = swimLaneWidth - 2 * laneMargin
                return {
                  fill: '#A7FFEB',
                  data: `
                    M 0 ${barHeight + cornerRadius}
                    v ${-2 * cornerRadius}
                    h ${cornerRadius}
                    v ${cornerRadius}
                    Z
                  `
                }
              })()"
            ></v-path>
            <v-path
              :config="(function () {
                let barHeight = swimLaneWidth - 2 * laneMargin
                let barWidth = Math.round(task.duration * timeUnitPixels.pixels / timeUnitPixels.unit) 
                return {
                  fill: '#A7FFEB',
                  data: `
                    M ${barWidth} ${barHeight + cornerRadius}
                    v ${-2 * cornerRadius}
                    h ${-cornerRadius}
                    v ${cornerRadius}
                    Z
                  `
                }
              })()"
            ></v-path>
          </v-group>
        </v-group>
        <!-- <v-rect
          v-for="(task, idx) in tasks"
          :key="task.canonicalName.join('.')"
          :config="taskBarConfig(task, idx)"
        > -->
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
    timeUnitPixels: Object,
    laneMargin: {
      type: Number,
      default: 8
    },
    cornerRadius: {
      type: Number,
      default: 8
    }
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
      let x = 0
      if (this.timeUnitPixels) {
        let { unit, pixels } = this.timeUnitPixels
        x = Math.round((task.expectedToStartAt - new Date(this.start).getTime()) * pixels / unit)
      }
      return {
        x,
        y: (idx + 1) * this.swimLaneWidth - 1,
        offsetY: this.swimLaneWidth - this.laneMargin
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
