console.log("Open GL 0!");


class OpenGLManager
{
    // const Property
    CONST_OpenGLCanvasClassName = ".OpenGLCanvas";
    
    // Property
    OpenGLCanvasObjectList = [];
    PrevTimeClock;

    // static Property
    static Instance = null;

    constructor()
    {
        this.PrevTimeClock = 0;
    }

    static GetInstance() 
    {
        if (OpenGLManager.Instance == null) 
        {
            OpenGLManager.Instance = new OpenGLManager();
        }
    
        return OpenGLManager.Instance;    
    }

    async Start()
    {
        // Get All OpenGLCanvasClass
        const OpenGLCanvasElementList = document.querySelectorAll(this.CONST_OpenGLCanvasClassName);
        for (const OpenGLCanvasElement of OpenGLCanvasElementList)
        {
            const FileName = OpenGLCanvasElement.dataset.src;
            const WebGLContext = OpenGLCanvasElement.getContext('webgl');
            const OpenGLCanvasObject = new OpenGLCanvas(FileName, WebGLContext, OpenGLCanvasElement);
            await OpenGLCanvasObject.Init();

            this.OpenGLCanvasObjectList.push(OpenGLCanvasObject);
        }

        requestAnimationFrame(this.Tick.bind(this));
    }

    /**
     * @param msDeltatime : ms Clock
    */
    Tick(timestamp)
    {
        const msDeltatime = timestamp - this.PrevTimeClock;

        this.OpenGLCanvasObjectList.forEach(OpenGLCanvas =>
        {
            OpenGLCanvas.TickSetUniform(msDeltatime / 1000.0);
            OpenGLCanvas.SetupUniform();
            OpenGLCanvas.Draw();
        });

        this.PrevTimeClock = timestamp;

        requestAnimationFrame(this.Tick.bind(this));
    }
}

class OpenGLCanvas
{
    // Property
    Filename;
    Context;
    DOM;
    Program;
    uTime;
    MouseX;
    MouseY;

    // Resolution W, H
    uW;
    uH;

    // static const Property
    static CONST_OpenGLAssetsPath = "/assets/Public/OpenGL/";
    static CONST_VertexShaderFileName = "Default.vert";
    static CONST_Uniform_Time = "u_time";
    static CONST_Uniform_Mouse = "u_mouse";
    static CONST_Uniform_Resolution = "u_resolution";

    constructor(Filename, Context, DOM)
    {
        this.Filename = Filename;
        this.Context = Context;
        this.DOM = DOM;
        this.uTime = 0.0;
        this.MouseX = 0;
        this.MouseY = 0;
        this.uW = this.Context.drawingBufferWidth;
        this.uH = this.Context.drawingBufferHeight;;
    }

    async Init()
    {
        this.EventBind();

        this.SetResolutionUniform(this.uW, this.uH);
        
        const FragShaderSource = await this.FetchFile(OpenGLCanvas.CONST_OpenGLAssetsPath + this.Filename);
        const VertexShaderSource = await this.FetchFile(OpenGLCanvas.CONST_OpenGLAssetsPath + OpenGLCanvas.CONST_VertexShaderFileName);

        if (!FragShaderSource|| !VertexShaderSource)
        {
            console.log("Load Failed shader files");

            return;
        }

        const FragShader = this.CompileShader(this.Context, FragShaderSource, this.Context.FRAGMENT_SHADER);
		const VertexShader = this.CompileShader(this.Context, VertexShaderSource, this.Context.VERTEX_SHADER);

        if (!FragShader|| !VertexShader)
        {
            console.log("Shader Compile Failed");

            return;
        }
    
        this.Program = this.Context.createProgram();
        if (!this.Program)
        {
            console.log("Failed Create Program");
        }

        this.Context.attachShader(this.Program, FragShader);
        this.Context.attachShader(this.Program, VertexShader);

        this.Context.linkProgram(this.Program);
        this.Context.useProgram(this.Program);

        const positionBuffer = this.Context.createBuffer();
        this.Context.bindBuffer(this.Context.ARRAY_BUFFER, positionBuffer);
        const positions = new Float32Array([
            -1, -1,
            1, -1,
            -1, 1,
            1, 1,
        ]);
        this.Context.bufferData(this.Context.ARRAY_BUFFER, positions, this.Context.STATIC_DRAW);
    
        // 정점 속성 설정
        const positionLocation = this.Context.getAttribLocation(this.Program, 'a_position');
        this.Context.enableVertexAttribArray(positionLocation);
        this.Context.vertexAttribPointer(positionLocation, 2, this.Context.FLOAT, false, 0, 0);
    }

