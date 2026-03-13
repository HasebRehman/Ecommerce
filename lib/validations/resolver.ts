import { zodResolver } from '@hookform/resolvers/zod'
import type { ZodType, ZodTypeDef } from 'zod'

export function createResolver<T>(schema: ZodType<T, ZodTypeDef, T>) {
  return zodResolver(schema as any) 
}