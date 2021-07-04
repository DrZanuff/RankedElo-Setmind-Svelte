<script>
	import { onMount } from 'svelte';
	import Header from './Header.svelte';
	import SideMenu from './SideMenu.svelte';
	import ScoreTable from './ScoreTable.svelte';
	let elo = "Wolf";
	let isLoaded = false;
	let rankLoaded = false;

	function handleClick(event){
		elo = event.detail.text;
	}

	let data = {
		"Wolf"   : [ ],
		"Eagle"  : [ ],
		"Bear"   : [ ],
		"Lion"   : [ ],
		"Dragon" : [ ]
	}

	onMount(async () => {
		//const response = await fetch(`https://script.google.com/macros/s/AKfycbxhnpSr3ijJfYhWEuD9ZH-28KvW1KXx6hQHWVRmzi_UZDpumj2w7rTwgtYoTqQ6ZYjF/exec`);
		const response = await fetch(`https://script.google.com/macros/s/AKfycbxds7Bb7flTZ81eB5hJyu1-jxKZwKO7Hy1LTJy4xur6SF_RyST4mA2uUMSh0fw9zyOI/exec`);
		data = await response.json();
		loadImages();
	});

	function loadImages(){
		
		const elements = [
			"build/img/bg/Wolf.png" , "build/img/badges/Wolf.png" , "build/img/titles/Wolf.png" ,
			"build/img/bg/Eagle.png" , "build/img/badges/Eagle.png" , "build/img/titles/Eagle.png" ,
			"build/img/bg/Bear.png" , "build/img/badges/Bear.png" , "build/img/titles/Bear.png" ,
			"build/img/bg/Lion.png" , "build/img/badges/Lion.png" , "build/img/titles/Lion.png" ,
			"build/img/bg/Dragon.png" , "build/img/badges/Dragon.png" , "build/img/titles/Dragon.png" ,
		]

		for (var i=0;i<elements.length;i++){
			var img = new Image();
   			img.src=elements[i];
			console.log(img)
		}

		isLoaded = true;

	}
		
</script>

{#if isLoaded}
	<body class={elo}>


			<Header on:message={handleClick}></Header>
			<div class="main_body">
				<SideMenu rank={elo}></SideMenu>
				<ScoreTable rankData={ data[elo] }></ScoreTable>
			</div>


	</body>
{:else}
	<div class="d-flex justify-content-center">
		<div id="spinLoad" class="spinner-grow text-light" role="status" />
	</div>
{/if}

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
 		overflow: hidden;

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