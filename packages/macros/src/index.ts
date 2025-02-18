import { createCombinePlugin } from 'unplugin-combine'
import VueDefineModel from '@vue-macros/define-model'
import VueDefineOptions from 'unplugin-vue-define-options'
import VueDefineRender from '@vue-macros/define-render'
import VueHoistStatic from '@vue-macros/hoist-static'
import VueSetupComponent from '@vue-macros/setup-component'
import VueSetupSFC from '@vue-macros/setup-sfc'

import { getVueVersion } from './utils'
import type { UnpluginInstance } from 'unplugin'
import type { OptionsPlugin, Unplugin } from 'unplugin-combine'
import type { Options as OptionsDefineModel } from '@vue-macros/define-model'
import type { Options as OptionsDefineOptions } from 'unplugin-vue-define-options'
import type { Options as OptionsDefineRender } from '@vue-macros/define-render'
import type { Options as OptionsHoistStatic } from '@vue-macros/hoist-static'
import type { Options as OptionsSetupComponent } from '@vue-macros/setup-component'
import type { Options as OptionsSetupSFC } from '@vue-macros/setup-sfc'

export interface FeatureOptionsMap {
  defineModel: OptionsDefineModel
  defineOptions: OptionsDefineOptions
  defineRender: OptionsDefineRender
  hoistStatic: OptionsHoistStatic
  setupComponent: OptionsSetupComponent
  setupSFC: OptionsSetupSFC
}
export type FeatureName = keyof FeatureOptionsMap
export type FeatureOptions = FeatureOptionsMap[FeatureName]

export interface OptionsCommon {
  root?: string
  version?: 2 | 3
  plugins?: {
    vue?: any
    vueJsx?: any
  }
}

type OptionalSubOptions<T> = boolean | Omit<T, keyof OptionsCommon> | undefined

export type Options = OptionsCommon & {
  [K in FeatureName]?: OptionalSubOptions<FeatureOptionsMap[K]>
}

export type OptionsResolved = Required<OptionsCommon> & {
  [K in FeatureName]: false | FeatureOptionsMap[K]
}

function resolveOptions({
  root,
  version,
  plugins,
  defineModel,
  defineOptions,
  defineRender,
  hoistStatic,
  setupComponent,
  setupSFC,
}: Options): OptionsResolved {
  function resolveSubOptions<K extends FeatureName>(
    options: OptionalSubOptions<FeatureOptionsMap[K]>,
    commonOptions: Partial<
      Pick<OptionsCommon, keyof OptionsCommon & keyof FeatureOptionsMap[K]>
    > = {}
  ): FeatureOptionsMap[K] | false {
    if (options === false) return false
    else if (options === true || options === undefined)
      return { ...commonOptions }
    else return { ...options, ...commonOptions }
  }

  return {
    root: root || process.cwd(),
    version: version || getVueVersion(),
    plugins: plugins || {},

    defineModel: resolveSubOptions<'defineModel'>(defineModel, { version }),
    defineOptions: resolveSubOptions<'defineOptions'>(defineOptions),
    defineRender: resolveSubOptions<'defineRender'>(defineRender),
    hoistStatic: resolveSubOptions<'hoistStatic'>(hoistStatic),
    setupComponent: resolveSubOptions<'setupComponent'>(setupComponent, {
      root,
    }),
    setupSFC: resolveSubOptions<'setupSFC'>(setupSFC),
  }
}

function resolvePlugin(
  options: FeatureOptions | false,
  unplugin: UnpluginInstance<any>
): Unplugin<any> | undefined {
  if (!options) return
  return [unplugin, options]
}

const name = 'unplugin-vue-macros'

export default createCombinePlugin((userOptions: Options = {}) => {
  const options = resolveOptions(userOptions)

  const plugins: OptionsPlugin[] = [
    resolvePlugin(options.setupSFC, VueSetupSFC),
    resolvePlugin(options.setupComponent, VueSetupComponent),
    resolvePlugin(options.hoistStatic, VueHoistStatic),
    resolvePlugin(options.defineOptions, VueDefineOptions),
    resolvePlugin(options.defineModel, VueDefineModel),
    options.plugins.vue,
    options.plugins.vueJsx,
    resolvePlugin(options.defineRender, VueDefineRender),
  ].filter(Boolean)

  return {
    name,
    plugins,
  }
})