    EventBind()
    {
        this.DOM.addEventListener("mousemove", function (Event)
        {
            this.SetMouseUniform(Event.clientX, Event.clientY);
        }.bind(this));

        window.addEventListener("resize", function ()
        {
            const pixelWidth = this.Context.drawingBufferWidth;
            const pixelHeight = this.Context.drawingBufferHeight;

            Data.SetResolutionUniform(pixelWidth, pixelHeight);
        }.bind(this));
    }
    
    CompileShader(gl, source, type)
    {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
    	gl.compileShader(shader);

        if (gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        {
            return shader;
        } 
        else 
        {
            console.error('Shader Compile Error : ', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);

            return null;
        }
    }

    async FetchFile(url)
    {
        const response = await fetch(url);
        if (!response.ok) throw new Error('네트워크 오류 발생');

        return await response.text();
    }

    SetupUniform()
    {
        this.SetUniform_Float(OpenGLCanvas.CONST_Uniform_Time, this.uTime);

        const CanvasRect = this.DOM.getBoundingClientRect();
        
        const uMouseX = this.MouseX - CanvasRect.left;
        const uMouseY = CanvasRect.top - this.MouseY + this.uH;

        // function Clamp(Value, Min, Max)
        // {
        //     return Math.max(Min, Math.min(Max, Value));
        // }

        // uMouseX = Clamp(uMouseX, 0, CanvasRect.left);
        // uMouseY = Clamp(uMouseY, 0, CanvasRect.top);

        this.SetUniform_Vec2(OpenGLCanvas.CONST_Uniform_Mouse, uMouseX, uMouseY);
        this.SetUniform_Vec2(OpenGLCanvas.CONST_Uniform_Resolution, this.uW, this.uH);
    }

    Draw()
    {
        this.Context.clearColor(0, 0, 0, 1);
        this.Context.clear(this.Context.COLOR_BUFFER_BIT);
        this.Context.drawArrays(this.Context.TRIANGLE_STRIP, 0, 4);
    }
    
    /**
     * @param sDeltatime : sTime
     */
    TickSetUniform(sDeltatime)
    {
        this.uTime += sDeltatime;
    }
    
    SetMouseUniform(X, Y)
    {
        this.MouseX = X;
        this.MouseY = Y;
    }

    SetResolutionUniform(W, H)
    {
        this.uW = W;
        this.uH = H;
    }

    SetUniform_Float(UniformName, SetFloat)
    {
        const UniformLocation = this.Context.getUniformLocation(this.Program, UniformName);

        if (UniformLocation === null)
        {
            // console.warn("Uniform variable " + UniformName + " does not exist in the shader program.");
        }
        else
        {
            this.Context.uniform1f(UniformLocation, SetFloat);
        }
    }
    
    SetUniform_Vec2(UniformName, SetFloat1, SetFloat2)
    {
        const UniformLocation = this.Context.getUniformLocation(this.Program, UniformName);

        if (UniformLocation === null)
        {
            // console.warn('Uniform variable "u_someUniform" does not exist in the shader program.');
        }
        else
        {
            this.Context.uniform2f(UniformLocation, SetFloat1, SetFloat2);
        }
    }
}

OpenGLManager.GetInstance().Start();
