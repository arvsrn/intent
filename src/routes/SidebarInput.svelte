<script lang="ts">
    import { clickOutside } from "$lib";
    import { onMount } from "svelte";
    import { fade, slide } from "svelte/transition";

    export let title: string;
    export let value: string = "";

    let input: HTMLElement;
    let mounted: boolean = false;

    onMount(() => mounted = true);

</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div 
    class="w-full h-fit min-h-9 flex flex-col bg-[#252525] border border-[rgba(255,255,255,0.03)] rounded-md py-2 px-3 cursor-text"
>
    {#if value}
        <p class="text-[11px] text-white/50 leading-5 select-none">{title}</p>
    {/if}

    <p placeholder={title} bind:this={input} contenteditable bind:innerHTML={value} spellcheck="false" class="text-xs text-white leading-5 bg-transparent border-none outline-none"></p>
</div>

<style>
    [placeholder]:empty:before {
        content: attr(placeholder);
        color: rgba(255, 255, 255, 0.5);
        font-size: 11px;
    }
</style>