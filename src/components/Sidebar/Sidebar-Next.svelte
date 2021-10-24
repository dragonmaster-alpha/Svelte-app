<script>
  import { link } from "svelte-routing";
//Import sub components.
  import InformPart from "components/ConfirmPart/InformationPart.svelte";
  import ConfirmStep from "components/ConfirmPart/ConfirmStep.svelte";

  let collapseShow = "hidden";
  let checked = false;

  function toggleCollapseShow(classes) {
    collapseShow = classes;
  }
</script>
<style>
.w-pixel-340 {
    width: 340px;
}

.checkbox {
    display: inline-flex;
    cursor: pointer;
    position: relative;
}

.checkbox > input {
    height: 48px;
    width: 48px;
    -webkit-appearance: none;
    -moz-appearance: none;
    -o-appearance: none;
    appearance: none;
    border: 1px solid #21252A;
    border-radius: 8px;
    outline: none;
    transition-duration: 0.3s;
    background-color: #21252A;
    cursor: pointer;
  }

.checkbox > input:checked {
    border: 1px solid #41B883;
    background-color: #41B883;
}

.checkbox > input:checked + span::before {
    content: '\2713';
    display: block;
    text-align: center;
    color: #41B883;
    position: absolute;
}

.checkbox > input:active {
    border: 8px solid #21252A;
}

.help-desc {
    align-items: left;
    height: 48px;
    justify-content: space-around;
}

.help-set-font {
    font: Graphik;
}
</style>
<!-- <nav 
  class="md:block md:fixed md:top-0 md:bottom-0 md:overflow-y-hidden md:h-full bg-gray-custom-2 " style="width: 340px; margin-left: 64px; padding: 32px 32px 24px 32px; background: #0E0E10;display: flex; flex-direction: column; justify-content:space-between; align-items: left;"
>
    <div>
        
    </div>
    <div class="checkbox" style="width: 100%; background: #181A1E; padding: 16px; display: flex; justify-content: left; align-items: center">
        <input type=checkbox checked={checked}>
        <div style="display: flex; height: 48px; justify-content: space-around; flex-direction: column; align-items: left; padding-left: 16px;">
            <span style="font: Graphik; font-size: 14px; line-height: 14px; color: #798694">Having troubles?</span>
            <span style="font: Graphik; font-size: 12px; line-height: 12px; color: white; font-weight: 500">Get Help</span>
        </div>
    </div>
</nav> -->
<nav 
  class="bg-gray-custom-2 text-white w-pixel-340 h-screen px-6 py-4 sticky top-0 flex flex-col justify-between" id="confirmation"
>
    <div class="sub-menu-top">
        <InformPart />
        <ConfirmStep />
    </div>

    <div class="checkbox bg-gray-custom-1 rounded-lg p-4 flex items-center space-x-4">
        <input type=checkbox checked={checked}>
        <div class="flex flex-col space-between help-desc">
            <span class="help-set-font text-sm text-gray-600">Having troubles?</span>
            <span class="help-set-font text-xs text-white font-medium">Get Help</span>
        </div>
    </div>
    <!-- <div class="inform-part">
        <div class="intro relative rounded-lg bg-gray-custom-1">
            <div class="right-0 top-0 z-1 absolute">
                <img class="w-48 h-32 object-cover rounded-lg" src="../assets/img/game-intro.png"/>
                <div class="absolute w-full h-full inset-0 z-1 bg-gradient-to-t set-gradient to-transparent"></div>
                <div class="absolute w-full h-full inset-0 z-1 bg-gradient-to-r set-gradient to-transparent"></div>
            </div>
            <div class="user-content relative z-2 p-4 space-y-4 bg-gradient-to-tr">
                <div class="user-photo">
                    <img class="w-14 h-14 rounded-lg" src="../assets/img/confirm-user-avatar.svg" />
                </div>
                <div class="desc">
                    <p class="nickname">
                        Mew2King
                    </p>
                    <p class="text-gray-500 text-sm my-2">Super Smash Bros, (Series) Coach</p>
                </div>
                <div class="game-thumbs space-x-2 flex items-center">
                    <div class="flex justify-end sm:justify-start lg:justify-end xl:justify-start -space-x-2">
                        <img class="w-7 h-7 rounded-lg bg-gray-100 border-2 border-black" src="../assets/img/game-thum1.svg" />
                        <img class="w-7 h-7 rounded-lg bg-gray-100 border-2 border-black" src="../assets/img/game-thum2.svg" />
                        <img class="w-7 h-7 rounded-lg bg-gray-100 border-2 border-black" src="../assets/img/game-thum3.svg" />
                        <img class="w-7 h-7 rounded-lg bg-gray-100 border-2 border-black" src="../assets/img/game-thum4.svg" />
                    </div>
                    <p class="text-xs"> 4 games </p>
                </div>
            </div>
        </div>
    </div> -->
</nav>