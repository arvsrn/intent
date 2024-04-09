<script lang="ts">
    import { colors } from "$lib";
    import type { Tag } from "$lib/schema"; 

    export let sidebar = false;
    export let tag: Tag;

    export let onClick: () => void = () => {};
</script>

<main on:click={onClick} class:sidebar={sidebar} class="w-fit h-[23px] px-2 flex flex-row gap-1.5 border bg-white/5 border-[#ffffff06] rounded-lg items-center select-none cursor-pointer">
    <div class="size-2 rounded-full" style:background={colors[tag.color]}></div>
    <p class="text-xs leading-[23px] text-white">{tag.name}</p>
</main>

<style>
    .sidebar {
        @apply bg-white/5 hover:bg-white/10;
    }
</style>