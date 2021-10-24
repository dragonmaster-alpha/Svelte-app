<script>
    export let price1, price2, gametitle, description, ind;
</script>
<style>
    .hourly-btn {
        background: linear-gradient(269.79deg, rgba(48, 82, 107, 0.32) 0%, rgba(40, 63, 84, 0.32) 100.02%);
        border-radius: 6px;
    }

    .drop-btn {
        background: #21252A;
        border-radius: 6px;
    }
</style>
<div class="convolve-item opacity-50 hover:opacity-100">
<div class="game-item bg-gray-custom-1-opacity bg-opacity-50 rounded-xl p-4 cursor-pointer">
    <div class="relative h-28 overflow-hidden flex items-center">
        <div class="user-intro flex justify-between items-center">
            <div class="user-name flex items-center space-x-4">
                <div class="w-16 h-16 bg-gray-custom-4 rounded-lg">
                    <img class="w-full h-full" src="../assets/img/game-user-avatar{ind}.svg" alt="no image" />
                </div>
                <div class="description">
                    <p class="uppercase text-sm text-gray-500"> {gametitle} </p>
                    <p class="text-xl font-medium text-white"> {description} </p>
                </div>
                <div class="absolute top-0 right-0">
                    <img class="h-28" src="../assets/img/game{ind}.svg" alt="no image" />
                </div>
            </div>
        </div>
    </div>
    <div class="flex flex-col space-y-3">
        <div class="bg-gray-custom-1 rounded-lg p-2 flex items-center justify-between">
            <div class="text-lg flex items-center space-x-4">
                <span>
                    <img src="../assets/img/calendar.svg" alt="no image" />
                </span>
                <p> Live 1:1 Session </p>
            </div>
            <div class="right flex space-x-4">
                <button class="text-lg rounded px-4 py-2 bg-opacity-30 text-gray-400 hourly-btn">
                    $<span class="font-semibold text-white"> {price1} </span> / hour
                </button>
                <button class="drop-btn flex items-center justify-center">
                    <img src="../assets/img/drop.svg" alt="no image" />
                </button>
            </div>
        </div>
        <div class="bg-gray-custom-1 rounded-lg p-2 flex items-center justify-between">
            <div class="text-lg flex items-center space-x-4">
                <span>
                    <img src="../assets/img/note.svg" alt="no image" />
                </span>
                <p> Replay Reviews </p>
            </div>
            <div class="right flex space-x-4">
                <button class="text-lg rounded px-4 py-2 bg-opacity-30 text-gray-400 hourly-btn">
                    $<span class="font-semibold text-white"> {price2} </span> / hour
                </button>
                <button class="drop-btn flex items-center justify-center">
                    <img src="../assets/img/drop.svg" alt="no image" />
                </button>
            </div>
        </div>
    </div>
</div>
</div>