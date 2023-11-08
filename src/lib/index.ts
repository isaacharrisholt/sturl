import { writable, type Writable } from 'svelte/store'
import { goto } from '$app/navigation'
import { browser } from '$app/environment'

import type { z, AnyZodObject, ZodSchema } from 'zod'

type SturlOptions = Parameters<typeof goto>[1] & { ignoreFalsey?: boolean }
type Sturl<T extends AnyZodObject> = Pick<
	Writable<Partial<z.infer<T>>>,
	'subscribe' | 'set'
>

/**
 * Get an object from the URL query string.
 * @param url Optional URL to parse. If not provided, will use the current URL.
 * @returns object
 */
function getObjectFromUrl(url?: URL | string): Record<string, string> {
	const defaultUrl = url
		? new URL(url)
		: browser
		? new URL(window.location.href)
		: undefined
	const params = new URLSearchParams(defaultUrl?.searchParams)
	return Object.fromEntries(params.entries())
}

function getValidObject<T extends AnyZodObject>(
	schema: T,
	obj: object,
	ignoreFalsey = false,
): Partial<z.infer<T>> {
	const newObj = {} as Partial<z.infer<T>>

	for (const [key, s] of Object.entries(schema.shape)) {
		const value = obj[key as keyof typeof obj]
		// Only add value to object if it's not undefined
		// or if ignoreFalsey is false and value is not falsey
		if (value || (!ignoreFalsey && value !== undefined)) {
			const result = (s as ZodSchema).safeParse(value)
			if (result.success) {
				newObj[key as keyof typeof newObj] = result.data
			}
		}
	}
	return newObj
}

/**
 * Create a Sturl - a Svelte store that syncs with the URL query string.
 * @param schema Zod schema to validate URL state against
 * @param url Optional default state. Will use current URL if not provided.
 * @param opts Options object. Mostly shares options with goto, with additional `ignoreFalsey` option.
 */
export function sturled<T extends AnyZodObject>(
	schema: T,
	url?: URL | string,
	opts: SturlOptions = {},
): Sturl<T> {
	const initialValue = getValidObject(schema, getObjectFromUrl(url))

	const { subscribe, set } = writable<Partial<z.infer<T>>>(initialValue)

	return {
		subscribe,
		set: (value: Partial<z.infer<T>>) => {
			const newObj = getValidObject(schema, value, opts?.ignoreFalsey)
			const params = new URLSearchParams(newObj as Record<string, string>)
			goto(`?${params.toString()}`, opts)
			set(newObj)
		},
	}
}
