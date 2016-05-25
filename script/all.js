// AnimationFrame

var animFrame = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            null ;

var cancelAnimFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;
var anim;

// gestion du jeu
var projectileSet;

var tics = 0;
var _timeToBeAlive = 15;

var livesMax;

var timeNewEnemy;
var nbEnemyMax ;
var nbEnemy = 0;

var mode; //1 pour survival, 0 sinon
var diff;
var pacifist;

var level = [];

var continuer = false;
var isGameOver;
var startGame = true;
var firstGame = true;

// gestion des touches pressées

var tab=[];
var space=false;
var key=0;


// Canvas
var divArena;
var canArena;
var conArena;
var conScore;
var ArenaWidth = 800;
var ArenaHeight = 630;

// gestion de l'environnement de jeu

var replay = document.getElementById("replay");
var repeatedImg = document.getElementById("repeatedImg");



var play = document.getElementById("play");
var playImg = document.getElementById("playImg");

var gameOverDiv = document.getElementById("gameOverDiv");
var gameOver_text = document.getElementById("gameOver_text");
var recommencer = document.getElementById("recommencer");
var closeGameOver = document.getElementById("closeGameOver");

var quelleDiv = 0;
var xDec, yDec;

var objectif = document.getElementById("objectif");
var goalDiv = document.getElementById("goalDiv");
var closeGoal = document.getElementById("closeGoal");

var instructions = document.getElementById("instructions");
var controlDiv = document.getElementById("controlDiv");
var closeControl = document.getElementById("closeControl");

var enemiesList = document.getElementById("enemiesList");
var enemiesDiv = document.getElementById("enemiesDiv");
var closeEnemies = document.getElementById("closeEnemies");

var copyright = document.getElementById("copyright");
var copyrightDiv = document.getElementById("copyrightDiv");
var closeCopyright = document.getElementById("closeCopyright");


//########################################################################
//########################################################################
//						Repérer interactions utilisateur
//########################################################################
//########################################################################


function doKeyDown(e) //si une touche est pressée
{ 
    if( e.keyCode>35 && e.keyCode<41)	//et que c'est une flèche
    {
     	e.preventDefault();	
				
		var isIn = false;	
		
		for(var i=0; i<tab.length; i++)	//on vérifie si elle n'est pas déjà pressée (pour éviter de n'avoir un tableau rempli que de cette touche)
		{
			if(e.keyCode == tab[i])
			{
				isIn = true;
			}
		}
		if(tab[0] == 0)	// si tab[0] == 0, par construction du tableau, aucune touche n'est pressée 
		{
			tab[0] = e.keyCode;
		}
		else if( isIn == false)	//sinon, si la touche n'était pas déjà pressée, on décale le tableau (pour sauvegarder les touches déjà pressées) et on enregistre la nouvelle touche pressée
		{
			for(var i = 2; i>=0; i--)
			{
				tab[i+1]=tab[i];
			}
			tab[0] = e.keyCode;
		}
		
	}
	
	else if(e.keyCode === 32)	//espace
	{
		e.preventDefault();	
		space = true;
	}
	else if(e.keyCode === 80)	//P
	{
		e.preventDefault();
		pause();
	}
	else if(e.keyCode === 83) //S
	{
		e.preventDefault();
		muteMusic();
	}
	else if(e.keyCode === 82) //R
	{
		e.preventDefault();
		restart();
	}
	else if(e.keyCode === 27) //R
	{
		e.preventDefault();
		if(isGameOver)
		{
			endGameOver();
		}
	}
    //Space is 32, Enter is 13, Tab is 9, esc is 27, backspace is 8... 
    // A to Z is 65 to 90
}

function doKeyUp(e)		//si une touche est relâchée
{
	if( e.keyCode>35 && e.keyCode<41)
	{
		e.preventDefault();
		for(var i = 0; i<4; i++)
		{
			if( e.keyCode == tab[i] )	//on décale le reste du tableau et la dernière case du tableau passe à 0
			{	
				for(var j=i+1; j<4; j++)
				{
					tab[j-1]=tab[j];
				}
				tab[tab.length-1]=0;
			}
		}
	}
	else if( e.keyCode === 32)
	{
		e.preventDefault();	
		space = false;
	}
}

/////////////////////////////////////////////////////////////////////////////////////////////////////

//########################################################################
//########################################################################
//						Définitions des objets
//########################################################################
//########################################################################


// une collection de projectiles
function ProjectileSet(tabTarget)
{
  this.tabTarget = tabTarget;
  this.score = 0;
  this.tabProjectiles = new Array();
  this.add = function (projectile) 
  {
    this.tabProjectiles.push(projectile);  
  };
  this.remove = function () 
  {  

       this.tabProjectiles.map(function(obj,index,array)
	   {
            if(obj.exists == false ||obj.x >ArenaWidth || obj.x<0)
			{
                array.splice(index,1);
            }
        });

  };

 this.reinit = function ()
 {
 	this.clear();
 	this.tabProjectiles.splice(0,this.tabProjectiles.length);
 }

 this.update = function()
 {
        this.remove();
        var score = 0;
        this.tabProjectiles.map(function(obj)
		{
            obj.update();
            if(obj.exists == false) {//hit
                score = score + 1;
            }
        });
        this.score = this.score + score;
    };
 this.clear = function()
 {
    this.tabProjectiles.map(function(obj)
	{
         obj.clear();
    });
 };
 this.draw = function()
 {
    this.tabProjectiles.map(function(obj)
	{
        obj.draw();
    });

 };
    
};

