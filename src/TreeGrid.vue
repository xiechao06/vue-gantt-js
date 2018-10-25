<template>
  <div class="tree-grid">
    <table :style="{
      marginTop: headerHeight + 'px'
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
</template>

<script>
import { library } from '@fortawesome/fontawesome-svg-core'
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import outerHeight from './util/outer-height'

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
  mounted () {
    this.$nextTick(() => this.$emit('reportSwimLaneWidth', outerHeight(this.$refs.row[0])))
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
    }
  }
}
</script>

<style scoped>
.tree-grid table {
  table-layout: fixed;
  border-collapse: collapse;
  border-top: 1px solid #9e9e9e;
  border-right: 1px solid #9e9e9e;
  width: 100%;
}

tr {
  height: 2em;
  line-height: 2em;
  text-align: left;
  border-left: 1px solid #9e9e9e;
  border-bottom: 1px solid #9e9e9e;
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
</style>
