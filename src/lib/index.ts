import { writable, type Writable } from 'svelte/store'
import { goto } from '$app/navigation'
import { browser } from '$app/environment'

import type { z, AnyZodObject, ZodSchema } from 'zod'

type GotoOptions = Parameters<typeof goto>[1]
type SturlOptions = {
	ignoreFalsey?: boolean
	passthrough?: boolean
} & GotoOptions
type Sturl<T extends AnyZodObject> = Pick<
	Writable<Partial<z.infer<T>>>,
	'subscribe' | 'set'
> & {
	toQueryString: () => string
}

/**
 * Get an object from the URL query string.
 * @param url Optional URL to parse. If not provided, will use the current URL.
 * @returns object
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getObjectFromUrl(url?: URL | string): Record<string, any> {
	const defaultUrl = url
		? new URL(url)
		: browser
		? new URL(window.location.href)
		: undefined
	const params = new URLSearchParams(defaultUrl?.searchParams)
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const entries = {} as any
	for (const [key, value] of params.entries()) {
		if (key in entries) {
			if (!Array.isArray(entries[key])) {
				entries[key] = [entries[key]]
			}
			entries[key].push(value)
		} else {
			entries[key] = value
		}
	}
	return entries
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
 * Filter out specified keys from an object.
 * @param obj Object to filter
 * @param keys Keys to filter out
 */
function filterKeys<T extends Record<string, unknown>>(
	obj: T,
	keys: Array<keyof T>,
): Partial<T> {
	return Object.fromEntries(
		Object.entries(obj).filter(([key]) => !keys.includes(key as keyof T)),
	) as Partial<T>
}

/**
 * Create a URLSearchParams object from any JS object.
 * @param obj Object to transform
 */
function objectToParams(obj: object) {
	const entries = Object.entries(obj).flatMap(([k, v]) => {
		if (!Array.isArray(v)) {
			return [[k, v]]
		}
		return v.map((val) => [k, val])
	})
	return new URLSearchParams(entries)
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
			const current = getObjectFromUrl()
			const newObj = getValidObject(schema, value, opts?.ignoreFalsey)
			let newParamsObj = newObj
			if (opts.passthrough) {
				newParamsObj = { ...filterKeys(current, Object.keys(schema.shape)), ...newObj }
			}
			const params = objectToParams(newParamsObj)
			goto(`?${params.toString()}`, opts)
			set(newObj)
		},
		toQueryString: () => {
			const current = getObjectFromUrl()
			const newObj = getValidObject(schema, current, opts?.ignoreFalsey)
			return objectToParams(newObj).toString()
		},
	}
}
