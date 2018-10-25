<template>
  <div class="tree-grid">
    <div :style="{
      height: headerHeight + 'px'
    }"></div>
    <div class="table-container" :style="{
      height: tableContainerHeight + 'px'
    }">
      <table ref="table" @wheel="wheel">
        <tbody>
          <tr v-for="task in tasks" :key="task.canonicalName.join('.')" :data-task-canonical-name="task.canonicalName.join('.')" @click="clickTaskName" ref="row">
            <th class="task-name" :style="{ paddingLeft: (0.5 + task.level * 1.5) + 'em' }">
              <font-awesome-icon :icon="task.collapsed ? 'plus' : 'minus'" size="xs" v-if="!task.isLeaf"></font-awesome-icon>
              {{ task.name() }}
            </th>
          </tr>
        </tbody>
      </table>
      <div class='v-scroll-bar' v-if="!!vScrollBarVisible" :style="{
        height: tableContainerHeight && tableHeight
          ? (tableContainerHeight / tableHeight) * tableContainerHeight + 'px'
          : '0px',
        top: tableContainerHeight && tableHeight
          ? offsetTop * tableContainerHeight / tableHeight + 'px'
          : '0px'
      }"></div>
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
      offsetTop: 0,
      swimLaneWidth: 0,
      vScrollBarVisible: 0
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.swimLaneWidth = outerHeight(this.$refs.row[0]) + 1
      this.$emit('reportSwimLaneWidth', this.swimLaneWidth)
    })
    this.tryHideVScrollBar()
  },
  components: {
    'font-awesome-icon': FontAwesomeIcon
  },
  methods: {
    tryHideVScrollBar () {
      this.raf = window.requestAnimationFrame(() => {
        this.tryHideVScrollBar()
      })
      if (this.vScrollBarVisible <= 0) {
        return
      }
      --this.vScrollBarVisible
    },
    clickTaskName ({ currentTarget }) {
      let cn = currentTarget.getAttribute('data-task-canonical-name')
      let task = cn ? this.project.$(cn.split('.')) : this.project
      if (task && !task.isLeaf) {
        this.$emit('toggle', task)
      }
    },
    wheel: function wheel (evt) {
      if (this.maxOffsetTop <= 0) {
        return
      }
      this.vScrollBarVisible = 20

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
}

.table-container {
  border: 1px solid #e0e0e0;
  overflow: hidden;
  box-sizing: border-box;
  position: relative;
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
}

.task-name {
  text-align: left;
}

.v-scroll-bar {
  background-color: rgba(160, 160, 160, 0.7);
  border-radius: 5px;
  left: 0;
  position: absolute;
  width: 10px;
}

</style>
