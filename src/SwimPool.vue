<template>
  <div class="swim-pool" :style="{
    height: swimLaneWidth * tasks.length + 'px'
  }" ref='pool'>
    <v-stage :config="{
      width: poolWidth,
      height: swimLaneWidth * tasks.length
    }">
      <v-layer>
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
    </v-stage>
  </div>
</template>

<script>

import outerWidth from './util/outer-width'
import debug_ from 'debug'

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
    swimLaneWidth: Number
  },
  mounted () {
    this.poolWidth = outerWidth(this.$refs.pool)
    debug('pool width', this.poolWidth)
  },
  data () {
    return {
      poolWidth: 0
    }
  }
}
</script>

<style scoped>
.swim-pool {
  border: 1px solid #EEEEEE;
}
</style>
