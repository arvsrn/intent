<script lang="ts">
    import { supabase } from "$lib/supabaseClient";
    import Loader from "../Loader.svelte";
    
    let sent: boolean = false;
    let showLoader: boolean = false;
    let email: string = "";
    let error: boolean = false;

    const sendOTP = async () => {
        if (sent) {
            window.location.assign('https://www.gmail.com');
            return;
        }
        
        if (/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
            sent = false;
            showLoader = true;
            let { data, error } = await supabase.auth.signInWithOtp({ email });
            console.log(data, error);
            showLoader = false;
            sent = true;
        } else {
            error = true;
            setTimeout(() => error = false, 250);
        }
    }
</script>

<main class="w-screen h-screen bg-gray2 flex flex-col gap-2 items-center justify-center">
    <input class:invalid={error} bind:value={email} on:keydown={e => { if (e.key === 'Enter') sendOTP() }} class="w-60 h-9 transition-all duration-75 ease-linear rounded-lg border border-white/5 bg-transparent active:border-white/10 hover:border-white/10 outline-none px-3 text-xs text-white placeholder:text-white/50" placeholder="Email..." type="text">
    <button on:click={sendOTP} class="w-60 h-8 rounded-lg bg-[#0C8CE9] hover:bg-[#39A1ED] border border-[#FFFFFF06] flex items-center justify-center text-xs text-white select-none font-medium">
        {#if showLoader}
            <Loader />
        {:else}
            {sent ? 'Open Gmail' : '✨ Send Magic Link →'}
        {/if}
    </button>
    <p class="w-60 h-fit leading-5 text-xs text-white/50 text-center">An account will be created automatically if you don't have one.</p>
</main>

<style>
    .invalid {
        border: 1px solid #F24822;
        animation: shake 250ms linear;
    }

    @keyframes shake {
        10%, 90% {
            transform: translate3d(-1px, 1px, 0);
        }
        
        20%, 80% {
            transform: translate3d(2px, 0, 0);
        }

        30%, 50%, 70% { 
            transform: translate3d(-3px, -1px, 0);
        }

        40%, 60% {
            transform: translate3d(3px, 2px, 0);
        }
    }
</style>