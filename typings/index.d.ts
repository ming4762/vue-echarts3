
declare type RendererType = 'canvas' | 'svg'

declare type InitOption = {
  renderer?: RendererType;
  devicePixelRatio?: number;
  width?: number;
  height?: number;
  locale?: string | LocaleOption;
}

export {
  InitOption
}
