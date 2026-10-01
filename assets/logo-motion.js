/* Animated logo — plays the transparent-background loop in the
   header. See README §5 "The animated logo".

   The video files are ordinary MP4s that play in every browser. Each
   holds the logo's colors in its top half and its transparency, as a
   black-and-white picture, in its bottom half. This script plays the
   video out of sight and recombines the two halves onto the <canvas>
   in the header with WebGL, frame by frame.

   - Picks the wide or the narrow (phone) file to match the layout,
     and swaps if the window crosses 684px.
   - Leaves the still logo in place for visitors with "reduce motion"
     turned on, and if WebGL isn't available.
   - Pauses while the logo is scrolled out of view.

   Note: browsers block this recombining for pages opened straight from
   the hard drive (file://), so locally you'll see the still logo. It
   animates once the site is on a web server. */
(function () {
  var wrap = document.querySelector('.logo-motion');
  var canvas = wrap && wrap.querySelector('.logo-motion__anim');
  if (!canvas) return;

  var gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false });
  if (!gl) return;

  // --- WebGL: one rectangle, sampling colors from the top half of
  // the video and transparency from the bottom half.
  function shader(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }
  var prog = gl.createProgram();
  gl.attachShader(prog, shader(gl.VERTEX_SHADER,
    'attribute vec2 p; varying vec2 uv;' +
    'void main(){ uv = vec2((p.x + 1.0) * 0.5, (1.0 - p.y) * 0.5); gl_Position = vec4(p, 0.0, 1.0); }'));
  gl.attachShader(prog, shader(gl.FRAGMENT_SHADER,
    'precision mediump float; uniform sampler2D v; varying vec2 uv;' +
    'void main(){' +
    '  vec3 c = texture2D(v, vec2(uv.x, uv.y * 0.5)).rgb;' +
    '  float a = texture2D(v, vec2(uv.x, 0.5 + uv.y * 0.5)).r;' +
    '  gl_FragColor = vec4(c * a, a);' +
    '}'));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  var tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  // --- the video, never shown itself
  var video = document.createElement('video');
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.preload = 'auto';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var wide = window.matchMedia('(min-width: 684px)');
  var inView = true;
  var broken = false;
  var looping = false;

  function draw() {
    if (broken || video.readyState < 2) return;
    try {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
    } catch (e) {
      // blocked (e.g. page opened from a local file) — keep the still
      broken = true;
      stop();
      return;
    }
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (!wrap.classList.contains('is-animating')) wrap.classList.add('is-animating');
  }

  // Redraw on every new video frame (or every screen refresh where
  // that isn't supported), only while playing.
  function tick() {
    if (!looping) return;
    draw();
    if (video.requestVideoFrameCallback) video.requestVideoFrameCallback(tick);
    else requestAnimationFrame(tick);
  }

  function stop() {
    video.pause();
    looping = false;
    wrap.classList.remove('is-animating');
  }

  function update() {
    if (broken || reduce.matches) { stop(); return; }
    var src = wide.matches ? canvas.dataset.srcWide : canvas.dataset.srcNarrow;
    if (video.getAttribute('src') !== src) {
      wrap.classList.remove('is-animating'); // show the still while the new file loads
      video.src = src;
    }
    if (inView) {
      var p = video.play();
      if (p && p.catch) p.catch(function () {});
    } else {
      video.pause();
    }
  }

  video.addEventListener('loadedmetadata', function () {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight / 2;
    gl.viewport(0, 0, canvas.width, canvas.height);
  });
  video.addEventListener('playing', function () {
    if (looping) return;
    looping = true;
    tick();
  });
  video.addEventListener('pause', function () { looping = false; });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      inView = entries[0].isIntersecting;
      update();
    }).observe(wrap);
  }

  function listen(mq) {
    if (mq.addEventListener) mq.addEventListener('change', update);
    else if (mq.addListener) mq.addListener(update);
  }
  listen(reduce);
  listen(wide);
  update();
})();
