<script lang="ts">
	const routes = {
		Home: '/',
		Passthrough: '/passthrough',
	}
</script>

<nav>
	{#each Object.entries(routes) as [text, href]}
		<a {href}>{text}</a><span>&nbsp;</span>
	{/each}
</nav>
