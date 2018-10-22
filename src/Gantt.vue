<template>
  <div class="gantt">
    <div class="gantt-tree-grid">
      <table :style="{
        marginTop: timeRulerHeight + 'px'
        }">
        <tbody>
          <tr v-for="task in flattenedTasks" :key="task.canonicalName.join('.')">
            <th
              class="gantt-task-name"
              :style="{ paddingLeft: (0.5 + task.level * 1.5) + 'em' }"
              :data-task-canonical-name="task.canonicalName.join('.')"
              @click="onClickTaskName"
              >
              <font-awesome-icon :icon="task.collapsed ? 'plus' : 'minus'" size="xs" v-if="!task.isLeaf"></font-awesome-icon>
              {{ task.name }}
            </th>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="gantt-task-panel-container">
      <div class="gantt-task-panel"  @wheel="onWheelTaskPanel">
        <time-ruler
          :startFrom="startFrom"
          type="d/w"
          :offset="taskPanelOffset"
          ref="timeRuler"
          @getHeight="getTimeRulerHeight"
        >
        </time-ruler>
      </div>
    </div>
  </div>
</template>

<script>
import { Project } from 'gantt-engine'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import TimeRuler from './TimeRuler'

library.add(faPlus, faMinus)

export default {
  props: {
    project: Project,
    startFrom: {
      type: [String, Date],
      default () {
        return new Date()
      }
    }
  },
  data () {
    return {
      collapsed: [],
      taskPanelOffset: 0,
      timeRulerHeight: 0
    }
  },
  computed: {
    flattenedTasks () {
      return this.flattenTaskIter(this.project)
        .map(it => it.toJSON())
        .map(it => {
          it.collapsed = ~this.collapsed.indexOf(it.canonicalName.join('.'))
          return it
        })
    }
  },
  components: {
    'font-awesome-icon': FontAwesomeIcon,
    'time-ruler': TimeRuler
  },
  methods: {
    flattenTaskIter (task) {
      if (~this.collapsed.indexOf(task.canonicalName.join('.'))) {
        return [task]
      }
      return task.subTasks
        .reduce((a, b) => a.concat(this.flattenTaskIter(b)), [task])
    },
    onClickTaskName ({ currentTarget }) {
      let cn = currentTarget.getAttribute('data-task-canonical-name')
      let task = cn ? this.project.$(cn.split('.')) : this.project
      if (task && !task.isLeaf) {
        if (~this.collapsed.indexOf(cn)) {
          this.collapsed = this.collapsed.filter(it => it !== cn)
        } else {
          this.collapsed = this.collapsed.concat(cn)
        }
      }
    },
    onWheelTaskPanel (e) {
      this.taskPanelOffset += e.deltaX
    },
    getTimeRulerHeight (h) {
      this.timeRulerHeight = h
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

.gantt-tree-grid {
  flex: 3;
}

.gantt-task-panel-container {
  flex: 7;
  overflow-x: hidden;
  overflow-y: auto;
}

.gantt-task-panel {
  width: 110%;
  height: 100%;
  /* background-color: red; */
}

.gantt-tree-grid table {
  table-layout: fixed;
  border-collapse: collapse;
  border-top: 1px solid #9E9E9E;
  border-right: 1px solid #9E9E9E;
  width: 100%;
}

.gantt tr {
  height: 2em;
  line-height: 2em;
  text-align: left;
  border-left: 1px solid #9E9E9E;
  border-bottom: 1px solid #9E9E9E;
}

.gantt th, .gantt td {
  padding-right: .5em;
}

.gantt-left-icon {
  display: inline-block;
  margin: 0 5px
}

.gantt-task-name {
  text-align: left;
  display: inline-block
}
</style>