// un projectile
function Projectile(evilness,x,y,xSpeed,ySpeed,dir,width,height) //evilness : 0 hero, 1 ennemi ;dir : 0 horizontal, 1 vertical
{
	this.evilness = evilness;
	this.x = x;
    this.y = y;
	this.dir = dir;
    this.xSpeed = xSpeed;
	this.ySpeed = ySpeed;
	
	this.img = new Image();
	
	
	if(this.evilness ===0)	//si c'est un tir du héros
	{
		this.img.src="./images/attaqueHero.png";
		
		if(this.dir === 0)	//selon son orientation, on sélectionne le bon sprite
		{
			if(this.xSpeed > 0)
			{
				this.xSprite = 0;
				this.ySprite = 8;
				this.hSprite = 10;
				this.wSprite = 6;
			}
			else
			{
				this.xSprite = 8;
				this.ySprite = 8;
				this.hSprite = 10;
				this.wSprite = 6;
			}
		}
		else
		{
			if(this.ySpeed > 0)
			{
				this.xSprite = 2;
				this.ySprite = 20;
				this.hSprite = 6;
				this.wSprite = 10;
			}
			else
			{
				this.xSprite = 2;
				this.ySprite = 0;
				this.hSprite = 6;
				this.wSprite = 10;
			}
		}

	}
	else	//tir ennemi
	{
		this.img.src = "./images/attaque.png";
		this.xSprite = 0;
		this.ySprite = 0;
		this.hSprite = 32;
		this.wSprite = 34;
	}

	this.width = width;
    this.height = height;

    this.exists = true;
    this.collision = function(tabOfObjects)	//detection des collisions
	{
        var hits = null;
        var index;
		if( this.evilness === 0)	// le hero peut tuer tout le monde
		{
			for(index in tabOfObjects)
			{
				if ((tabOfObjects[index].cptExplosion ==0) 
					&& this.x < tabOfObjects[index].x + tabOfObjects[index].width 
					&& this.x + this.width > tabOfObjects[index].x 
					&& this.y < tabOfObjects[index].y + tabOfObjects[index].height
					&& this.height + this.y > tabOfObjects[index].y) 
				{
						// collision detected!
						hits = tabOfObjects[index];
						break;
				}
			}
		}
		else	//les ennemies ne peuvent tuer que le héro
		{
			if ((tabOfObjects[0].cptExplosion ==0) 
					&& this.x < tabOfObjects[0].x + tabOfObjects[0].width 
					&& this.x + this.width > tabOfObjects[0].x 
					&& this.y < tabOfObjects[0].y + tabOfObjects[0].height
					&& this.height + this.y > tabOfObjects[0].y) 
			{
					// collision detected!
					hits = tabOfObjects[0];
			}
		}
        
        return hits;  
    };
    
    this.draw = function()	//affichage du projectile
	{
        if(this.exists)
		{           
			conArena.drawImage(this.img,this.xSprite,this.ySprite,this.wSprite,this.hSprite,this.x,this.y,this.width,this.height);
        }
    };
    this.clear = function()	//suppression du projectile
	{
        if(this.exists)
		{
            conArena.clearRect(this.x-3,this.y-3,this.width+6,this.height+6);
        }
    };
    this.update = function()	//mise à jour du projectile
	{
        if(this.exists)
		{
            this.x += this.xSpeed ;
			this.y += this.ySpeed;
            var tmp = this.collision([player].concat(enemies.tabEnemies));
            if(tmp != null)
			{
                tmp.explodes();
                this.exists = false;
            } 
			if(this.x > ArenaWidth || this.x < 0 || this.y > ArenaHeight || this.y < 0)	//si le projectile sort de l'arène
			{
				this.exits = false;
			}
        }
    };
}

// ensemble d'ennemis
var enemies = {
    init : function()
	{
        this.tabEnemies = new Array();
    },
    add : function (enemy) 
	{
        this.tabEnemies.push(enemy);  
    },
    remove : function () 
	{  
        this.tabEnemies.map(function(obj,index,array)
		{
            if(obj.exists == false ||obj.x >ArenaWidth || obj.x<0)
			{
                  array.splice(index,1);
            }
        });
    },
    draw : function()
	{ 
        this.tabEnemies.map(function(obj)
		{
            obj.draw();
        });
    },
    clear : function()
	{
       this.tabEnemies.map(function(obj)
	   {
            obj.clear();
       });
    },
    update : function()
	{

        this.tabEnemies.map(function(obj)
		{
            obj.update();
        });
         this.remove();
    }
    
};

//un ennemi 

