<template>
  <div class="swim-pool" :style="{
    height: swimPoolHeight + 'px',
    top: -offsetTop + 'px'
  }" ref='pool'>
    <v-stage v-if="swimLaneWidth && timeUnitPixels" :config="{
        width: poolWidth,
        height: swimLaneWidth * tasks.length
      }">
      <v-layer name="swim-lanes">
        <v-line v-for="(task, idx) in tasks" :key="task.canonicalName.join('.')" :config="{
            x: 0,
            y: (idx + 1) * swimLaneWidth - 1,
            points: [0, 0, poolWidth, 0],
            stroke: '#EEEEEE',
            strokeWidth: 1,
          }">
        </v-line>
      </v-layer>
      <v-layer name="task-bars">
        <v-group v-for="(task, idx) in tasks" :key="task.canonicalName.join('.')" :config="taskBarConfig(task, idx)" @mouseover="mouseoverTaskBar" @mouseout="mouseoutTaskBar">
          <v-rect
            name="leaf task"
            v-if="task.isLeaf && task.duration > 2 * laneMargin * timeUnitPixels.unit / timeUnitPixels.pixels"
            :config="(function () {
              return {
                height: swimLaneWidth - 2 * laneMargin,
                fill: '#B3E5FC',
                cornerRadius,
                width: timeUnitPixels
                  ? Math.round(task.duration * timeUnitPixels.pixels / timeUnitPixels.unit)
                  : 0
              }
            })()">
          </v-rect>
          <v-rect v-else-if="task.isLeaf" :config="{
              height: swimLaneWidth - 2 * laneMargin,
              width: swimLaneWidth - 2 * laneMargin,
              offsetX: laneMargin,
              offsetY: laneMargin,
              y: laneMargin,
              fill: '#B3E5FC',
              rotation: 45
            }"></v-rect>
          <v-group name="non-leaf task" v-else>
            <v-rect :config="(function () {
                return {
                  height: swimLaneWidth - 2 * laneMargin,
                  fill: '#A7FFEB',
                  cornerRadius,
                  width: timeUnitPixels
                    ? Math.round(task.duration * timeUnitPixels.pixels / timeUnitPixels.unit)
                    : 0
                }
              })()">
            </v-rect>
            <v-path :config="(function () {
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
              })()"></v-path>
            <v-path :config="(function () {
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
              })()"></v-path>
          </v-group>
          <v-line name="task-progress-line" :config="(function () {
              let barWidth = Math.round(task.duration * timeUnitPixels.pixels / timeUnitPixels.unit)
              return {
                points: [0, 0, 0, swimLaneWidth - 2 * laneMargin],
                x: task.finishAt ? barWidth : 0,
                visible: !!(task.startAt || task.finishAt),
                stroke: '#FB8C00',
                strokeWidth: 2
              }
            })()"></v-line>
        </v-group>
      </v-layer>
      <v-layer name="dependency-lines">
        <v-line
          v-for="d in dependencies"
          :key="'line-' + d.key"
          :config="(function () {
            let { src, dest } = d
            let points = [src.x, src.y]
            let middleX = (src.x + dest.x) / 2
            let middleY = (src.y + dest.y) / 2
            if ((middleX - src.x) < 10) {
              points = points.concat([
                [middleX + 10, src.y],
                [middleX + 10, middleY],
                [middleX - 2 * 10, middleY],
                [middleX - 2 * 10, dest.y],
                [dest.x, dest.y]
              ])
            } else {
              points = points.concat([
                [middleX, src.y],
                [middleX, dest.y],
                [dest.x, dest.y]
              ])
            }
            points = points.reduce((a, b) => a.concat(b), [])
            return {
              stroke: d.color,
              strokeWidth: 2,
              points
            }
          })()"></v-line>
        <v-arrow v-for="d in dependencies" :key="'arrow' + d.key" :config="(function () {
            let { dest: { x, y } } = d
            return {
              fill: d.color,
              points: [x, y]
            }
          })()"></v-arrow>
      </v-layer>
      <v-layer name="lines">
        <v-line
          :config="progressLineConfig"
        ></v-line>
        <v-line
          :config="nowLineConfig"
        ></v-line>
      </v-layer>
    </v-stage>
  </div>
</template>

<script>

import outerWidth from './util/outer-width'
import debug_ from 'debug'

const debug = debug_('gantt:swim-pool')

