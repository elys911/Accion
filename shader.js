<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Grad Shader Cosmic</title>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      overflow: hidden;
      background: black;
    }

    canvas {
      display: block;
      width: 100vw;
      height: 100vh;
    }
  </style>
</head>
<body>
  <canvas id="shaderCanvas"></canvas>

  <!-- Vertex Shader -->
  <script id="vertexShader" type="x-shader/x-vertex">
    attribute vec2 a_position;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  </script>

  <script id="fragmentShader" type="x-shader/x-fragment">
    precision mediump float;
    
    uniform vec2 u_resolution;
    uniform float u_time;
    
    vec3 gernetVeilGradient(float x) {
      vec3 dark = vec3(0.168, 0.047, 0.055);  // #2B0C0E
      vec3 mid  = vec3(0.478, 0.176, 0.208);  // #7A2D35
      vec3 light = vec3(0.769, 0.396, 0.396); // #C46565

      if (x < 0.5) {
        float t = smoothstep(0.0, 0.5, x);
        return mix(dark, mid, t);
      } else {
        float t = smoothstep(0.5, 1.0, x);
        return mix(mid, light, t);
      }
    }

    void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    float offset = sin(u_time * 0.1) * 0.03;
    float x = clamp(st.x + offset, 0.0, 1.0);
    vec3 color = gernetVeilGradient(x);
    gl_FragColor = vec4(color, 1.0);
    }
  </script>


  <script>
    const canvas = document.getElementById('shaderCanvas');
    const gl = canvas.getContext('webgl');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    function compileShader(id, type) {
      const shaderScript = document.getElementById(id);
      const shader = gl.createShader(type);
      gl.shaderSource(shader, shaderScript.text);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        return null;
      }
      return shader;
    }

    const vertexShader = compileShader('vertexShader', gl.VERTEX_SHADER);
    const fragmentShader = compileShader('fragmentShader', gl.FRAGMENT_SHADER);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const timeLocation = gl.getUniformLocation(program, 'u_time');

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1,
      ]),
      gl.STATIC_DRAW
    );

    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

    let startTime = performance.now();

    function render(time) {
      let seconds = (time - startTime) / 1000;
      gl.uniform1f(timeLocation, seconds);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      requestAnimationFrame(render);
    }

    render();
  </script>
</body>
</html>