function Enemy(x,y,speed,dir,type) //dir = 0:horizontal, 1: vertical
{
	this.type = type;
	
	this.timeToChangeDir = 0;
	
    this.x = x;
    this.y = y;
	this.dir = dir;
    this.xSpeed = (1-dir)*speed;
	this.ySpeed = dir*speed;
    this.exists = true;
    this.img = new Image();
	
	
	if( 0<=this.type && 10>this.type)
	{
		this.img.src = "./images/daleks.png";
		this.cpt = this.type;
		
		if( this.type >= 6)
		{
			this.decalage = -this.type;
		}
		else
		{
			this.decalage = 0;
		}
		this.spriteHeight = 73;
		this.height = 50;
	}
	else
	{
		this.img.src = "./images/eSpritesheet_40x30.png";
		this.cpt = 0;
		this.col = 0;
		
		this.decalage = 0;
		this.spriteHeight = 30;
		this.spriteWidth = 40;
		this.height = 30;
		this.width = 40;
	}

    this.cptExplosion =  0;//10 images
    this.imgExplosion = new Image();
    this.imgExplosionHeight = 128;
    this.imgExplosionWidth = 128;
    this.imgExplosion.src = "./images/explosion.png";

    //this.projectileSet = new ProjectileSet();
    this.explodes = function()
	{
        this.cptExplosion = 1;
    };
    this.collision = function(tabOfObjects)
	{
        var hits = null;
        var index;
        for(index in tabOfObjects)
		{
            if (this.x < tabOfObjects[index].x + tabOfObjects[index].width 
				&& this.x + this.width > tabOfObjects[index].x
				&& this.y < tabOfObjects[index].y + tabOfObjects[index].height 
				&& this.height + this.y > tabOfObjects[index].y) 
				{
                    // collision detected!
                    hits = tabOfObjects[index];
                    break;
				}
        }
        return hits;
    };
    this.fire = function ()
	{
		if(this.type == 10)
		{
			var shootSpeed = 2;
			//tir gauche
			tmp = new Projectile(1,this.x-5,this.y + this.height/2,-shootSpeed,0,this.dir,7,5);
			//this.projectileSet.add(tmp);
			projectileSet.add(tmp);
			
			//tir droit
			tmp = new Projectile(1,this.x + this.width + 5,this.y + this.height/2,shootSpeed,0,this.dir,7,5);
			//this.projectileSet.add(tmp);
			projectileSet.add(tmp);
			
			//tir haut
			tmp = new Projectile(1,this.x + this.width/2,this.y -5,0,-shootSpeed,this.dir,5,7);
			//this.projectileSet.add(tmp);
			projectileSet.add(tmp);
			
			//tir bas
			tmp = new Projectile(1,this.x + this.width/2,this.y +this.height + 5,0,shootSpeed,this.dir,5,7);
			//this.projectileSet.add(tmp);
			projectileSet.add(tmp);
			
			//tir haut-gauche
			tmp = new Projectile(1,this.x - 5,this.y - 5,-Math.sqrt(shootSpeed),-Math.sqrt(shootSpeed),this.dir,5,5);
			//this.projectileSet.add(tmp);
			projectileSet.add(tmp);
			
			//tir haut-droit
			tmp = new Projectile(1,this.x + this.width + 5,this.y - 5,Math.sqrt(shootSpeed),-Math.sqrt(shootSpeed),this.dir,5,5);
			projectileSet.add(tmp);
			
			//tir bas-gauche
			tmp = new Projectile(1,this.x - 5,this.y + this.height + 5,-Math.sqrt(shootSpeed),Math.sqrt(shootSpeed),this.dir,5,5);
			//this.projectileSet.add(tmp);
			projectileSet.add(tmp);
			
			//tir bas-droit
			tmp = new Projectile(1,this.x + this.width + 5,this.y + this.height + 5,Math.sqrt(shootSpeed),Math.sqrt(shootSpeed),this.dir,5,5);
			//this.projectileSet.add(tmp);
			projectileSet.add(tmp);
		}		
		else
		{
			var xtmp, ytmp;
		
			if( this.xSpeed<0 )
			{
				xtmp = this.x - 5;
			}
			else if( this.xSpeed>0 )
			{
				xtmp = this.x + this.width + 5;
			}
			else
			{
				xtmp = this.x + this.width/2;
			}
			if( this.ySpeed<0 )
			{
				ytmp = this.y - 5;
			}
			else if( this.ySpeed>0 )
			{
				ytmp = this.y + this.height + 5;
			}
			else
			{
				ytmp = this.y + this.height/2;
			}
			
			var tmp;

			if( this.dir === 0)
			{	
				tmp =  new Projectile(1,xtmp,ytmp,this.xSpeed*1.5,this.ySpeed*1.5,dir,7,5);
			}
			else
			{
				tmp =  new Projectile(1,xtmp,ytmp,this.xSpeed*1.5,this.ySpeed*1.5,dir,5,7);
			}
			//this.projectileSet.add(tmp);
			projectileSet.add(tmp);
		
		}		
    };
    this.draw = function()
	{ 
        //this.projectileSet.draw();

        if(this.cptExplosion!=0)
		{
            conArena.drawImage(this.imgExplosion, this.cptExplosion*this.imgExplosionWidth, 0, this.imgExplosionWidth,this.imgExplosionHeight, this.x,this.y,this.width,this.height);
        }
		else
		{
            conArena.drawImage(this.img,this.col,this.cpt*this.spriteHeight + this.decalage,this.spriteWidth,this.spriteHeight, this.x,this.y,this.width,this.height);
        }
    };
    this.clear = function()
	{
        if(this.exists)
		{
            conArena.clearRect(this.x-3,this.y-3,this.width+6,this.height+6);
        }
       // this.projectileSet.clear();
    };
	this.updateDir = function()
	{
		if( this.dir === 0)
		{
			this.dir = 1;
			this.ySpeed = evalSpeed(this.type);
			this.xSpeed = 0;
		}
		else
		{
			this.dir = 0;
			this.xSpeed = evalSpeed(this.type);
			this.ySpeed = 0;
		}
	};
    this.update = function()
	{
		this.timeToChangeDir++;
       if(this.cptExplosion==0) //is not exploding
	   {
		   if(this.timeToChangeDir % 150 == 1)
		   {
			   this.updateDir();
		   }
		   
		   do
		   {
			   if( ((this.x + this.xSpeed) < 0) || ((this.x + this.xSpeed + this.width)>ArenaWidth))
			   {
				   this.x = this.x - this.xSpeed;
				   this.updateDir();
			   }
			   if( ((this.y + this.ySpeed) < 0) || ((this.y + this.ySpeed + this.height)>ArenaHeight-5))
			   {
				   this.y = this.y - this.ySpeed;
				   this.updateDir();
			   }
		   } while( ((this.x + this.xSpeed) < 0) || ((this.x + this.xSpeed + this.width)>ArenaWidth) || ((this.y + this.ySpeed) < 0) || ((this.y + this.ySpeed + this.height)>ArenaHeight-5));

            this.x +=   this.xSpeed ;
            this.y += this.ySpeed;
			
            var tmp = this.collision([player]);
			if( tmp != null)
			{
				tmp.explodes();
				
				this.exists = false;
				nbEnemy--;
			}

			if(this.type>=0 && this.type<10)
			{
				if(this.dir == 0)
				{
					if(this.xSpeed>0)
					{
						this.col = 12;
								
						this.spriteWidth = 59;
						this.width = 37;
					}
					else
					{
						this.col = 68;
						
						this.spriteWidth = 59;
						this.width = 37;
					}
				}
				else
				{
					if(this.ySpeed>0)
					{
						this.col = 136;
								
						this.spriteWidth = 42;
						this.width = 30;
					}
					else
					{
						this.col = 181;
								
						this.spriteWidth = 42;
						this.width = 30;
					}
				}
			}
            else if(type==10 && tics % 5 == 1) 
			{
                    this.cpt = (this.cpt + 1) % 6;
            }

            if(tics % (200 - this.type*12) == 1) this.fire();
       }
	   else
	   {
            if(tics % 3 == 1) 
			{
                this.cptExplosion++;
            }
            if(this.cptExplosion>10)
			{//end of animation
                this.cptExplosion=0;
                this.exists = false;
                nbEnemy--;
            }
        }
        //this.projectileSet.update();
    };
}



