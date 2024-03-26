<!-- this component shows the app state -->
<script lang="ts">
    import { appState, databaseState } from "$lib";

    let selected: number = 1;
</script>

<main class="absolute bottom-0 right-0 w-[400px] h-[600px] bg-gray1 border-l border-t border-white/5 flex flex-col">
    <div class="w-fit h-fit p-1 flex-none">
        <p class="text-[10px] leading-4 text-white/60" style:font-family="IBM Plex Mono">Debug panel [BETA]</p>
        <p class="text-[10px] leading-4 text-white/40" style:font-family="IBM Plex Mono">This panel shows the entire app state.</p>
    </div>

    <div class="h-[27px] w-full border-y border-white/5 my-1 flex flex-row flex-none">
        <button class="w-fit px-2 h-full flex items-center justify-center text-white/60 text-[10px] border-r border-white/5" style:font-family="IBM Plex Mono" on:click={() => selected = 0} class:selected={selected === 0}>AppState</button>
        <button class="w-fit px-2 h-full flex items-center justify-center text-white/60 text-[10px] border-r border-white/5" style:font-family="IBM Plex Mono" on:click={() => selected = 1} class:selected={selected === 1}>DatabaseState</button>
        <button class="w-fit px-2 h-full flex items-center justify-center text-white/60 text-[10px] border-r border-white/5" style:font-family="IBM Plex Mono" on:click={() => selected = selected}>Reload</button>
    </div>

    <div data-scrollbars class="size-full overflow-scroll">
        {#if selected === 1 && $databaseState}
            <pre class="text-[10px] size-full text-white/80" style:font-family="IBM Plex Mono">{JSON.stringify($databaseState, null, 2)}</pre>
        {:else if selected === 0 && $appState}
            <pre class="text-[10px] size-full text-white/80" style:font-family="IBM Plex Mono">{JSON.stringify($appState, null, 2)}</pre>    
        {/if}
    </div>
</main>

<style>
    [data-scrollbars]::-webkit-scrollbar {
        width: 6px;
        height: 6px;
    }

    [data-scrollbars]::-webkit-scrollbar-track {
        @apply bg-white/5;
    }

    [data-scrollbars]::-webkit-scrollbar-thumb {
        @apply bg-white/20;
    }

    [data-scrollbars]::-webkit-scrollbar-thumb:hover {
        @apply bg-white/40;
    }

    [data-scrollbars]::-webkit-scrollbar-corner {
        @apply bg-white/5;
    }

    .selected {
        @apply text-white/80;
    }
</style>