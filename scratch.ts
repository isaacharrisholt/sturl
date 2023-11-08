import { writable } from "svelte/store";
import { goto } from "$app/navigation";
import { browser } from "$app/environment";

import type { z, AnyZodObject, ZodSchema } from "zod";

function getObjectFromUrl(url?: URL | string) {
  const defaultUrl = url
    ? new URL(url)
    : browser
    ? new URL(window.location.href)
    : undefined;
  const params = new URLSearchParams(defaultUrl?.searchParams);
  return Object.fromEntries(params.entries());
}

function getValidObject<T extends AnyZodObject>(
  schema: T,
  obj: object
): Partial<z.infer<T>> {
  const newObj = {} as Partial<z.infer<T>>;

  for (const [key, s] of Object.entries(schema.shape)) {
    const value = obj[key as keyof typeof obj];
    if (value !== undefined) {
      const result = (s as ZodSchema).safeParse(value);
      if (result.success) {
        newObj[key as keyof typeof newObj] = result.data;
      }
    }
  }
  return newObj;
}

export function getUrlStateWritable<T extends AnyZodObject>(
  schema: T,
  url?: URL | string
) {
  const initialValue = getValidObject(schema, getObjectFromUrl(url));

  const { subscribe, set } = writable<Partial<z.infer<T>>>(initialValue);

  return {
    subscribe,
    set: (value: Partial<z.infer<T>>) => {
      const newObj = getValidObject(schema, value);
      const params = new URLSearchParams(newObj as Record<string, string>);
      goto(`?${params.toString()}`);
      set(newObj);
    },
  };
}
