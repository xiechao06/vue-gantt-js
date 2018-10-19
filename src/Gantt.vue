<template>
  <div class="gantt">
    <table class="gantt">
      <thead>
        <tr>
          <th>任务名称</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="task in flattenedTasks" :key="task.canonicalName.join('.')">
          <th class="gantt-task-name" :style="{ paddingLeft: (0.5 + task.level * 1.5) + 'em' }">
            <font-awesome-icon icon="minus" size="xs" v-if="!task.isLeaf"></font-awesome-icon>
            {{ task.name }}
          </th>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { Project } from 'gantt-engine'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faPlus, faMinus)

function flattenTask (task) {
  return task.subTasks
    .reduce((a, b) => a.concat(flattenTask(b)), [task])
}

export default {
  props: {
    project: Project
  },
  computed: {
    flattenedTasks () {
      return flattenTask(this.project)
        .map(it => it.toJSON())
    }
  },
  components: {
    'font-awesome-icon': FontAwesomeIcon
  }
}
</script>

<style scoped>
.gantt table {
  table-layout: fixed;
  border-collapse: collapse;
  border-top: 1px solid #9E9E9E;
  font-size: 12px;
}

.gantt tr {
  text-align: left;
  border-bottom: 1px solid #9E9E9E;
  height: 2em;
  line-height: 2em;
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

.gantt-task-level-1 {
  padding-left: 2em;
}

.gantt-task-level-2 {
  padding-left: 4em;
}

.gantt-task-level-3 {
  padding-left: 6em;
}

</style>
