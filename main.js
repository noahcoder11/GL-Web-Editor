var v_shader, f_shader, js_code

function $(ref){
    return document.querySelector(ref)
}

var output = $("#output")
var _console = $("#console")
var liveUpdate = $("#live")

var timesrun = 0;
var TIME = 0;
var SESSION_ID = 0;

output.height = 400
output.width = 1411

var width = output.width, height = output.height
console.log(width, height)
var animationTime = 0

console.log(width, height)

console.log = function(){
    if(timesrun < 100) {
        _console.innerHTML += Array.from(arguments) + "<br>";
        timesrun ++;
    }else if(timesrun < 101){
        _console.innerHTML += "reached max logging in one session";
        timesrun ++;
    }
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

    var js_store = localStorage.getItem(`GL_WEB_EDITOR::CODE_CACHE::javascript`)
    var v_store = localStorage.getItem(`GL_WEB_EDITOR::CODE_CACHE::vertex-shader`)
    var f_store = localStorage.getItem(`GL_WEB_EDITOR::CODE_CACHE::fragment-shader`)
    var live_update = localStorage.getItem(`GL_WEB_EDITOR::CODE_CACHE::live-update`)

    if(v_store){
        v_shader.setValue(v_store, 1)
    }
    if(f_store){
        f_shader.setValue(f_store, 1)
    }
    if(js_store){
        js_code.setValue(js_store, 1)
    }
    if(live_update){
        liveUpdate.checked = (live_update === "true")
    }

    if(liveUpdate.checked){
        SESSION_ID = window.setInterval(runCode, 100)
    }
}

initEditors()

addEventListener("load", event => {
    sizeEditors()
    runCode()
})
addEventListener("resize", event => {
    sizeEditors()
})

GL.viewport = output.getContext('2d', { willReadFrequently: true })

function runCode(){
    const start = Date.now()

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

    GL.render(tBuffer, fragShaderObject, vertexShaderObject, TIME)

    TIME++;

    const end = Date.now()

    animationTime = end - start
}

function saveCode(){
    var v_code = v_shader.getValue()
    var f_code = f_shader.getValue()
    var js = js_code.getValue()

    localStorage.setItem(`GL_WEB_EDITOR::CODE_CACHE::vertex-shader`, v_code)
    localStorage.setItem(`GL_WEB_EDITOR::CODE_CACHE::fragment-shader`, f_code)
    localStorage.setItem(`GL_WEB_EDITOR::CODE_CACHE::javascript`, js)
    localStorage.setItem(`GL_WEB_EDITOR::CODE_CACHE::live-update`, liveUpdate.checked)
}

liveUpdate.addEventListener("change", () => {
    if(liveUpdate.checked){
        SESSION_ID = window.setInterval(runCode, 40)
    }else {
        window.clearInterval(SESSION_ID)
    }
})