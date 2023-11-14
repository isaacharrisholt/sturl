<script lang="ts">
	import { page } from '$app/stores'
	import { z } from 'zod'
	import { sturled } from '$lib/index.js'

	const schema = z.object({
		name: z.string(),
	})
	const url = sturled(schema, $page.url, { passthrough: true })
</script>

<main>
	<div>
		<h1>Passthrough</h1>

		<h2>Non-schema params will not be removed</h2>
		<button on:click={() => ($url = {})}>Reset everything</button>
	</div>

	<div>
		<h3>Name</h3>
		<p>{$url.name}</p>
		<button on:click={() => ($url.name = 'Isaac')}>Set name</button>
		<button on:click={() => ($url.name = undefined)}>Clear name</button>
	</div>
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	button {
		width: fit-content;
	}
</style>
