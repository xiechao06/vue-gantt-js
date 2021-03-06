<template>
  <div class="time-ruler-container" ref="container">
    <table class="time-ruler" :style="{
      left: differenceInDays(firstDayInWindow, firstDayInViewport) * dayCellWidth + 'px'
    }">
      <tbody>
        <tr v-if="!unmounted">
          <td v-for="m in monthsInWindow" :key="m.getTime()" :colspan="getDaysInMonth(m)" class="month">
            {{ format(m, 'yyyy年MM月') }}
          </td>
        </tr>
        <!-- this is just for calculate the day cell width -->
        <tr v-if="unmounted">
          <td class="day" ref="dayCell">30</td>
        </tr>
        <tr v-if="!unmounted">
          <td
            v-for="day in daysInWindow"
            :key="day.key" class="day"
            :class="[
              {
                'last-day-in-week': day.lastDayInWeek,
                'is-today': day.isToday
              },
              'week-' + (day.weekIdx & 1 ? 'odd' : 'even'),
            ]"
          >
            {{ day.dayInMonth }}
          </td>
        </tr>
        <tr v-if="!unmounted">
          <td
            v-for="day in daysInWindow"
            :key="day.key"
            class="day"
            :class="[
              {
                'last-day-in-week': day.lastDayInWeek,
                'is-today': day.isToday
              },
              'week-' + (day.weekIdx & 1 ? 'odd' : 'even')
            ]"
          >
            {{ day.dayInWeek }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import outerWidth from './util/outer-width.js'
import outerHeight from './util/outer-height.js'
import debug_ from 'debug'
import {
  startOfMonth,
  addDays,
  format,
  addMonths,
  isAfter,
  getDaysInMonth,
  getWeek,
  isEqual,
  startOfDay,
  differenceInDays
} from 'date-fns'
import timestring from 'timestring'
const debug = debug_('gantt:time-ruler')

export default {
  unmounted: true,
  containerWidth: 0,

  props: {
    startFrom: [String, Date],
    type: String,
    offset: Number
  },
  data () {
    return {
      unmounted: true,
      format,
      getDaysInMonth,
      differenceInDays,
      dayCellWidth: 1
    }
  },
  mounted () {
    this.unmounted = false
    this.dayCellWidth = outerWidth(this.$refs.dayCell)
    this.containerWidth = outerWidth(this.$refs.container)
    debug('day cell width', this.dayCellWidth)
    debug('container width', this.containerWidth)
    this.$nextTick(() => {
      this.$emit('getHeight', outerHeight(this.$refs.container))
      this.$emit('reportTimeUnitPixels', timestring('1d', 'ms'), this.dayCellWidth)
    })
    debug('day cell cnt', this.dayCntInViewport)
  },
  updated () {
    if (!isEqual(this._firstDayInViewport, this.firstDayInViewport)) {
      this._firstDayInViewport = this.firstDayInViewport
      this.$emit('change',
        this._firstDayInViewport,
        addDays(this._firstDayInViewport, this.dayCntInViewport)
      )
    }
  },
  computed: {
    dayCntInViewport () {
      return Math.ceil(this.containerWidth / this.dayCellWidth)
    },
    // window holds then number days which are enough to cover viewport
    // the first day in monts in window
    monthsInWindow () {
      if (this.unmounted) {
        return []
      }
      let { firstDayInWindow } = this
      let d = firstDayInWindow
      let lastDayInViewport = addDays(this.firstDayInViewport, this.dayCntInViewport)

      let ret = []
      while (isAfter(lastDayInViewport, d)) {
        ret.push(d)
        d = addMonths(d, 1)
      }
      return ret
    },
    firstDayInWindow () {
      // this first in the month where view port first day belongs
      return startOfMonth(this.firstDayInViewport)
    },
    firstDayInViewport () {
      return addDays(startOfDay(this.startFrom), Math.round(this.offset / this.dayCellWidth))
    },
    daysInWindow: function () {
      if (this.unmounted) {
        return []
      }
      let { firstDayInWindow } = this
      let lastDayInWindow = addMonths((this.monthsInWindow[this.monthsInWindow.length - 1]), 1)
      let today = startOfDay(new Date())
      let ret = []
      for (let d = firstDayInWindow; isAfter(lastDayInWindow, d); d = addDays(d, 1)) {
        let dayInWeek = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()]
        ret.push({
          key: d.getTime(),
          dayInMonth: d.getDate(),
          dayInWeek,
          lastDayInWeek: dayInWeek === '六',
          weekIdx: getWeek(d),
          isToday: isEqual(today, d)
        })
      }
      return ret
    }
  }
}
</script>

<style scoped>
.time-ruler-container {
  flex: 1;
  z-index: 500;
}

table.time-ruler {
  font-size: 8px;
  border-collapse: collapse;
  table-layout: fixed;
  position: relative;
  user-select: none;
}

.time-ruler td {
  text-align: center;
  border-right: 1px solid #E0E0E0;
  border-bottom: 1px solid #E0E0E0;
}

.time-ruler .month {
  letter-spacing: 2.5em;
}

.time-ruler .day {
  max-width: 2.5em;
  min-width: 2.5em;
  box-sizing: border-box;
  padding: 0;
}

.time-ruler .day.week-odd {
  background-color: #B2EBF2;
}

.time-ruler .day.is-today {
  background-color: #F50057;
  color: white;
}

</style>
