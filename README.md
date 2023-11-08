# Sturl

Sturl is a URL state management library for SvelteKit with Zod validation.

## Installation

```bash
pnpm i -D sturl
```

(or `npm`, `yarn`, `bun`, etc.)

## Usage

```svelte
<script lang="ts">
  import { page } from '$app/stores'
  import { sturled } from 'sturl'
  import { z } from 'zod'

  const schema = z.object({
    name: z.string(),
    age: z.coerce.number().int().positive(), // Use .coerce for non-string types
  });

  const urlState = sturled(
    schema,
    $page.url, // Optional default state, will otherwise use current location
    { // Additional options, mostly the same as `goto`
      ignoreFalsey: true, // Ignore falsey values when serializing (converted to undefined)
      keepFocus: true, // Keep focus on the element that triggered the update
    }
  );
</script>

<input type="text" bind:value={$urlState.name} />
<input type="number" bind:value={$urlState.age} />
```

See more examples on the [default page](./src/routes/+page.svelte).

## API

#### `sturled<T extends AnyZodObject>(schema: T, url?: URL | string, opts?: SturlOptions): Sturl<T>`

Creates a new `Sturl` object. A `Sturl` object is a Svelte store that can be used to read and write URL state.

Includes validation with [Zod](https://zod.dev). Any invalid properties will be ignored.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

[MIT](./LICENSE)