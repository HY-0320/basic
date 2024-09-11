import _ from 'lodash'
import { useRef } from 'react'

export function useUniqueId(): string {
  const idRefLazy = useRef<string | null>(null)

  if (idRefLazy.current == null) {
    idRefLazy.current = _.uniqueId()
  }

  return idRefLazy.current
}
