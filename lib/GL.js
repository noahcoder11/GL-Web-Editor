class Sampler2D {
    constructor(texture) {
        this.data = GL.toImageData(texture).data
        this.texture = texture
    }
    sample(u, v) {
        var texel = ~~(u * this.texture.width) + ~~(v * this.texture.height) * this.texture.width << 2

        return [
            this.data[texel + 0],
            this.data[texel + 1],
            this.data[texel + 2],
            this.data[texel + 3]
        ]
    }
}

class VariableLengthBuffer {
    constructor(data, step) {
        this.buffer = data
        this.length = data.length
        this.step = step
        this.index = 0
        this.done = false
    }

    get value() {
        if(this.index < this.length){
            const value = this.buffer.slice(this.index, this.index + this.step);
            this.index += this.step
            
            if(this.index >= this.length){
                this.done = true
            }
            
            return value
        }
        
        return
    }

    ref(index) {
        const i = index * this.step
        return this.buffer.slice(i, i + this.step)
    }

    push(value) {
        this.buffer.push(value)
        this.length = this.buffer.length
    }

    reset() {
        this.done = false
        this.index = 0
    }

    clear() {
        this.index = 0
        this.length = 0
        this.buffer = []
        this.done = false
        this.step = 0
    }
}

class ShaderObject {
    constructor() {
        this._uniform = {}
        this._attributes = {}
        this._varying = {}
    }

    varying(name, bufferData, step) {
        step = step || 1
        this._varying[name] = new VariableLengthBuffer(bufferData, step)
    }

    uniform(name, value) {
        this._uniform[name] = value
    }

    attribute(name, bufferData, step) {
        step = step || 1
        this._attributes[name] = new VariableLengthBuffer(bufferData, step)
    }
}

class GL {
    static _shaders = []
    static VERTEX_SHADER = 0
    static FRAGMENT_SHADER = 1
    static viewport = null
    static DEPTH_TEST = false
    static CULL_FACE = true
    static FRONT = 0
    static BACK = 1
    static DEPTH_BUFFER = {}

    static toImageData(img) {
        var canvas = document.createElement('canvas')
        var context = canvas.getContext('2d')
        canvas.width = img.width
        canvas.height = img.height
        context.drawImage(img, 0, 0)
        return context.getImageData(0, 0, img.width, img.height)
    }

    static vecMat4Mult = function(v, m) {
        v[3] = v[3] || 1
        
        return [
            v[0]*m[0][0] + v[1]*m[1][0] + v[2]*m[2][0] + v[3]*m[3][0],
            v[0]*m[0][1] + v[1]*m[1][1] + v[2]*m[2][1] + v[3]*m[3][1],
            v[0]*m[0][2] + v[1]*m[1][2] + v[2]*m[2][2] + v[3]*m[3][2],
            v[0]*m[0][3] + v[1]*m[1][3] + v[2]*m[2][3] + v[3]*m[3][3]
        ]
    }

    static bindShader = function(shaderFunction, shaderType) {
        GL._shaders[shaderType] = shaderFunction
    }

