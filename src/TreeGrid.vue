<template>
  <div class="tree-grid">
    <div :style="{
      height: headerHeight + 'px'
    }"></div>
    <div class="container" :style="{
      height: tableContainerHeight + 'px'
    }">
      <div ref="list" class="list" @wheel="wheel" :style="{
        top: -offsetTop + 'px'
      }">
        <div
          class="task-item"
          v-for="task in tasks"
          :key="task.canonicalName.join('.')"
          :data-task-canonical-name="task.canonicalName.join('.')"
          @click="clickTaskName"
          ref="item"
        >
          <div class="task-name" :style="{ paddingLeft: (0.5 + task.level * 1.5) + 'em' }">
            <font-awesome-icon
              :icon="task.collapsed ? 'plus' : 'minus'" size="xs" v-if="!task.isLeaf"
            ></font-awesome-icon>
            {{ task.name() }}
          </div>
          <div class="ops">
            <font-awesome-icon
              icon="play-circle" size="sm"
              :style="{color: '#43A047'}"
              v-if="~task.ops.indexOf('start')"
              :data-task-canonical-name="task.canonicalName.join('.')"
              @click="clickStart"
            ></font-awesome-icon>
            <font-awesome-icon
              icon="stop-circle" size="sm"
              :style="{color: '#F4511E'}"
              v-if="~task.ops.indexOf('finish')"
              :data-task-canonical-name="task.canonicalName.join('.')"
              @click="clickFinish"
            ></font-awesome-icon>
          </div>
        </div>
      </div>
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
import { faPlus, faMinus, faPlayCircle, faStopCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import outerHeight from './util/outer-height'
import debug_ from 'debug'

const debug = debug_('gantt:tree-grid') // eslint-disable-line no-unused-vars

library.add(faPlus, faMinus, faPlayCircle, faStopCircle)

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
      this.swimLaneWidth = outerHeight(this.$refs.item[0])
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
      this.$emit('scroll', this.offsetTop)
    },
    clickStart (evt) {
      let cn = evt.currentTarget.getAttribute('data-task-canonical-name')
      let task = cn ? this.project.$(cn.split('.')) : this.project
      if (task && task.isLeaf) {
        this.$emit('startTask', task)
      }
    },
    clickFinish (evt) {
      let cn = evt.currentTarget.getAttribute('data-task-canonical-name')
      let task = cn ? this.project.$(cn.split('.')) : this.project
      if (task && task.isLeaf) {
        this.$emit('finishTask', task)
      }
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
      return outerHeight(this.$refs.list)
    },
    maxOffsetTop () {
      return this.tableHeight - this.tableContainerHeight
    }
  }
}
</script>

<style scoped>
.container {
  border: 1px solid #e0e0e0;
  overflow: hidden;
  box-sizing: border-box;
  position: relative;
}

.list {
  width: 100%;
  position: relative;
}

.task-item {
  height: 2em;
  line-height: 2em;
  text-align: left;
  border-bottom: 1px solid #f5f5f5;
  box-sizing: border-box;
  user-select: none;
  padding-right: 0.5em;
  display: flex
}

.task-name {
  text-align: left;
  flex: 1;
}

.ops {
  flex: 0;
  display: flex;
  align-items: center;
}

.v-scroll-bar {
  background-color: rgba(160, 160, 160, 0.7);
  border-radius: 5px;
  left: 0;
  position: absolute;
  width: 10px;
}

</style>
