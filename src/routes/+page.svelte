<script lang="ts">
	import { page } from '$app/stores'
	import { z } from 'zod'
	import { sturled } from '$lib/index.js'

	const sizes = ['small', 'medium', 'large'] as const
	const schema = z.object({
		size: z.enum(sizes),
		bound: z.string(),
		q: z.string(),
		read: z.string(),
		number: z.coerce.number(),
	})
	const urlState = sturled(schema, $page.url, {
		invalidateAll: false,
		ignoreFalsey: true,
		keepFocus: true,
	})

	let searchString: string
</script>

<main>
	<div>
		<h1>Sturl demo</h1>

		<h2>Look at the url!</h2>
		<button on:click={() => ($urlState = {})}>Reset everything</button>
	</div>

	<div>
		<h3>Form binding (uses <code>bind:value={'{$urlState.bound}'}</code>)</h3>
		<p>Note: requires <code>keepFocus: true</code> option</p>
		<input type="text" bind:value={$urlState.bound} />
	</div>

	<div>
		<h3>Select size (uses <code>bind:group</code>)</h3>
		{#each sizes as size}
			<label>
				<input
					type="radio"
					name="size"
					value={size}
					checked={$urlState.size === size}
					bind:group={$urlState.size}
				/>
				{size}
			</label>
		{/each}
	</div>

	<div>
		<h3>Search (uses <code>$urlState.q = 'string'</code>)</h3>

		<input type="search" bind:value={searchString} />
		<button on:click={() => ($urlState.q = searchString)}>Search</button>
	</div>

	<div>
		<h3>Read example (add <code>read=something</code> to the URL params!)</h3>
		<p>{$urlState.read ?? 'Nothing here...'}</p>
	</div>

	<div>
		<h3>
			Read example with validation (add <code>number=120</code> to the URL params!)
		</h3>
		<p>{$urlState.number ?? 'Nothing here or invalid number'}</p>
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
