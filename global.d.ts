declare let __DEV__: boolean

declare module '*.less' {
  interface IClassNames {
    [className: string]: string
  }
  const classNames: IClassNames
  // @ts-ignore
  export = classNames
}