let pallete = [
  '#FF6F00',
  '#9575CD',
  '#4DB6AC',
  '#795548',
  '#607D8B'
]

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
    cornerRadius: {
      type: Number,
      default: 8
    },
    offsetTop: {
      type: Number,
      default: 0
    }
  },
  mounted () {
    this.poolWidth = outerWidth(this.$refs.pool)
    debug('pool width', this.poolWidth)
  },
  beforeUpdate () {
    if (!this.laneMargin) {
      this.laneMargin = Math.round(this.swimLaneWidth / 3.6)
    }
  },
  data () {
    return {
      poolWidth: 0,
      laneMargin: 0
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
        y: (idx + 1) * this.swimLaneWidth,
        offsetY: this.swimLaneWidth - this.laneMargin,
        task: task.canonicalName.join('.')
      }
    },
    mouseoverTaskBar (c, evt) {
      let task = this.project.$(evt.currentTarget.attrs.task.split('.'))
      this.$emit('mouseoverTask', task, evt)
    },
    mouseoutTaskBar (c, evt) {
      let task = this.project.$(evt.currentTarget.attrs.task.split('.'))
      this.$emit('mouseoutTask', task, evt)
    }
  },
  computed: {
    swimPoolHeight () {
      return this.swimLaneWidth * this.tasks.length - 2
    },
    progressLineConfig () {
      let progressList = this.tasks.map(t => {
        if (t.progress !== void 0) {
          return t.expectedToStartAt + t.progress * t.duration()
        }
      }).filter(it => it)
      let newestProgress = Math.max(...progressList)
      let start = new Date(this.start).getTime()

      let { pixels, unit } = this.timeUnitPixels
      let points = [
        (newestProgress - start) * pixels / unit, 0
      ]

      for (let i = 0; i < this.tasks.length; ++i) {
        let t = this.tasks[i]
        if (t.progress !== void 0) {
          points = points.concat([
            points[0], i * this.swimLaneWidth + this.laneMargin,
            (t.expectedToStartAt + t.progress * t.duration() - start) * pixels / unit, (i + 0.5) * this.swimLaneWidth,
            points[0], (i + 1) * this.swimLaneWidth - this.laneMargin
          ])
        }
      }

      points = points.concat([
        points[0], this.swimPoolHeight
      ])

      return {
        stroke: '#512DA8',
        strokeWidth: 1,
        dash: [3, 3],
        points
      }
    },
    nowLineConfig () {
      let { pixels, unit } = this.timeUnitPixels
      let x = (new Date().getTime() - new Date(this.start).getTime()) * pixels / unit
      return {
        stroke: '#FF4043',
        strokeWidth: 1,
        dash: [3, 3],
        points: [
          x, 0,
          x, this.swimPoolHeight
        ]
      }
    },
    taskMap () {
      let d = {}
      for (let t of this.tasks) {
        d[t.canonicalName.join('.')] = t
      }
      return d
    },
    dependencies () {
      let ret = []
      let cn2LaneNum = {}
      for (let [idx, t] of Object.entries(this.tasks)) {
        cn2LaneNum[t.canonicalName.join('.')] = Number(idx)
      }
      let { pixels, unit } = this.timeUnitPixels
      let start = new Date(this.start).getTime()
      for (let destTask of this.tasks) {
        if (!destTask.plainDependsUpon || destTask.plainDependsUpon.length === 0) {
          continue
        }
        let dest = {
          x: Math.round((destTask.expectedToStartAt - start) * pixels / unit),
          y: (cn2LaneNum[destTask.canonicalName.join('.')] + 0.5) * this.swimLaneWidth - 1
        }
        ret = ret.concat(destTask.plainDependsUpon.map((srcTaskCn, idx) => {
          let srcTask = this.taskMap[srcTaskCn.join('.')]
          return {
            key: srcTaskCn.join('.') + '-' + destTask.canonicalName.join('.'),
            src: {
              x: Math.round((srcTask.expectedToFinishAt - start) * pixels / unit),
              y: (cn2LaneNum[srcTask.canonicalName.join('.')] + 0.5) * this.swimLaneWidth - 1
            },
            dest
          }
        }))
      }
      ret.forEach((d, idx) => {
        d.color = pallete[idx % pallete.length]
      })
      debug('dependencies', ret)
      return ret
    }
  }
}
</script>

<style scoped>
.swim-pool {
  position: relative;
  box-sizing: border-box;
}
</style>
