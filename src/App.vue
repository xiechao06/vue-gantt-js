<template>
  <div id="app">
    <Gantt
      :project="project"
      @mouseoverTask="mouseoverTask"
      @mouseoutTask="mouseoutTask"
      @startTask="startTask"
      @finishTask="finishTask"
    ></Gantt>
    <div class="modal" :style="modalStyle" v-if="hoveredTask" ref="modal">
      <h3>{{ hoveredTask.name() }}</h3>
      <ul>
        <li v-if="hoveredTask.startAt()">
          <span>start at - </span>
          <span>{{ format(new Date(hoveredTask.startAt()), 'yyyy-mm-dd HH:MM') }}</span>
        </li>
        <li v-if="hoveredTask.finishAt()">
          <span>finish at - </span>
          <span>{{ format(new Date(hoveredTask.finishAt()), 'yyyy-mm-dd HH:MM') }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { Project } from 'gantt-engine'
import Gantt from './Gantt'
import { format, subDays } from 'date-fns'
import VueSweetalert2 from 'vue-sweetalert2'
import Vue from 'vue'

Vue.use(VueSweetalert2)

localStorage.debug = 'gantt:*'

// #ff0000
export default {
  name: 'app',
  components: {
    Gantt
  },
  data () {
    let base = subDays(new Date(), 20)
    return {
      format,
      project: new Project('sample')
        .base(base)
        .addSubTask(t => t
          .name('隐蔽工程')
          .addSubTask(t => t
            .name('开工')
            .duration('1d')
          )
          .addSubTask(t => t
            .name('放样')
            .duration('1d')
            .dependsUpon('~')
          )
          .addSubTask(t => t
            .name('拆除水电')
            .dependsUpon('~')
            .duration('6d')
          )
          .addSubTask(t => t
            .name('工程验收')
            .dependsUpon('~')
            .duration('2d')
          )
        )
        .addSubTask(t => t
          .name('木瓦工程')
          .dependsUpon('~')
          .addSubTask(t => t
            .name('木瓦施工')
            .duration('18d')
          )
          .addSubTask(t => t
            .name('工程验收')
            .dependsUpon(['木瓦工程', '木瓦施工'])
            .duration('2d')
          )
          .addSubTask(t => t
            .name('上传中期款凭证')
            .duration('7d')
          )
        )
        .addSubTask(t => t
          .name('油漆工程')
          .dependsUpon('~')
          .addSubTask(t => t
            .name('油漆施工')
            .duration('18d')
          )
          .addSubTask(t => t
            .name('工程验收')
            .dependsUpon('~')
            .duration('2d')
          )
        )
        .addSubTask(t => t
          .name('主材安装')
          .dependsUpon('~')
          .addSubTask(t => t
            .name('集成吊顶安装')
            .duration('5d')
          )
          .addSubTask(t => t
            .name('木门橱柜安装')
            .dependsUpon('~')
            .duration('5d')
          )
          .addSubTask(t => t
            .name('地板安装')
            .dependsUpon('~')
            .duration('5d')
          )
          .addSubTask(t => t
            .name('灯具卫浴安装')
            .dependsUpon('~')
            .duration('5d')
          )
          .addSubTask(t => t
            .name('窗帘墙纸安装')
            .dependsUpon('~')
            .duration('5d')
          )
          .addSubTask(t => t
            .name('保洁')
            .dependsUpon('~')
            .duration('3d')
          )
          .addSubTask(t => t
            .name('上传尾款凭证')
            .duration('3d')
          )
        )
        .addSubTask(t => t
          .name('家具家电安装')
          .dependsUpon('~')
          .addSubTask(t => t
            .name('家电安装')
            .duration('3d')
          )
          .addSubTask(t => t
            .name('竣工验收')
            .dependsUpon('~')
            .duration('2d')
          )
        ),
      hoveredTask: null,
      mouseoverTaskPos: null
    }
  },
  methods: {
    mouseoverTask (task, { x, y }, evt) {
      this.hoveredTask = task
      this.mouseoverTaskPos = { x, y }
    },
    mouseoutTask () {
      this.hoveredTask = null
      this.mouseoverTaskPos = null
    },
    startTask (task) {
      this.$swal(
        `Are you sure to start task ${task.name()}?`,
        '',
        'question'
      )
        .then(({ value }) => {
          if (value) {
            task.startAt(new Date())
            this.project = this.project.clone()
          }
        })
    },
    finishTask (task) {
      this.$swal(
        `Are you sure to finish task ${task.name()}?`,
        '',
        'question'
      )
        .then(({ value }) => {
          if (value) {
            task.finishAt(new Date())
            this.project = this.project.clone()
          }
        })
    }
  },
  computed: {
    modalStyle () {
      if (!this.hoveredTask) {
        return {}
      }
      let { x, y } = this.mouseoverTaskPos
      return {
        display: this.hoveredTask ? 'block' : 'none',
        top: y - 220 + 'px',
        left: x - 30 + 'px'
      }
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  position: relative;
}

.gantt {
  height: calc(45em - 10px);
}

.modal {
  display: block;
  position: absolute;
  z-index: 999;
  background-color: rgba(75, 75, 75, 0.7);
  color: white;
  padding: 5px;
  border-radius: 4px;
  width: 300px;
  max-height: 150px;
  height: 150px;
  box-sizing: border-box;
}

.modal ul {
  list-style-type: none;
  padding-left: 0%;
  text-align: left;
}
</style>
