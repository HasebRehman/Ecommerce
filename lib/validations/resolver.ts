import { zodResolver } from '@hookform/resolvers/zod'
import type { ZodTypeAny } from 'zod'

export function createResolver(schema: ZodTypeAny) {
  return zodResolver(schema as any)
}