// le joueur
var player = {
    init : function()
	{
        this.img = new Image();
        this.img.src = "./images/doctor.png";
        this.cpt = 0;
        this.cptExplosion =  0;//10 images
        this.imgExplosion = new Image();
        this.imgExplosionHeight = 128;
        this.imgExplosionWidth = 128;
        this.imgExplosion.src = "./images/explosion.png";
        this.projectileSet = new ProjectileSet();
		
		this.height = 50;
		this.width = 30;
		
		this.x = (ArenaWidth + this.width) /2;
		this.y = ArenaHeight/2;
		this.xSpeed = 3.2;
		this.ySpeed = 3.2;
		
		this.dir = 1;
		this.pastShoot = 0;
		
		this.nbOfLives = livesMax;
		this.isWalking = false;
		
		this.spriteLine = 0;
		this.spriteColumn = 0;
		this.xShootSpeed = 0;
		this.yShootSpeed = 0;
		
		this.timeToBeAlive = 0;	

		this.spriteHeight = 48;
		this.spriteWidth = 32;
    },
	
    fires : function()
	{
		var tmp;
		switch(this.spriteLine)
		{
			case 0:	//down
				tmp = new Projectile(0,this.x,this.y+this.height,this.xShootSpeed,this.yShootSpeed,this.dir,10,6);
				break;
			case 1:	//left
				tmp = new Projectile(0,this.x,this.y+this.height/2,this.xShootSpeed,this.yShootSpeed,this.dir,6,10);
				break;
			case 2:	//right
				tmp = new Projectile(0,this.x+this.width,this.y+this.height/2,this.xShootSpeed,this.yShootSpeed,this.dir,6,10);
				break;
			case 3: //up
				tmp = new Projectile(0,this.x+this.width-5,this.y,this.xShootSpeed,this.yShootSpeed,this.dir,10,6);
				break;			
		}
        this.projectileSet.add(tmp);
    },
    explodes : function()
	{
        if(this.timeToBeAlive == 0) 
		{
			this.nbOfLives--;
            if(this.nbOfLives>0)
			{
                this.timeToBeAlive = _timeToBeAlive;
                this.cptExplosion = 1;
            }
			else
			{
                //Game Over
				gameOver();
            }
        }
    },

    clear : function()
	{
        conArena.clearRect(this.x-2,this.y-2,this.width+4,this.height+4);
        this.projectileSet.clear();
    },
    update :  function()
	{
        var keycode;
		
		if( this.pastShoot>0)
		{
			this.pastShoot--;
		}
		
        if(this.timeToBeAlive>0) 
		{
            this.timeToBeAlive --; 
        }
		else
		{
			key = tab[0];

			if( key!= 0)
			{
				this.isWalking = true;
			}
			
			//	THE down-arrow KEY
			if (key == 40) 
			{
				if( this.y< (ArenaHeight-this.height-this.ySpeed -5))
				{
					this.y = this.y + this.ySpeed;
				}
				else if( this.y<(ArenaHeight-this.height -5) )
				{
					this.y = (ArenaHeight-this.height-6);
				}
				this.spriteLine = 0;
				this.dir = 1;
				this.xShootSpeed = 0;
				this.yShootSpeed = 8;
			}	
			//	THE up-arrow KEY
			if (key == 38) 
			{
				if( this.y>3)
				{
					this.y = this.y - this.ySpeed;
				}
				else if ( this.y>3 )
				{
					this.y = 4;
				}
				this.spriteLine = 3;
				this.dir = 1;
				this.xShootSpeed = 0;
				this.yShootSpeed = -8;
			}
			//	THE left-arrow KEY
			if (key == 37) 
			{
				if( this.x>this.xSpeed)
				{
					this.x = this.x-this.xSpeed;
				}
				else if( this.x>0)
				{
					this.x = 1;
				}
				this.spriteLine = 1;
				this.dir = 0;
				this.xShootSpeed = -8;
				this.yShootSpeed = 0;
			}
			//	THE right-arrow KEY
			if (key == 39) 
			{
				if(this.x< (ArenaWidth-this.width-this.xSpeed))
				{
					this.x = this.x + this.xSpeed;
				}
				else if(this.x< (ArenaWidth-this.width))
				{
					this.x = (ArenaWidth-this.width-1);
				}
				this.spriteLine = 2;
				this.dir = 0;
				this.xShootSpeed = 8;
				this.yShootSpeed = 0;
			}
			
			if(key != 0 && this.isWalking)	//si on marche et que l'on continue de marcher
			{
				if(tics % 8 == 1) 
				{
					this.spriteColumn = (this.spriteColumn+1)%4;
				}
			}
			else
			{
				if(this.isWalking)	//si on était en train de marcher et qu'il n'y a plus de déplacement demandé, on arrête la marche et on affiche le personnage en position de "non-marche"
				{
					this.isWalking = false;
					this.spriteColumn = 0;
				}
			}	
			
			if(!pacifist && space) //pas de tir autorisé en mode survie
			{
				if(this.pastShoot===0)
				{
					this.fires();
					this.pastShoot = 50;
				}                
            }
            else	//si l'utilisateur a relaché la barre d'espace
            {
            	this.pastShoot = 0;
            }

        }
        this.projectileSet.update();
    },
    draw : function()
	{
        if(this.timeToBeAlive == 0) 
		{
            conArena.drawImage(this.img, this.spriteColumn*this.spriteWidth,this.spriteLine*this.spriteHeight,this.spriteWidth,this.spriteHeight, this.x,this.y,this.width,this.height);
            this.cptExplosion=0;
        }
		else
		{
            //exploding
            if(this.cptExplosion!=0)
			{
               conArena.drawImage(this.imgExplosion, this.cptExplosion*this.imgExplosionWidth, 0, this.imgExplosionWidth,this.imgExplosionHeight, this.x,this.y,this.width,this.height);
               	if(tics % 3 == 1) 
			   	{
				   this.cptExplosion = (this.cptExplosion+1)%10;
				}
            }
        }
        this.projectileSet.draw();
    }
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//########################################################################
//########################################################################
//						Mise à jour du jeu
//########################################################################
//########################################################################

function createEnemy()
{
	do	//on cherche une position différente du héro
	{
		var randx = Math.floor(Math.random() * (ArenaWidth-40));
		var randy = Math.floor(Math.random() * (ArenaHeight-30));
	} while( randx < player.x + player.width + 60
			&& randx > player.x - 60
			&& randy < player.y + player.height +60
			&& randy > player.y - 60)
	
	//on choisit le type d'ennemi (en fonction de la difficulté du jeu)		
	var randType = Math.random()*100;
	var new_type;
	
	var i=0;
	var fin = false;
	do
	{
		if(randType < level[i])
		{
			new_type = i;
			fin = true;	
		}
		else
		{
			i++;
		}
	}while( !fin && (i<10));
	
	if( i==10 )
	{
		new_type = 10;
	}
	
	//on choisit une vitesse initiale
	var randSpeed = evalSpeed(new_type);

	var dir = Math.floor(Math.random()*2);
	
	//on crée l'ennemi
	enemies.add(new Enemy(randx, randy,randSpeed,dir,new_type));
	nbEnemy++;
}


function updateSurvival()
{
		if( tics%50 == 1)
		{
			player.projectileSet.score+=1; //le score augmente avec le temps écoulé
		}
		
		if(pacifist && tics%700 == 0) //en mode pacifiste, on supprime un ennemi régulièrement pour les renouveller
		{
			enemies.tabEnemies[0].explodes();
		}
		if( tics%1500 == 1)
		{
			updateDiff();	//on augmente la difficulté
		}
}


function updateItems() //mise à jour des éléments
{
    player.update();	//mise à jour du héro
    projectileSet.update();
	
	if(mode == 1)	//mode Survival
	{
		updateSurvival();
	}
	
    if(tics % timeNewEnemy == 1 && nbEnemy< nbEnemyMax) //si il est temps de créer un nouvel ennemi et que le nombre d'ennemis max n'est pas atteint
	{
		createEnemy();		
    }
	//on met à jour les ennemis
    enemies.update();
}

function updateGame() //mise à jour du jeu
{
    updateItems();	//mise à jour des éléments
}


///////////////////////////////////////////////////////////////////////////////////////////////////////

//########################################################################
//########################################################################
//						Affichage
//########################################################################
//########################################################################

function drawItems()	//affichage des éléments
{
    player.draw();
    enemies.draw();
    projectileSet.draw();
}

function drawScore()	//affichage du score
{
	var score = document.getElementById("scoreTxt");
	score.innerHTML = player.projectileSet.score;	//mise à jour de la valeur affichée
	
	conLife.fillText("Lives : "+player.nbOfLives, 10, 25);	//affichage du nombre de vie
}

function drawGame() //affichage du jeu
{
	drawScore();	//affichage du score
    drawItems();   	//affichage des éléments 
}

function clearItems() // netttoyage des éléments
{
    player.clear(); 
    enemies.clear();
    projectileSet.clear();
}
function clearScore() // netttoyage du score
{
    conLife.clearRect(0,0,300,50);
}

function clearGame() // nettoyage du jeu
{
	clearScore();	// score
    clearItems();	// éléments
}


///////////////////////////////////////////////////////////////////////////////////////////////////////

//########################################################################
//########################################################################
//						Boucle de jeu
//########################################################################
//########################################################################

function mainloop () //boucle de jeu
{
	tics++;	//on augmente le compteur
    clearGame();	//on 'nettoie' le jeu
    updateGame();	//on le met à jour
    drawGame();		//on l'affiche
}

function recursiveAnim () 
{ 
    mainloop();	//boucle de jeu
    if(continuer)	//si le jeu n'est pas en pause
	{
		anim = animFrame( recursiveAnim );	//on fait une requete pour relancer l'animation
	}
}


///////////////////////////////////////////////////////////////////////////////////////////////////////

//########################################################################
//########################################################################
//						initialisation du jeu (ou d'une partie)
//########################################################################
//########################################################################

function init() //initialisation de l'environnement
{
	projectileSet = new ProjectileSet();
	for(var i=0; i<4;i++)	//tableau des touches 
	{
		tab[i]=0;
	}
	for(var i=0; i<10;i++)	//tableau des niveaux 
	{
		level[i]=0;
	}
	
	// canvas
	
    divArena = document.getElementById("canContainer");
	
	canLife = document.createElement("canvas");
    canLife.setAttribute("id","canLife");
    canLife.setAttribute("height", 50);
    canLife.setAttribute("width", ArenaWidth);
    conLife = canLife.getContext("2d");
    conLife.fillStyle = "rgb(255,255,255)";
    conLife.font = 'bold 14pt Courier';
    divArena.appendChild(canLife);
	
    canArena = document.createElement("canvas");
    canArena.setAttribute("id", "canArena");
    canArena.setAttribute("height", ArenaHeight);
    canArena.setAttribute("width", ArenaWidth);
    conArena = canArena.getContext("2d");
    divArena.appendChild(canArena);
  
    //gestion des touches pressées
	
	window.addEventListener("keydown", doKeyDown, false);
	window.addEventListener("keyup", doKeyUp, false);
	
	// gestion du son
	
	audioTrack.volume=0.3;
	audioTrack.addEventListener('ended', finish);
	
	musique.addEventListener('click',muteMusic,false);
	
	// gestion de l'environnement de jeu
	
	replay.addEventListener('click',restart,false);
	play.addEventListener('click',pause,false);
	
	recommencer.addEventListener('click',restartGO,false);
	closeGameOver.addEventListener('click',endGameOver,false);
    
	document.addEventListener('dragover', function(e) {e.preventDefault();},false);
	document.addEventListener('drop',function(e) {divDropped(e);},false);

	closeGoal.addEventListener('click',function(){goalDiv.style.visibility = "hidden";},false);
	closeControl.addEventListener('click',function(){controlDiv.style.visibility = "hidden";},false);
	closeEnemies.addEventListener('click',function(){enemiesDiv.style.visibility = "hidden";},false);
	closeCopyright.addEventListener('click',function(){copyrightDiv.style.visibility = "hidden";},false);
	
	objectif.addEventListener('click',function(){goalDiv.style.visibility = "visible";},false);
	instructions.addEventListener('click',function(){controlDiv.style.visibility = "visible";},false);
	enemiesList.addEventListener('click',function(){enemiesDiv.style.visibility = "visible";},false);
	copyright.addEventListener('click',function(){copyrightDiv.style.visibility = "visible";},false);
	
	goalDiv.addEventListener('dragstart',function (e) { quelleDiv = 1; xDec=e.clientX - goalDiv.offsetLeft; yDec=e.clientY - goalDiv.offsetTop;});
	controlDiv.addEventListener('dragstart',function (e) { quelleDiv = 2; xDec=e.clientX - controlDiv.offsetLeft; yDec=e.clientY - controlDiv.offsetTop;});
	enemiesDiv.addEventListener('dragstart',function (e) { quelleDiv = 3; xDec=e.clientX - enemiesDiv.offsetLeft; yDec=e.clientY - enemiesDiv.offsetTop;});
	copyrightDiv.addEventListener('dragstart',function (e) { quelleDiv = 4; xDec=e.clientX - copyrightDiv.offsetLeft; yDec=e.clientY - copyrightDiv.offsetTop;});
}

function evalSpeed(enemyType)	//evaluation de la vitesse de l'ennemi selon son type
{
	var randSpeed;
	var coef;
	switch(enemyType)
	{
		case 0:
			coef = 1;
			break;
		case 1:
			coef = 1;
			break;
		case 2:
			coef = 1.5;
			break;
		case 3:
			coef = 1.7;
			break;
		case 4:
			coef = 2;
			break;
		case 5:
			coef = 2.2;
			break;
		case 6:
			coef = 2.4;
			break;
		case 7:
			coef = 2.7;
			break;
		case 8:
			coef = 3;
			break;
		case 9:
			coef = 3.5;
			break;
		case 10:
			coef = 0.75;
			break;
	}
		
	if( Math.random()>=0.5)
	{
		randSpeed = 1;
	}
	else
	{
		randSpeed = -1;
	}
	randSpeed *= (coef + Math.random()*1.5-0.75);	//tous les ennemis d'une meme type n'ont pas la meme vitesse (c'est juste un ordre de grandeur)

	return randSpeed;
}

function setDifficulte()	//détermination de la difficulté
{
	mode = 0;
	pacifist = false;
	
	diff = document.getElementById("difficulte").value;	//on récupère la difficulté choisie par l'utilisateur
	
	switch(diff)	//on met à jour les différents paramètres
	{
		case "0":
			livesMax = 3;
			timeNewEnemy = 170;
			nbEnemyMax = 6;
			level[0] = 60;
			level[1] = 75;
			level[2] = 81;
			level[3] = 86;
			level[4] = 90;
			level[5] = 94;
			level[6] = 96;
			level[7] = 97.5;
			level[8] = 99;
			level[9] = 99.5;
			break;
		case "1":
			livesMax = 3;
			timeNewEnemy = 160;
			nbEnemyMax = 8;
			level[0] = 40;
			level[1] = 55;
			level[2] = 65;
			level[3] = 72;
			level[4] = 80;
			level[5] = 90;
			level[6] = 93;
			level[7] = 96;
			level[8] = 98;
			level[9] = 99;
			break;
		case "2":
			livesMax = 4;
			timeNewEnemy = 140;
			nbEnemyMax = 9;
			level[0] = 25;
			level[1] = 35;
			level[2] = 44;
			level[3] = 58;
			level[4] = 67;
			level[5] = 76;
			level[6] = 81;
			level[7] = 86;
			level[8] = 91;
			level[9] = 95;
			break;
		case "3":
			livesMax = 5;
			timeNewEnemy = 140;
			nbEnemyMax = 10;
			level[0] = 20;
			level[1] = 30;
			level[2] = 37;
			level[3] = 48;
			level[4] = 58;
			level[5] = 67;
			level[6] = 75;
			level[7] = 80;
			level[8] = 85;
			level[9] = 92;
			break;
		case "4":
			livesMax = 4;
			timeNewEnemy = 120;
			nbEnemyMax = 11;
			level[0] = 15;
			level[1] = 23;
			level[2] = 31;
			level[3] = 40;
			level[4] = 49;
			level[5] = 58;
			level[6] = 66;
			level[7] = 74;
			level[8] = 82;
			level[9] = 90;
			break;
		case "5":
			livesMax = 3;
			timeNewEnemy = 100;
			nbEnemyMax = 12;
			level[0] = 10;
			level[1] = 16;
			level[2] = 22;
			level[3] = 28;
			level[4] = 34;
			level[5] = 40;
			level[6] = 50;
			level[7] = 60;
			level[8] = 70;
			level[9] = 80;
			break;
		case "6":
			livesMax = 2;
			timeNewEnemy = 90;
			nbEnemyMax = 15;
			level[0] = 1;
			level[1] = 5;
			level[2] = 10;
			level[3] = 16;
			level[4] = 22;
			level[5] = 28;
			level[6] = 38;
			level[7] = 48;
			level[8] = 58;
			level[9] = 70;
			break;
		case "pacifist":
			pacifist = true;
			mode = 1;	
					
			livesMax = 3;
			timeNewEnemy = 200;
			nbEnemyMax = 6;
			level[0] = 60;
			level[1] = 75;
			level[2] = 81;
			level[3] = 86;
			level[4] = 90;
			level[5] = 94;
			level[6] = 96;
			level[7] = 97.5;
			level[8] = 99;
			level[9] = 99.5;
			break;
			
		case "survival":
			mode = 1;	
					
			livesMax = 3;
			timeNewEnemy = 200;
			nbEnemyMax = 6;
			level[0] = 60;
			level[1] = 75;
			level[2] = 81;
			level[3] = 86;
			level[4] = 90;
			level[5] = 94;
			level[6] = 96;
			level[7] = 97.5;
			level[8] = 99;
			level[9] = 99.5;
			break;
	}
}

function updateDiff()	//pour les modes 'Survival'
{
	if(timeNewEnemy > 80)	//on limite le temps de respawn minimal
	{
		timeNewEnemy-=15;
	}
	if(nbEnemyMax < 15)	//on limite le nombre d'ennemis qu'il peut y avoir au maximum
	{
		nbEnemyMax++;
	}
	if(level[0]>20)
	{
		for( var i =9; i>0; i--)
		{
			level[i]=level[i-1];
		}
		level[0] -= level[0]/10;
		
	}
}

///////////////////////////////////////////////////////////////////////////////////////////////////////

//########################################################################
//########################################################################
//						gestion de l'environnement du jeu
//########################################################################
//########################################################################

function divDropped(event)	//pour déplacer les cadres (div) d'informations
{
	event.preventDefault();

	switch(quelleDiv)	//selon le div, on le met au premier plan et on le déplace à la position souhaitée
	{
		case 1:
			goalDiv.style.left = (event.clientX - xDec) + 'px';
			goalDiv.style.top = (event.clientY - yDec)+ 'px';
			goalDiv.style.zIndex = 1;
			controlDiv.style.zIndex = 0;
			enemiesDiv.style.zIndex = 0;
			copyrightDiv.style.zIndex = 0;
			quelleDiv = 0;
			break;
		case 2:
			controlDiv.style.left = (event.clientX - xDec) + 'px';
			controlDiv.style.top = (event.clientY - yDec)+ 'px';
			goalDiv.style.zIndex = 0;
			controlDiv.style.zIndex = 1;
			enemiesDiv.style.zIndex = 0;
			copyrightDiv.style.zIndex = 0;
			quelleDiv = 0;
			break;
		case 3:
			enemiesDiv.style.left = (event.clientX - xDec) + 'px';
			enemiesDiv.style.top = (event.clientY - yDec)+ 'px';
			goalDiv.style.zIndex = 0;
			controlDiv.style.zIndex = 0;
			enemiesDiv.style.zIndex = 1;
			copyrightDiv.style.zIndex = 0;
			quelleDiv = 0;
			break;
		case 4:
			copyrightDiv.style.left = (event.clientX - xDec) + 'px';
			copyrightDiv.style.top = (event.clientY - yDec)+ 'px';
			goalDiv.style.zIndex = 0;
			controlDiv.style.zIndex = 0;
			enemiesDiv.style.zIndex = 0;
			copyrightDiv.style.zIndex = 1;
			quelleDiv = 0;
			break;
		default:
			break;
	}	
}

function gameOver()	//partie perdue
{
	isGameOver = true;
	pause();		//on stop le jeu
	
	var modeTxt;
	
	//on met à jour les informations sur la partie effectuée
	
	if( mode==1)
	{
		if(pacifist)
		{
			modeTxt = "Pacifist Survival";
		}
		else
		{
			modeTxt = "Survival";
		}
	}
	else
	{
		modeTxt = "Normal level "+diff;
	}
	gameOver_text.innerHTML = "<h2>You were exterminated</h2><p>Mode : "+modeTxt+"<br>You got "+player.projectileSet.score+" point(s)</p>";

	gameOverDiv.style.visibility = "visible";	//on affiche un message indiquant la fin de la partie et le score atteint
}


function endGameOver()	//pour quitter le message de fin de partie
{
	isGameOver = false;	//pour pouvoir relancer une partie
	startGame = true;	//ce sera forcément une nouvelle partie
	gameOverDiv.style.visibility="hidden";	//on cache le message de fin de partie
}


function restartGO()	//si l'on souhaite recommencer une partie directement
{
	endGameOver();	//on commence par quitter le message de fin de partie
	restart();	//on lance une nouvelle partie
}


function restart()	//lancer une nouvelle partie
{
	tics = 0;	//on réinitialise le compteur
	startGame = true;	//c'est une nouvelle partie
	pause();
}

function pause() //mettre le jeu en pause ou lancer le jeu
{
  if (isGameOver || (!startGame && continuer)) //si la partie est perdue OU si une partie est en cours
  {
	playImg.setAttribute('src','images/play.png');
	continuer = false;		//on met le jeu en pause
  } 
  else 	//sinon, c'est une nouvelle partie, ou on relance une partie en cours
  {
	playImg.setAttribute('src','images/pause.png');
	continuer = true;	
	if(startGame)	//si c'est une nouvelle partie
	{
		nbEnemy = 0;	
		if(!firstGame)	//et que ce n'est pas la première partie, on supprime la partie précédante
		{
			projectileSet.reinit();
			clearGame();
			if(continuer)
			{
				cancelAnimFrame(anim);
			}
		}
		setDifficulte();	//on initialise la difficulté
		player.init();		//on initialise le joueur
		enemies.init();		//on initialise les ennemis
		startGame = false;	//ce n'est plus un début de partie
	}
	firstGame = false;	//ce n'est plus la première partie
	anim = animFrame( recursiveAnim );	//on lance la boucle de jeu
  }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////

//########################################################################
//########################################################################
//						à faire au chargement de la page
//########################################################################
//########################################################################

window.addEventListener("load", init, false);