    static createShader = function(shader) {
        var regex = {
            _attributes: /@(.+?)[\[\(\{\<\?\:\;\"\'\!\@\#\$\%\^\&\*\+\=\_\-\`\~ \n\}\]\)\>]/,
            _varying: /\$(.+?)[\[\(\{\<\?\:\;\"\'\!\@\#\$\%\^\&\*\+\=\_\-\`\~ \n\}\]\)\>]/,
            _uniform: /#(.+?)[\[\(\{\<\?\:\;\"\'\!\@\#\$\%\^\&\*\+\=\_\-\`\~ \n\}\]\)\>]/
        }

        for(var r in regex) {
            if(shader.match(regex[r])) {
                var global = new RegExp(regex[r], "g")
                var match = [...shader.matchAll(global)]
                
                for(var m of match) {
                    shader = shader.replace(regex[r], `params.${ r }.${ m[1] }${ m[0].slice(-1) }`)
                }
            }
        }

        return new Function("params", "width", "height", "frameCount", shader)
    }

    static _interpolate = function(y, y1, y2, x1, x2) {
        return x1 + (x2 - x1) * (y - y1) / (y2 - y1)
    }

    static _interpolateY = function(vertices, values, y, z) {
        var out = [],
        
        v0 = values.ref(0),
        v1 = values.ref(1),
        v2 = values.ref(2);

        for(var i = 0;i < values.step;i++){
            var value1, value2
            
            if(z){
                value1 = y < vertices[1].y ? 
                    GL._interpolate(y, vertices[0].y, vertices[1].y, v0[i] / vertices[0].z, v1[i] / vertices[1].z) : 
                    GL._interpolate(y, vertices[1].y, vertices[2].y, v1[i] / vertices[1].z, v2[i] / vertices[2].z)
                value2 = GL._interpolate(y, vertices[0].y, vertices[2].y, v0[i] / vertices[0].z, v2[i] / vertices[2].z)
            }else {
                value1 = y < vertices[1].y ? 
                    GL._interpolate(y, vertices[0].y, vertices[1].y, v0[i], v1[i]) : 
                    GL._interpolate(y, vertices[1].y, vertices[2].y, v1[i], v2[i])
                value2 = GL._interpolate(y, vertices[0].y, vertices[2].y, v0[i], v2[i])
            }
            
            if(vertices[1].x > vertices[0].x || vertices[1].x > vertices[2].x){
                out.push([value2, value1]);
            }else {
                out.push([value1, value2]);
            }
        }
        
        return out
    }

    static render(tBuffer, fShaderObject, vShaderObject, time) {
        if(GL.DEPTH_TEST) {
            GL.DEPTH_BUFFER = {}
        }

        if(tBuffer.done) {
            tBuffer.reset()
        }
        
        // Get the pixels
        var pixels = GL.viewport.getImageData(0, 0, width, height).data

        // Sorting function for later
        function sort(a, b) {
            return a.y - b.y || a.x - b.x
        }
        
        // While the triangle buffer is not finished
        while(!tBuffer.done) {
            // Get the data from the buffer at its current index 
            var tri = tBuffer.value
            // For the 3 vertices indicated
            var vertices = []
            // For the 3 of all the varying attributes that match the vertices
            var varying = {}
            
            for(var a in vShaderObject._attributes) {
                var current = []
                
                for(var i = 0;i < tri.length;i++){
                    current[i] = vShaderObject._attributes[a].ref(tri[i])
                }
                
                for(var v = 0;v < current.length;v++){
                    var object = new ShaderObject()
                    object._uniform = vShaderObject._uniform
                    object._attributes[a] = current[v]
                    
                    vertices[v] = GL._shaders[0](object, width, height, time)
                    if(!vertices[v].args) {
                        vertices[v] = new Vector(...vertices[v])
                    }
                    vertices[v].args[4] = v
                }
            }
            
            // Sort them for rendering
            vertices.sort(sort);

            var order = [];
            
            for(var v = 0;v < vertices.length;v++){
                order[v] = vertices[v].args[4];
            }
            console.log(order)
            for(var i in fShaderObject._varying){
                var data = [];
                
                for(var t = 0;t < order.length;t++){
                    data = data.concat(fShaderObject._varying[i].ref(tri[order[t]]));
                }
                
                varying[i] = new VariableLengthBuffer(data, fShaderObject._varying[i].step);
            }
            
            // Loop from least Y to greatest Y
            for(var y = Math.ceil(vertices[0].y);y < Math.ceil(vertices[2].y);y++){
                // Format the Xs as a VariableLengthBuffer for Y-Interpolation
                var formatted = new VariableLengthBuffer([
                    vertices[0].x, vertices[0].z, 1/vertices[0].z,
                    vertices[1].x, vertices[1].z, 1/vertices[1].z,
                    vertices[2].x, vertices[2].z, 1/vertices[2].z,
                ], 3),
                // Interpolate values
                _int = GL._interpolateY(vertices, formatted, y),
                // get the sum of the values
                added = _int[0][0] + _int[0][1],
                // get the minimum x-value
                _min = Math.min(_int[0][0], _int[0][1]),
                // get the maximum x-value by subtracting the minimum from the sum of the two
                _max = added - _min,
                // Get the final starting x-position
                start = ~~Math.max(_min, 0),
                // Get the final end x-position
                end = ~~Math.min(_max, width),
                
                // Varying values interpolated across Y
                varyingY = {};
                
                // Interpolate
                for(var i in varying){
                    varyingY[i] = GL._interpolateY(vertices, varying[i], y, vertices[0].z);
                }
                
                // Loop through x-values
                for(var x = start;x < end;x++){
                    var z = GL._interpolate(x, start, end, _int[1][0], _int[1][1])
                    var inv_z = vertices[0].z ? GL._interpolate(x, start, end, _int[2][0], _int[2][1]) : 1
                    

                    let depthValue

                    if(GL.DEPTH_TEST) {
                        depthValue = GL.DEPTH_BUFFER[`${ x }, ${ y }`];

                        if(!depthValue || z < depthValue) {
                            GL.DEPTH_BUFFER[`${ x }, ${ y }`] = z;
                        }else {
                            continue;
                        }
                    }

                    // Varying values interpolated across X
                    var varyingX = {};
                    // Interpolate
                    for(var i in varyingY){
                        varyingX[i] = [];
                        for(var j = 0;j < varyingY[i].length;j++){
                            varyingX[i].push(GL._interpolate(x, start, end, varyingY[i][j][0], varyingY[i][j][1]) / inv_z);
                        }
                    }
                    // Create a new shader object
                    var object = new ShaderObject();
                    // Assign it the newly interpolated varying values for the current pixel
                    object._varying = varyingX;
                    // Assign it the orginal attributes from before
                    object._uniform = fShaderObject._uniform;
                    // Get the index of the current screen pixel
                    var idx = ~~x + ~~y * width << 2,
                    // Get the pixel color from the fragment shader
                    pixel = GL._shaders[1](object, width, height, time)

                    // Assign the current pixel to the color
                    pixels[idx + 0] = pixel[0];
                    pixels[idx + 1] = pixel[1];
                    pixels[idx + 2] = pixel[2];
                    pixels[idx + 3] = pixel[3];
                }
            }
        }
        // Update the screen
        GL.viewport.putImageData(new ImageData(pixels, width, height), 0, 0)
    }
}
