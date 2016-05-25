var audioTrack = document.getElementById("audioTrack");
var musique = document.getElementById("musique");
var musicImg = document.getElementById("musicImg");

var soundGame = true;
var soundEffect = true;

var tabMusic = ["./son/I am The Doctor in Utah.mp3","./son/Words Win Wars.mp3","./son/The Pandorica.mp3","./son/Battle In The Sky.mp3","./son/Zero.mp3","./son/Unit.mp3","./son/The Council of the Time Lords.mp3","./son/Pop.mp3","./son/Down to Earth.mp3","./son/Little Amy - The Apple.mp3"];
var currentSong = 0;

function muteMusic()	//activer ou désactiver le son
{
	if (soundGame) //si le son est activé
	{
		musicImg.setAttribute('src','images/musicoff.png');	//on change l'image
		audioTrack.volume = 0;	//on coupe le son
		soundGame = false;	
	} 
	else 
	{
		musicImg.setAttribute('src','images/musicon.png'); //on change l'image
		audioTrack.volume = 0.3;	//on active le son
		soundGame = true;
	}
	
}	

function finish() //si une musique est finie
{
	var tmp = currentSong;
	
	do	//on choisit une AUTRE chanson
	{
		currentSong = Math.floor(Math.random() * tabMusic.length);
	} while(currentSong === tmp);	
		
	audioTrack.setAttribute('src',tabMusic[currentSong]);
	audioTrack.setAttribute('autoplay','true');
}