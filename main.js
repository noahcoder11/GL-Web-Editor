var v_shader, f_shader, js_code

function $(ref){
    return document.querySelector(ref)
}

function sizeEditors(){
    var editors = document.getElementsByClassName("editor")
    $("#editor-container").style.height = window.innerHeight/3 + "px"
    
    for(var editor of editors){
        editor.style.width = window.innerWidth/3 + "px"
    }

    v_shader.container.style.height = `${window.innerHeight/3}px`
    v_shader.resize()

    f_shader.container.style.height = `${window.innerHeight/3}px`
    f_shader.resize()

    js_code.container.style.height = `${window.innerHeight/3}px`
    js_code.resize()
}

function initEditors(){
    v_shader = ace.edit("v-shader")
    f_shader = ace.edit("f-shader")
    js_code = ace.edit("js-code")

    v_shader.setTheme("ace/theme/monokai");
    v_shader.session.setMode("ace/mode/javascript");

    f_shader.setTheme("ace/theme/monokai");
    f_shader.session.setMode("ace/mode/javascript");

    js_code.setTheme("ace/theme/monokai");
    js_code.session.setMode("ace/mode/javascript");
}

initEditors()

addEventListener("load", event => {
    sizeEditors()
})
addEventListener("resize", event => {
    sizeEditors()
})

var output = $("#output")
var _console = $("#console")

var timesrun = 0;
var width = output.width, height = output.height
console.log = function(){
    if(timesrun < 20) {
        _console.innerHTML += Array.from(arguments) + "<br>";
        timesrun ++;
    }else if(timesrun < 21){
        _console.innerHTML += "reached max logging in one session";
        timesrun ++;
    }
}

GL.viewport = output.getContext('2d', { willReadFrequently: true })

function runCode(){
    timesrun = 0;
    _console.innerHTML = ""
    var v_code = v_shader.getValue()
    var f_code = f_shader.getValue()
    var js = js_code.getValue()
    
    output.width = window.innerWidth
    output.height = 400
    
    eval(js)
    var fragShader = GL.createShader(f_code)
    var vertexShader = GL.createShader(v_code)

    GL.bindShader(vertexShader, GL.VERTEX_SHADER);
    GL.bindShader(fragShader, GL.FRAGMENT_SHADER);

    GL.render(tBuffer, fragShaderObject, vertexShaderObject)
}


//window.setInterval(runCode, 1000)