<script lang="ts">
	import { sturled } from '$lib'
	import { z } from 'zod'
	import { page } from '$app/stores'

	const schema = z.object({
		passed: z.string(),
	})
	const url = sturled(schema, $page.url, {
		passthrough: true,
	})
</script>

<h2>Passthrough value: {$url.passed}</h2>
<button on:click={() => ($url.passed = 'Passed through')}>Set passthrough</button>
<button on:click={() => ($url.passed = undefined)}>Unset passthrough</button>

<slot />
