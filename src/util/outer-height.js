function outerHeight (el) {
  let height = el.offsetHeight
  let style = window.getComputedStyle(el)
  height += parseInt(style.marginTop) + parseInt(style.marginBottom)
  return height
}

export default outerHeight
