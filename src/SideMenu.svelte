<script>
    export let rank = "Wolf";
</script>

<div class="side_menu">
    <div class="image_elo">
        <img class='bdg' src="build/img/badges/{rank}.png" alt="">
        <img class="title" src="build/img/titles/{rank}.png" alt="">
    </div>
    <div class="div_line">
        <img class="line" src="build/img/vertical_line.png" alt="">
    </div>

</div>

<style>
    .side_menu{
        width: 358px;
        height: 100%;
        display: flex;
  		flex-direction: row;
    }

    .image_elo{
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .bdg{
        width: 80%;
    }

    .title{
        width: 80%;
    }

    .div_line{
        height: 100%;
        display: flex;
        align-items: center;
    }

    .line{
        height: 85%;
        width: 1px;
    }

</style>