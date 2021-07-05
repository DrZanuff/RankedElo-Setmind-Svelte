<script>
import { each } from 'svelte/internal';

    import Team from './Team.svelte';
    export let rank = "Wolf";
    export let settings = {
        isOnSeason : true,
        TrioChallengeActive : true,
        ShowData : false,
        Teams : []
    };

    let config = {
        sideMenuSize      : returnShowStatus() ? '388px' : '358px',
        sideMenuBdgSize   : returnShowStatus() ? '140px' : '240px',
        sideMenuTitleSize : returnShowStatus() ? '81px'  : '111px',
        sideMenuFlexDir   : returnShowStatus() ? 'row'   : 'column',
        sideMenuFlexAlign : returnShowStatus() ? 'flex-start' : 'center',
        sideMenuImgMarginTop : returnShowStatus() ? '28px' : '0px',
        sideMenuImgPctHeight : returnShowStatus() ? '25%' : '100%',
    }

    function returnShowStatus(){
        if (!settings.TrioChallengeActive){
            return false;
        }
        if (settings.isOnSeason && settings.ShowData){
            return true;
        }
        if (settings.isOnSeason && !settings.ShowData){
            return false;
        }
        if (!settings.isOnSeason && settings.ShowData){
            return true;
        }
        if (!settings.isOnSeason && !settings.ShowData){
            return false;
        }

        return false;
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
        {#if settings.ShowData}
            {#if settings.isOnSeason}
                <div class="teams-title">
                    <img class="h-line up" src="build/img/horizontal_line.png" alt="">
                    <p class="title-trio">DESAFIO DOS TRIOS</p>
                    <img class="h-line down" src="build/img/horizontal_line.png" alt="">
                </div>
                <div class="teams-list">
                    {#each settings.Teams as team , i }
                        <Team teamData={team} pos={i+1}></Team>
                    {/each}
                </div>
            {:else if settings.TrioChallengeActive}
                <div class="teams-title">
                    <img class="h-line up" src="build/img/horizontal_line.png" alt="">
                    <p class="title-trio">VENCEDORES DA ÚLTIMA TEMPORADA</p>
                    <img class="h-line down" src="build/img/horizontal_line.png" alt="">
                </div>
                <div class="teams-list">
                    <!-- <Team teamData={settings.Teams[0]} pos={-1}></Team> -->
                    {#each  settings.Teams[0].Members as menber , i}
                        <Team teamData={{
                            'TeamName' : settings.Teams[0].Members[i],
                            'logoURL'  : settings.Teams[0].logoURL,
                            'Points'   : -1
                        }
                        } pos={-1}></Team>
                    {/each}
                </div>
            {/if}
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
        object-fit: contain;
    }

    .bdg{
        width: var(--side-bdg);
    }

    .title{
        /* width: 80%; */
        height: var(--side-title);
        margin-top: var(--side-top-margin);
    }

    .teams-title{
        margin-right: 32px;
        margin-left: 32px;
    }

    .teams-list{
        margin-top: 12px;
        margin-right: 32px;
        margin-left: 32px;
        min-height: 375px;
        overflow: scroll;
        -ms-overflow-style: none; 
        scrollbar-width: none; 
        overflow-y: scroll; 

    }
    .teams-list::-webkit-scrollbar{
        display: none;
    }

    .title-trio{
        font-family: aldritch;
        font-size: 20px;
        color : #FFF;
        display: flex;
        justify-content: center;
        margin-bottom: 0px;
        margin-top: 6px;
        text-align: center;
    }


    span{
        height: 32px;
        min-height: 32px;
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

    
    .h-line.down{
        margin-bottom: 8px;
    }

</style>