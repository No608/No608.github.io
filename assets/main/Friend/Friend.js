console.log("Friend js On!");


class World
{
    // static Property
	static Instance = null;

	// Property
	Friends = [];
	PrevTimeClock;
	MouseX;
	MouseY;

    constructor()
    {
		this.Friends = [];
		this.PrevTimeClock = 0;
		this.MouseX = 0;
		this.MouseY = 0;
    }

    static GetInstance()
    {
		if (World.Instance == null) 
        {
			World.Instance = new World();
        }

		return World.Instance;    
	}

	Start()
	{
		let FriendObject = new Friend("Bot");
		FriendObject.Init();
		FriendObject.Start();

		this.Friends.push(FriendObject);

		addEventListener("mousemove", this.Mousemove.bind(this));
		addEventListener("mousedown", this.MouseDown.bind(this));
		addEventListener("mouseup", this.MouseUp.bind(this));

		requestAnimationFrame(this.Tick.bind(this));

		// addEventListener("DOMContentLoaded", Start);
	}
	
	Mousemove(Event)
	{
		this.MouseX = Event.clientX; // x 좌표
		this.MouseY = Event.clientY; // y 좌표

		this.Friends.forEach(FriendObject =>
		{
			FriendObject.Mousemove(this.MouseX, this.MouseY);
		});
	}

	MouseDown()
	{
		this.Friends.forEach(FriendObject =>
		{
			FriendObject.MouseDown();
		});
	}

	MouseUp()
	{
		this.Friends.forEach(FriendObject =>
		{
			FriendObject.MouseUp();
		});
	}

	Tick(msTimestamp)
	{
		const DeltaTime = (msTimestamp - this.PrevTimeClock) / 1000;
		this.PrevTimeClock = msTimestamp;

		this.Friends.forEach(FriendObject =>
		{
			FriendObject.Tick(DeltaTime);
			FriendObject.Draw(DeltaTime);
		});

		requestAnimationFrame(this.Tick.bind(this));
	}
}


/**
 * @Property
 * String : Name
 * Element : Canvas
 * ctx
 * PosX, PosY
 * bInMouse = false;
 * bMouseDown = false;
 * AnchorX, AnchorY
 */
class Friend
{
    #Key_PosX = "PosX";
    #Key_PosY = "PosY";
    
    // Const
    #SaveCycleTime = 3;

    constructor(Name)
    {
        this.Name = Name;
        this.bInMouse = false;
        this.bMouseDown = false;
        this.PosX = 500;
        this.PosY = 500;
        this.AnchorX = 0.5;
        this.AnchorY = 0.5;
    }

    SetStyle() 
    {
        this.Canvas.style.position = 'fixed';
        this.Canvas.style.zIndex = '1000';
        this.Canvas.style.top = this.PosX + 'px';
        this.Canvas.style.left = this.PosY + 'px';
        this.Canvas.style.width = this.Canvas.width + 'px';
        this.Canvas.style.height = this.Canvas.height + 'px';
        // this.Canvas.style.pointerEvents = 'none';
        //Canvas.style.border = '1px solid #000';
        //Canvas.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    }
    
    Init()
    {   
        this.Canvas = document.createElement('canvas');
        this.Canvas.id = this.Name;
        this.Canvas.width = 100;
        this.Canvas.height = 100;

        this.LocalStorageLoad();

        this.SetStyle();
    }

    Start()
    {
        document.body.appendChild(this.Canvas);
        
        this.ctx = this.Canvas.getContext('2d');
    }

    LocalStorageLoad()
	{
        this.PosX = localStorage.getItem(this.#Key_PosX);
        this.PosY = localStorage.getItem(this.#Key_PosY);
    }

    LocalStorageSave()
	{
        localStorage.setItem(this.#Key_PosX, this.PosX);
        localStorage.setItem(this.#Key_PosY, this.PosY);
    }
   
    OnClick()
    {
        // console.log("OnClick");
    }

    /**
     * Set
     * @param : (px) Int Unit
     */
    SetPos(X, Y) 
    {
        this.PosX = X;
        this.PosY = Y;
    }

    MouseDown()
    {
        this.bMouseDown = true;
        // console.log("Down");
    }

    MouseUp()
    {
        this.bMouseDown = false;
        // console.log("Up");
        
        this.OnClick(); 
    }

    MouseEnter()
    {
        // console.log("MouseEnter");
    }

    MouseLeave()
    {
        // console.log("MouseLeave");
    }

    Mousemove(MouseX, MouseY)
    {
        if (this.IsInMouse(MouseX, MouseY))
        {
            if (this.bInMouse == false)
            {
                this.MouseEnter();
            }
            
            this.bInMouse = true;
            
            if (this.bMouseDown == true)
            {
                this.SetPos(MouseX, MouseY);
            }
        }
        else 
        {
            if (this.bInMouse == true)
            {
                this.MouseLeave();
            }

            this.bInMouse = false;
        }
    }

    IsInMouse(MouseX, MouseY)
    {
        const StartX = this.PosX - (this.AnchorX * this.Canvas.width);
        const EndX = this.PosX + (this.AnchorX * this.Canvas.width);

        const StartY = this.PosY - (this.AnchorY * this.Canvas.height);
        const EndY = this.PosY + (this.AnchorY * this.Canvas.height);

        // console.log("X %d, %d", StartX, EndX);
        // console.log("Y %d, %d", StartY, EndY);
        // console.log("Mouse %d, %d", MouseX, MouseY);

        if (MouseX >= StartX && MouseX <= EndX && MouseY >= StartY && MouseY <= EndY)
        {
            return true
        }
        else 
        {
            return false;
        }
    }

    
    /**
     * Tick
     * @property SumSaveTime : SaveCycleTime
     * @param DeltaTime : s Unit
    */
    SumSaveTime = 0;
    Tick(DeltaTime)
	{
        this.SumSaveTime += DeltaTime;
        if (this.SumSaveTime >= this.#SaveCycleTime)
        {
            this.LocalStorageSave();
            this.SumSaveTime -= this.#SaveCycleTime;
        }

        // console.log(DeltaTime);
        // console.log(this.SumSaveTime);
    }

    /**
     * Tick Draw
     * @param DeltaTime : s Unit
     */
    Draw(DeltaTime)
    {
        this.ctx.clearRect(0, 0, this.Canvas.width, this.Canvas.height);
        
        const SetX = this.PosX - (this.AnchorX * this.Canvas.width);
        const SetY = this.PosY - (this.AnchorY * this.Canvas.height);

        this.Canvas.style.left = SetX + "px";
        this.Canvas.style.top = SetY + "px";

        this.ctx.fillStyle = 'blue';
        this.ctx.fillRect(0, 0, this.Canvas.width, this.Canvas.height);
    }
}

World.GetInstance().Start();
