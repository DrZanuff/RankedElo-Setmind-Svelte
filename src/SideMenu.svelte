<script>
    export let rank = "Wolf";
    export let settings = {
        isOnSeason : false
    };

    let config = {
        sideMenuSize      : settings.isOnSeason ? '388px' : '358px',
        sideMenuBdgSize   : settings.isOnSeason ? '140px' : '240px',
        sideMenuTitleSize : settings.isOnSeason ? '81px'  : '111px',
        sideMenuFlexDir   : settings.isOnSeason ? 'row'   : 'column',
        sideMenuFlexAlign : settings.isOnSeason ? 'flex-start' : 'center',
        sideMenuImgMarginTop : settings.isOnSeason ? '28px' : '0px',
        sideMenuImgPctHeight : settings.isOnSeason ? '25%' : '100%',
    }
</script>

<div class="main-body">
    <div class="side_menu" style=
    "--side-width : {config.sideMenuSize};
    --side-bdg : {config.sideMenuBdgSize};
    --side-dir : {config.sideMenuFlexDir};
    --side-title : {config.sideMenuTitleSize};
    --side-align : {config.sideMenuFlexAlign};
    --side-top-margin : {config.sideMenuImgMarginTop};
    --side-img-pct-h : {config.sideMenuImgPctHeight};"
    >
        <div class="image_elo">
            <img class='bdg' src="build/img/badges/{rank}.png" alt="">
            <img class="title" src="build/img/titles/{rank}.png" alt="">

        </div>

        {#if settings.isOnSeason}
        <div class="teams-table">
            <img class="h-line up" src="build/img/horizontal_line.png" alt="">
            <p class="title-trio">DESAFIO DOS TRIOS</p>
            <img class="h-line down" src="build/img/horizontal_line.png" alt="">
        </div>
        {/if}
    </div>

    <div class="div_line">
        <img class="line" src="build/img/vertical_line.png" alt="">
    </div>

</div>

<style>
    .main-body{
        display: flex;
        flex-direction: row;
    }

    .side_menu{
        width: var(--side-width);
        height: 100%;
        display: flex;
  		flex-direction: column;
    }

    .image_elo{
        height: var(--side-img-pct-h);
        width: 100%;
        display: flex;
        flex-direction: var(--side-dir);
        justify-content: center;
        align-items: var(--side-align);
        margin-top: var(--side-top-margin);
    }

    .bdg{
        width: var(--side-bdg);
    }

    .title{
        /* width: 80%; */
        height: var(--side-title);
        margin-top: var(--side-top-margin);
    }

    .teams-table{
        min-height: 375px;
        overflow: hidden;
        margin-right: 32px;
        margin-left: 32px;

    }

    .title-trio{
        font-family: aldritch;
        font-size: 20px;
        color : #FFF;
        display: flex;
        justify-content: center;
        margin-bottom: 6px;
        margin-top: 6px;
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

    .h-line{
        display: block;
        width: 100%;
        height: 2px;
        margin-top: 0px;
        margin-bottom: 8px;
    }

/*     .h-line.up{
        margin-top: 32px; 
    } */
    
    .h-line.down{
        margin-bottom: 32px;
    }

</style>