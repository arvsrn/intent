<script lang="ts">
    import { supabase } from "$lib/supabaseClient";
    import SidebarInput from "../SidebarInput.svelte";
    let sent: boolean = false;
    let showLoader: boolean = false;
    let email: string = "";
</script>

<main class="w-screen h-screen bg-gray2 flex flex-col gap-2 items-center justify-center">
    <input bind:value={email} class="w-60 h-9 rounded-lg border border-[#FFFFFF06] bg-[#FFFFFF06] outline-none px-3 text-xs text-white placeholder:text-white/50" placeholder="Email..." type="text">
    <button on:click={async () => {
        if (/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
            sent = false;
            showLoader = true;
            let { data, error } = await supabase.auth.signInWithOtp({ email });
            console.log(data, error);
            showLoader = false;
            sent = true;
        } else {
            // TODO
            alert('invalid email bozo')
        }
    }} class="w-60 h-[35px] rounded-lg bg-white/20 border border-[#FFFFFF06] flex items-center justify-center text-xs text-white select-none hover:bg-white/25">
        {#if showLoader}
            <div class="loader"></div>
        {:else}
            {sent ? 'Sent!' : '✨ Send Magic Link →'}
        {/if}
    </button>
    <p class="w-60 h-fit leading-5 text-xs text-white/50 text-center">An account will be created automatically if you don't have one.</p>
</main>

<style>
    @keyframes donut-spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }

    .loader {
        display: inline-block;
        border: 3px solid rgba(255, 255, 255, 0.25);
        border-left-color: white;
        border-radius: 50%;
        width: 18px;
        height: 18px;
        animation: donut-spin 1.2s linear infinite;
    }
</style>