function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(
      `An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`
    );
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

export function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert(
      `Unable to initialize the shader program: ${gl.getProgramInfoLog(
        shaderProgram
      )}`
    );
    return null;
  }

  const programInfo = {
    program: shaderProgram,
    attribLocations: {},
    uniformLocations: {},
  };

  const attribCount = gl.getProgramParameter(
    shaderProgram,
    gl.ACTIVE_ATTRIBUTES
  );
  for (let i = 0; i < attribCount; ++i) {
    const attrib = gl.getActiveAttrib(shaderProgram, i);
    programInfo.attribLocations[attrib.name] = gl.getAttribLocation(
      shaderProgram,
      attrib.name
    );
  }

  const uniformCount = gl.getProgramParameter(
    shaderProgram,
    gl.ACTIVE_UNIFORMS
  );
  for (let i = 0; i < uniformCount; ++i) {
    const uniform = gl.getActiveUniform(shaderProgram, i);
    programInfo.uniformLocations[uniform.name] = gl.getUniformLocation(
      shaderProgram,
      uniform.name
    );
  }

  return programInfo;
}
