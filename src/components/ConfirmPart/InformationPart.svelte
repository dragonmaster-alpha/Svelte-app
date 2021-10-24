<script>
  export let location;
</script>
<style>
.to-transparent {
    --tw-gradient-to: transparent;
}
.set-gradient {
    --tw-gradient-from:rgba(24,26,30,1);
    --tw-gradient-stops: var(--tw-gradient-from),var(--tw-gradient-to,rgba(24,26,30,0.2));
}
.bg-gradient-to-t {
    background-image: linear-gradient(0deg,var(--tw-gradient-stops));
}
.bg-gradient-to-r {
    background-image: linear-gradient(90deg,var(--tw-gradient-stops));
}
</style>
<div class="inform-part">
    <div class="intro relative rounded-lg bg-gray-custom-1">
        <div class="right-0 top-0 z-1 absolute">
            <img class="w-48 h-32 object-cover rounded-lg" src="../assets/img/game-intro.png" alt="no image" />
            <div class="absolute w-full h-full inset-0 z-1 bg-gradient-to-t set-gradient to-transparent"></div>
            <div class="absolute w-full h-full inset-0 z-1 bg-gradient-to-r set-gradient to-transparent"></div>
        </div>
        <div class="user-content relative z-2 p-4 space-y-4 bg-gradient-to-tr">
            <div class="user-photo">
                <img class="w-14 h-14 rounded-lg" src="../assets/img/confirm-user-avatar.svg" alt="no image" />
            </div>
            <div class="desc">
                <p class="nickname">
                    Mew2King
                </p>
                <p class="text-gray-500 text-sm my-2">Super Smash Bros, (Series) Coach</p>
            </div>
            <div class="game-thumbs space-x-2 flex items-center">
                <div class="flex justify-end sm:justify-start lg:justify-end xl:justify-start -space-x-2">
                    <img class="w-7 h-7 rounded-lg bg-gray-100 border-2 border-black" src="../assets/img/game-thum1.svg" alt="no image" />
                    <img class="w-7 h-7 rounded-lg bg-gray-100 border-2 border-black" src="../assets/img/game-thum2.svg" alt="no image" />
                    <img class="w-7 h-7 rounded-lg bg-gray-100 border-2 border-black" src="../assets/img/game-thum3.svg" alt="no image" />
                    <img class="w-7 h-7 rounded-lg bg-gray-100 border-2 border-black" src="../assets/img/game-thum4.svg" alt="no image" />
                </div>
                <p class="text-xs"> 4 games </p>
            </div>
        </div>
    </div>
</div>