import { Config } from '@stencil/core'

export const config: Config = {
  namespace: 'shader-mapper',
  commonjs: {
    include: /node_modules|(..\/.+)/,
    namedExports: {
      'commonjs-dep': ['shader-mapper'],
    },
  } as any,
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'docs-readme',
    },
    {
      type: 'www',
      serviceWorker: null, // disable service workers
    },
  ],
}
