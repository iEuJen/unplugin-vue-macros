import { rollup } from 'rollup'
import { default as ViteVueJsx } from '@vitejs/plugin-vue-jsx'
import type { Options as VueJsxOptions } from '@vitejs/plugin-vue-jsx'
import type { Plugin } from 'rollup'

export { default as RollupEsbuildPlugin } from 'rollup-plugin-esbuild'
export { default as RollupVue } from 'unplugin-vue/rollup'
export const RollupVueJsx = ViteVueJsx as (options?: VueJsxOptions) => Plugin

export const RollupToStringPlugin = (): Plugin => {
  return {
    name: 'to-string',
    transform: (code) => `export default \`${code.replace(/`/g, '\\`')}\``,
  }
}

export const RollupRemoveVueFilePathPlugin = (): Plugin => {
  const REGEX = /\[["']__file["'],\s*["'](.*?)["']]/g
  return {
    name: 'remove-vue-filepath',
    transform(code: string) {
      const transformed = code.replace(REGEX, '__FILE__')
      if (code !== transformed) return transformed
    },
  }
}

export async function rollupBuild(file: string, plugins: Plugin[]) {
  const bundle = await rollup({
    input: [file],
    external: ['vue'],
    plugins,
    treeshake: false,
  })
  const output = await bundle.generate({
    format: 'esm',
    sourcemap: false,
  })
  return output.output
    .map((file) => (file.type === 'chunk' ? file.code : file.fileName))
    .join('\n')
}
