const colors = reactive({
  p: '', pf: '', s: '', sf: '', a: '', af: '', b1: '', b2: '', b3: '', bc: '', n: '', nc: ''
})
const mode = useColorMode({
  attribute: 'data-theme',
  modes: {
    dark: 'dark',
    light: 'cupcake',
  }
})
watch(mode, () => {
  // console.log(mode.value);
  nextTick(() => {
    const computedStyles = getComputedStyle(document.querySelector(':root'))
    Object.entries(colors).forEach(([key, value]) => {
      colors[key] = `oklch(${computedStyles.getPropertyValue(`--${key}`)})`
    })
    // colors.p = `hsl(${computedStyles.getPropertyValue('--p')})`
    // console.log(colors);
  })
  // canvas.value.style.backgroundColor = lala.value
}, { immediate: true })

export {colors, mode}