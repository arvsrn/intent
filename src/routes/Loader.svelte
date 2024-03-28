<div class="relative h-1 w-24 bg-white/10 rounded-full overflow-hidden">
    <div data-animate class="absolute h-1 w-8 bg-white/50 rounded-full"></div>
</div>

<style>
    @keyframes loading {
        from {
            left: -32px;
        }

        to {
            left: 100%;
        }
    }

    [data-animate] {
        animation: loading 1.5s linear infinite;
    }
</style>