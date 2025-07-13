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

    vec3 gradient(float x) {
    vec3 mint     = vec3(0.325, 0.961, 0.847); // #53f5d8
    vec3 greenish = vec3(0.302, 0.780, 0.753);
    vec3 grayish  = vec3(0.231, 0.329, 0.329);
    vec3 blackish = vec3(0.004, 0.043, 0.051); // #010b0d (your new center)

    if (x < 0.005) {
      float t = smoothstep(0.000, 0.005, x);
      return mix(mint, greenish, t);
    } else if (x < 0.05) {
      float t = smoothstep(0.005, 0.05, x);
      return mix(greenish, grayish, t);
    } else if (x < 0.5) {
      float t = smoothstep(0.05, 0.5, x);
      return mix(grayish, blackish, t);
    } else if (x < 0.95) {
      float t = smoothstep(0.5, 0.95, x);
      return mix(blackish, grayish, t);
    } else if (x < 0.995) {
      float t = smoothstep(0.95, 0.995, x);
      return mix(grayish, greenish, t);
    } else {
      float t = smoothstep(0.995, 1.0, x);
      return mix(greenish, mint, t);
    }
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
