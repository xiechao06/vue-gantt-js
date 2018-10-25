<template>
  <div class="tree-grid">
    <div :style="{
      height: headerHeight + 'px'
    }"></div>
    <div class="table-container" :style="{
      height: tableContainerHeight + 'px'
    }">
      <table ref="table" @wheel="wheel" :style="{
        top: '0px'
      }">
        <tbody>
          <tr v-for="task in tasks" :key="task.canonicalName.join('.')" :data-task-canonical-name="task.canonicalName.join('.')" @click="clickTaskName" ref="row">
            <th class="task-name" :style="{ paddingLeft: (0.5 + task.level * 1.5) + 'em' }">
              <font-awesome-icon :icon="task.collapsed ? 'plus' : 'minus'" size="xs" v-if="!task.isLeaf"></font-awesome-icon>
              {{ task.name() }}
            </th>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { library } from '@fortawesome/fontawesome-svg-core'
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import outerHeight from './util/outer-height'
import debug_ from 'debug'
import throttle from 'lodash.throttle'

const debug = debug_('gantt:tree-grid') // eslint-disable-line no-unused-vars

library.add(faPlus, faMinus)

export default {
  props: {
    project: Object,
    tasks: {
      type: Array,
      default: function () {
        return []
      }
    },
    headerHeight: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      wheeling: false,
      offsetTop: 0,
      swimLaneWidth: 0,
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.swimLaneWidth = outerHeight(this.$refs.row[0]) + 1
      this.$emit('reportSwimLaneWidth', this.swimLaneWidth)
    })
  },
  components: {
    'font-awesome-icon': FontAwesomeIcon
  },
  methods: {
    clickTaskName ({ currentTarget }) {
      let cn = currentTarget.getAttribute('data-task-canonical-name')
      let task = cn ? this.project.$(cn.split('.')) : this.project
      if (task && !task.isLeaf) {
        this.$emit('toggle', task)
      }
    },
    stopWheeling: throttle(function stopWheeling () {
      setTimeout(() => {
        this.wheeling = false
      }, 200)
    }, 200),
    wheel: function wheel (evt) {
      if (this.maxOffsetTop <= 0) {
        return
      }
      this.wheeling = true
      this.stopWheeling()

      // go down will generate a negative deltaY, 
      // and I want go down to give more offset
      this.offsetTop -= evt.deltaY
      // reach the top
      if (this.offsetTop < 0) {
        this.offsetTop = 0
      }
      if (this.offsetTop > this.maxOffsetTop) {
        this.offsetTop = this.maxOffsetTop
      }
      this.$emit('scroll', Math.round(this.offsetTop / this.swimLaneWidth))
    }
  },
  computed: {
    tableContainerHeight () {
      if (!this.headerHeight || !this.$el) {
        return 0
      }
      return Math.min(outerHeight(this.$el) - this.headerHeight, this.tableHeight)
    },
    tableHeight () {
      return outerHeight(this.$refs.table)
    },
    maxOffsetTop () {
      return this.tableHeight - this.tableContainerHeight
    }
  }
}
</script>

<style scoped>
.tree-grid table {
  table-layout: fixed;
  border-collapse: collapse;
  width: 100%;
  position: relative;
  box-sizing: border-box;
}

.table-container {
  border: 1px solid #e0e0e0;
  overflow: hidden;
  box-sizing: border-box;
}

tr {
  height: 2em;
  line-height: 2em;
  text-align: left;
  border-bottom: 1px solid #f5f5f5;
  box-sizing: border-box;
  user-select: none;
}

th,
td {
  padding-right: 0.5em;
  box-sizing: border-box;
}

.task-name {
  text-align: left;
}
</style>
