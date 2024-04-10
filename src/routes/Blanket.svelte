<script lang="ts">
    import { fade } from "svelte/transition";

    export let onExit: () => void;
</script>

<main on:click|self={onExit} transition:fade={{ duration: 75 }} class="w-screen h-screen absolute left-0 top-0 z-50 bg-[rgba(15,15,15,0.8)] flex items-center justify-center">
    <slot></slot>
</main>

<svelte:window on:keydown={e => {
    if (e.key === "Escape") 
        onExit();
}}></svelte:window>