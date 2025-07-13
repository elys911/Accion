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
      vec3 greenish = vec3(0.302, 0.780, 0.753); // #4de0cc
      vec3 teal     = vec3(0.231, 0.718, 0.690); // #3bb7b0
      vec3 darkteal = vec3(0.173, 0.561, 0.588); // #2d8f96
      vec3 deepblue = vec3(0.063, 0.173, 0.286); // #102e49
      vec3 blackish = vec3(0.004, 0.043, 0.051); // #010b0d

      if (x < 0.001) {
        return mint;
      } else if (x < 0.002) {
        float t = smoothstep(0.001, 0.002, x);
        return mix(mint, greenish, t);
      } else if (x < 0.004) {
        float t = smoothstep(0.002, 0.004, x);
        return mix(greenish, teal, t);
      } else if (x < 0.007) {
        float t = smoothstep(0.004, 0.007, x);
        return mix(teal, darkteal, t);
      } else if (x < 0.015) {
        float t = smoothstep(0.007, 0.015, x);
        return mix(darkteal, deepblue, t);
      } else if (x < 0.5) {
        float t = smoothstep(0.015, 0.5, x);
        return mix(deepblue, blackish, t);
      } else if (x < 0.985) {
        float t = smoothstep(0.5, 0.985, x);
        return mix(blackish, deepblue, t);
      } else if (x < 0.993) {
        float t = smoothstep(0.985, 0.993, x);
        return mix(deepblue, darkteal, t);
      } else if (x < 0.996) {
        float t = smoothstep(0.993, 0.996, x);
        return mix(darkteal, teal, t);
      } else if (x < 0.998) {
        float t = smoothstep(0.996, 0.998, x);
        return mix(teal, greenish, t);
      } else {
        float t = smoothstep(0.998, 1.0, x);
        return mix(greenish, mint, t);
      }
    }

    void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    float offset = sin(u_time * 0.15) * 0.008;
    float x = clamp(st.x + offset, 0.0, 1.0);
    vec3 color = gradient(x);
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
