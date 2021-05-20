<script>
	import Header from './Header.svelte';
	import SideMenu from './SideMenu.svelte';
	import ScoreTable from './ScoreTable.svelte';
	let elo = "Wolf";

	function handleClick(event){
		elo = event.detail.text;
	}
	
</script>

<body class={elo}>

	<Header on:message={handleClick}></Header>
	<div class="main_body">
		<SideMenu rank={elo}></SideMenu>
		<ScoreTable></ScoreTable>
	</div>

</body>

<style>
	.main_body{
		height:calc(100% - 54px);
		display: flex;
  		flex-direction: row;
	}

	body{
		background-color: black;
		background-size: 100%;
  		background-attachment: fixed;
	}

	.Wolf{
		background-image: url('img/bg/Wolf.png');
	}

	.Eagle{
		background-image: url('img/bg/Eagle.png');
	}

	.Bear{
		background-image: url('img/bg/Bear.png');
	}

	.Lion{
		background-image: url('img/bg/Lion.png');
	}

	.Dragon{
		background-image: url('img/bg/Dragon.png');
	}

</style>