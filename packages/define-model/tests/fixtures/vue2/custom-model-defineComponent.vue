<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  model: {
    prop: 'value',
    event: 'changeInput'
  },
})
</script>
<script setup lang="ts">
let { value, title } = defineModel<{
  value: string
  title: string
}>()

const { id } = defineProps<{ id: string }>()

const emit = defineEmits<{
  (evt: 'change'): void
}>()

{
  value = 'hello'
  title = 'world'
  emit('change')

  {
    let modelValue = 'world'
    modelValue = 'foo'
  }
}
</script>
