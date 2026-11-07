/* Real-time 3D birthday cake and sunset scene. Uses Three.js from CDN. */
(() => {
  if (!window.THREE) return;
  const THREE = window.THREE;

  function rendererFor(canvas, alpha=true) {
    if (!canvas) return null;
    const renderer = new THREE.WebGLRenderer({canvas, alpha, antialias:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    return renderer;
  }
  function fit(renderer, camera, canvas, heightOverride) {
    const w = Math.max(1, canvas.clientWidth), h = heightOverride || Math.max(1, canvas.clientHeight);
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  const mat = (color, roughness=.58, metalness=0) => new THREE.MeshStandardMaterial({color, roughness, metalness});
  function addMesh(scene, geometry, material, pos, scale, cast=true, receive=true) {
    const m = new THREE.Mesh(geometry, material); m.position.set(...pos); if(scale)m.scale.set(...scale); m.castShadow=cast; m.receiveShadow=receive; scene.add(m); return m;
  }

  // Photoreal-inspired three-tier strawberry-and-vanilla cake.
  // Geometry, lighting, shadows and pointer controls are all rendered in Three.js.
  const cakeCanvas = document.getElementById('cake3d');
  if (cakeCanvas) {
    const renderer = rendererFor(cakeCanvas, true);
    renderer.setClearColor(0x000000, 0);
    if (renderer.toneMapping !== undefined) {
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.12;
    }
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, .1, 100);
    camera.position.set(5.4, 4.25, 8.6);
    camera.lookAt(0, 1.65, 0);

    scene.add(new THREE.HemisphereLight(0xfff3ed, 0x7c4855, 1.65));
    const key = new THREE.DirectionalLight(0xffe5d0, 3.2);
    key.position.set(-4.5, 8, 6); key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.left = -5; key.shadow.camera.right = 5;
    key.shadow.camera.top = 6; key.shadow.camera.bottom = -4;
    key.shadow.bias = -.00025; scene.add(key);
    const fill = new THREE.PointLight(0xffa9b7, 1.35, 16);
    fill.position.set(4, 3.1, 3.5); scene.add(fill);
    const rim = new THREE.PointLight(0xffd7a4, 1.8, 14);
    rim.position.set(-3, 4.5, -4); scene.add(rim);

    const physical = (color, roughness=.42, metalness=0, extra={}) =>
      new THREE.MeshPhysicalMaterial({color, roughness, metalness, clearcoat:.32, clearcoatRoughness:.24, ...extra});
    const sponge = physical('#d99a55', .72);
    const spongeLight = physical('#f1c17e', .66);
    const jam = physical('#a92749', .24, 0, {clearcoat:.85, clearcoatRoughness:.12});
    const strawberryGlaze = physical('#d94b68', .2, 0, {clearcoat:1, clearcoatRoughness:.1});
    const pinkIcing = physical('#f5b9c5', .25, 0, {clearcoat:.82, clearcoatRoughness:.18});
    const vanilla = physical('#fff0dc', .3, 0, {clearcoat:.55, clearcoatRoughness:.2});
    const pearl = physical('#fff9ed', .18, .12, {clearcoat:1});
    const gold = physical('#d5a45d', .22, .68);
    const leafMat = physical('#477b4d', .58);
    const berrySkin = physical('#c72f4d', .24, 0, {clearcoat:.95, clearcoatRoughness:.13});

    const cakeRoot = new THREE.Group();
    const spinGroup = new THREE.Group();
    cakeRoot.add(spinGroup); scene.add(cakeRoot);

    function mesh(geometry, material, parent, position, scale, cast=true, receive=true) {
      const object = new THREE.Mesh(geometry, material);
      if (position) object.position.set(position[0], position[1], position[2]);
      if (scale) object.scale.set(scale[0], scale[1], scale[2]);
      object.castShadow = cast; object.receiveShadow = receive;
      parent.add(object); return object;
    }
    function cylinder(parent, rt, rb, h, material, x, y, z, segments=96) {
      return mesh(new THREE.CylinderGeometry(rt, rb, h, segments, 2), material, parent, [x,y,z]);
    }
    function torus(parent, radius, tube, material, x, y, z, rx=0) {
      const o=mesh(new THREE.TorusGeometry(radius,tube,12,96),material,parent,[x,y,z]);
      o.rotation.x=rx; return o;
    }

    // Porcelain cake stand, gold rim and soft contact shadow.
    cylinder(spinGroup,2.28,2.38,.16,physical('#fff9f2',.2,.08),0,.12,0,128);
    torus(spinGroup,2.26,.045,gold,0,.205,0);
    cylinder(spinGroup,.42,.48,.12,physical('#e8d4cc',.25,.18),0,.025,0,64);
    const shadowMat = new THREE.ShadowMaterial({opacity:.17});
    const shadowPlane = mesh(new THREE.PlaneGeometry(7,7),shadowMat,scene,[0,.025,0],null,false,true);
    shadowPlane.rotation.x=-Math.PI/2;

    // Three substantial tiers, each with distinct golden sponge and strawberry filling.
    const tiers = [
      {r:1.68,h:.82,y:.68},
      {r:1.29,h:.76,y:1.43},
      {r:.91,h:.70,y:2.12}
    ];
    const cakeParts=[];
    tiers.forEach((tier,index)=>{
      const {r,h,y}=tier;
      // Two sponge layers separated by a glossy strawberry preserve seam.
      cylinder(spinGroup,r*.985,r,h*.43,sponge,0,y-h*.035,0);
      cylinder(spinGroup,r*.985,r*.99,h*.43,spongeLight,0,y+h*.405,0);
      cylinder(spinGroup,r*1.002,r*1.002,.075,jam,0,y+h*.185,0);
      torus(spinGroup,r*1.028,.035,jam,0,y+h*.185,0);
      torus(spinGroup,r*1.03,.018,spongeLight,0,y-h*.035,0);
      // Smooth fondant coat and a softly rounded top cap.
      cylinder(spinGroup,r*1.025,r*1.025,h*.92,pinkIcing,0,y,0);
      cylinder(spinGroup,r*1.025,r*1.025,.075,vanilla,0,y+h*.475,0);
      torus(spinGroup,r*1.01,.045,vanilla,0,y-h*.43,0);
      // Natural-looking icing drips around the outer rim.
      const dripCount=index===0?22:index===1?18:14;
      for(let j=0;j<dripCount;j++){
        const a=j/dripCount*Math.PI*2 + (index%2)*.09;
        const rr=r*1.018;
        const length=.12+(.5+.5*Math.sin(j*2.37+index))*((index===0)?.2:.14);
        const drip=mesh(new THREE.SphereGeometry(1,20,16),vanilla,spinGroup,
          [Math.cos(a)*rr,y+h*.43-length*.34,Math.sin(a)*rr],
          [.075,length,.075]);
        drip.rotation.z=Math.cos(a)*.08; drip.rotation.x=Math.sin(a)*.08;
      }
      // Fine piped pearl border, evenly spaced around each tier.
      const beadCount=Math.round(r*34);
      for(let j=0;j<beadCount;j++){
        const a=j/beadCount*Math.PI*2, rr=r*1.027;
        mesh(new THREE.SphereGeometry(.035,12,10),pearl,spinGroup,
          [Math.cos(a)*rr,y+h*.39,Math.sin(a)*rr],[1,1,1],false,false);
      }
      cakeParts.push({r,h,y});
    });

    // Piped vanilla rosettes: curved cream ribbons with a small peak at each end.
    function creamRosette(x,z,y,size=.16,phase=0){
      const points=[];
      for(let i=0;i<=48;i++){
        const t=i/48*Math.PI*2*1.45;
        const rad=size*(.22+.78*i/48);
        points.push(new THREE.Vector3(x+Math.cos(t+phase)*rad,y+(i/48)*size*.42,z+Math.sin(t+phase)*rad));
      }
      const curve=new THREE.CatmullRomCurve3(points);
      const tube=mesh(new THREE.TubeGeometry(curve,64,size*.22,10,false),vanilla,spinGroup,null,null);
      tube.castShadow=true;
      mesh(new THREE.SphereGeometry(size*.22,16,12),vanilla,spinGroup,
        [x,y+size*.42,z],[1,1,1],true,false);
    }
    const topY=2.12+.70*.5+.09;
    for(let i=0;i<10;i++){
      const a=i/10*Math.PI*2, r=.68;
      creamRosette(Math.cos(a)*r,Math.sin(a)*r,topY,.19,a);
    }
    // A ring of tiny pearls and gold leaf flecks on the upper tier.
    for(let i=0;i<24;i++){
      const a=i/24*Math.PI*2, r=.84;
      mesh(new THREE.SphereGeometry(.027,12,10),gold,spinGroup,
        [Math.cos(a)*r,topY+.015,Math.sin(a)*r],[1,1,1],false,false);
    }

    // Real strawberry form with tapered body, green calyx and individually modelled seeds.
    function makeStrawberry(x,z,y,size=1,rotation=0){
      const group=new THREE.Group(); group.position.set(x,y,z); group.rotation.y=rotation; group.scale.setScalar(size); spinGroup.add(group);
      const profile=[new THREE.Vector2(0,-.24),new THREE.Vector2(.12,-.22),new THREE.Vector2(.2,-.12),new THREE.Vector2(.205,.02),new THREE.Vector2(.16,.16),new THREE.Vector2(.08,.23),new THREE.Vector2(0,.25)];
      const body=mesh(new THREE.LatheGeometry(profile,32),berrySkin,group,[0,0,0],[1,1,1]);
      // Tiny recessed-looking golden seed drops following the berry surface.
      for(let row=0;row<4;row++){
        const yy=-.13+row*.085, count=row===0?5:7;
        for(let j=0;j<count;j++){
          const a=j/count*Math.PI*2+(row%2)*.24;
          const radius=.18*Math.sqrt(Math.max(.1,1-Math.pow((yy+.01)/.27,2)));
          mesh(new THREE.SphereGeometry(.012,8,6),gold,group,
            [Math.cos(a)*radius,yy,Math.sin(a)*radius],[.65,1.25,.65],false,false);
        }
      }
      for(let k=0;k<6;k++){
        const a=k/6*Math.PI*2;
        const leaf=mesh(new THREE.ConeGeometry(.045,.18,7),leafMat,group,
          [Math.cos(a)*.07,.22,Math.sin(a)*.07],[1,1,.65],false,false);
        leaf.rotation.z=Math.cos(a)*.65; leaf.rotation.x=Math.sin(a)*.65;
      }
      return group;
    }
    makeStrawberry(-.29,.02,topY+.16,.82,.4);
    makeStrawberry(.27,.12,topY+.14,.72,2.1);
    makeStrawberry(.02,-.34,topY+.12,.66,4.2);
    // Smaller berries nestled on the middle tier.
    for(let i=0;i<6;i++){
      const a=i/6*Math.PI*2;
      makeStrawberry(Math.cos(a)*1.12,Math.sin(a)*1.12,1.78,.34,a);
    }

    // Three striped wax candles with layered flame meshes and warm point-light glow.
    const candles=[];
    const candlePositions=[[-.34,-.08],[.34,-.08],[0,.34]];
    candlePositions.forEach((p,i)=>{
      const x=p[0],z=p[1], y=topY+.12;
      cylinder(spinGroup,.052,.058,.48,physical('#fff7ed',.28),x,y+.24,z,24);
      // Fine spiral stripe winding around each wax candle.
      const stripePoints=[];
      for(let k=0;k<=70;k++){
        const t=k/70, a=t*Math.PI*5;
        stripePoints.push(new THREE.Vector3(x+Math.cos(a)*.055,y+.02+t*.44,z+Math.sin(a)*.055));
      }
      mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(stripePoints),90,.009,6,false),
        physical(i===1?'#df879b':'#d9ad72',.34),spinGroup,null,null,false,false);
      const flameGroup=new THREE.Group(); flameGroup.position.set(x,y+.52,z); spinGroup.add(flameGroup);
      mesh(new THREE.SphereGeometry(.075,20,16),new THREE.MeshBasicMaterial({color:'#ff8c39'}),flameGroup,[0,.065,0],[.7,1.55,.7],false,false);
      mesh(new THREE.SphereGeometry(.045,18,14),new THREE.MeshBasicMaterial({color:'#fff2ae'}),flameGroup,[0,.055,.012],[.65,1.4,.65],false,false);
      const light=new THREE.PointLight(0xffa64a,.85,2.6);light.position.set(0,.12,.02);flameGroup.add(light);
      candles.push({flameGroup,light,phase:i*1.7});
    });
    window.extinguishCakeCandle=()=>candles.forEach(c=>{c.flameGroup.visible=false;c.light.intensity=0;});

    // Floating sugar sparkle motes around the cake, not emoji or flat symbols.
    const sparkleMat=new THREE.MeshBasicMaterial({color:'#ffe6ad',transparent:true,opacity:.8,depthWrite:false});
    const sparkles=[];
    for(let i=0;i<34;i++){
      const a=Math.random()*Math.PI*2, r=2.0+Math.random()*.75;
      const s=mesh(new THREE.OctahedronGeometry(.025+Math.random()*.025,0),sparkleMat,scene,
        [Math.cos(a)*r,.65+Math.random()*2.8,Math.sin(a)*r],[1,1,1],false,false);
      sparkles.push({object:s,phase:Math.random()*Math.PI*2,baseY:s.position.y});
    }

    // Pointer drag rotates the cake through a full 360 degrees on mouse and touch.
    let dragging=false,lastX=0,lastY=0,velocity=0,tilt=0;
    cakeCanvas.style.cursor='grab';
    cakeCanvas.addEventListener('pointerdown',e=>{
      dragging=true;lastX=e.clientX;lastY=e.clientY;cakeCanvas.setPointerCapture(e.pointerId);
      cakeCanvas.style.cursor='grabbing';
    });
    cakeCanvas.addEventListener('pointermove',e=>{
      if(!dragging)return;
      const dx=e.clientX-lastX,dy=e.clientY-lastY;
      spinGroup.rotation.y+=dx*.012;
      tilt=THREE.MathUtils.clamp(tilt+dy*.003,-.22,.22);
      velocity=dx*.0018;lastX=e.clientX;lastY=e.clientY;
    });
    const stopDrag=()=>{dragging=false;cakeCanvas.style.cursor='grab';};
    cakeCanvas.addEventListener('pointerup',stopDrag);
    cakeCanvas.addEventListener('pointercancel',stopDrag);
    cakeCanvas.addEventListener('lostpointercapture',stopDrag);

    let time=0;
    function animateCake(){
      requestAnimationFrame(animateCake);time+=.012;
      if(!dragging){spinGroup.rotation.y+=velocity;velocity*=.96;}
      cakeRoot.position.y=Math.sin(time*1.25)*.055;
      cakeRoot.rotation.z=Math.sin(time*.55)*.012;
      spinGroup.rotation.x=tilt;
      candles.forEach(c=>{
        const flicker=1+Math.sin(time*17+c.phase)*.12+Math.sin(time*29+c.phase)*.05;
        c.flameGroup.scale.set(.94+Math.sin(time*13+c.phase)*.07,flicker,1);
        c.flameGroup.rotation.z=Math.sin(time*8+c.phase)*.09;
        c.light.intensity=.72+Math.sin(time*18+c.phase)*.18;
      });
      sparkles.forEach(s=>{s.object.position.y=s.baseY+Math.sin(time*1.5+s.phase)*.12;s.object.rotation.y+=.012;s.object.material.opacity=.45+.45*(.5+.5*Math.sin(time*2+s.phase));});
      fit(renderer,camera,cakeCanvas);
      renderer.render(scene,camera);
    }
    animateCake();
  }

  // A warm, gently animated 3D sunset scene: layered hills, glowing sun, trees and a little tea table.
  const sunsetCanvas = document.getElementById('sunset3d');
  if (sunsetCanvas) {
    const renderer=rendererFor(sunsetCanvas,false);
    const scene=new THREE.Scene();
    scene.background=new THREE.Color('#f4a06b');
    scene.fog=new THREE.Fog('#e68c78',12,34);
    const camera=new THREE.PerspectiveCamera(43,1,.1,100);camera.position.set(0,4.4,13);camera.lookAt(0,1.8,0);
    scene.add(new THREE.HemisphereLight(0xffe8d4,0x40334c,1.9));
    const sunLight=new THREE.DirectionalLight(0xffc18e,2.5);sunLight.position.set(-5,8,5);sunLight.castShadow=true;sunLight.shadow.mapSize.set(1024,1024);scene.add(sunLight);
    const sun=addMesh(scene,new THREE.SphereGeometry(1.45,48,32),new THREE.MeshBasicMaterial({color:'#ffe0a2'}),[-4.4,4.2,-9],[1,1,1],false,false);
    const halo=addMesh(scene,new THREE.SphereGeometry(1.9,40,28),new THREE.MeshBasicMaterial({color:'#ffd5a0',transparent:true,opacity:.18,depthWrite:false}),[-4.4,4.2,-9],[1,1,1],false,false);
    // soft sky gradient plane
    const skyGeo=new THREE.PlaneGeometry(60,35);
    const skyMat=new THREE.ShaderMaterial({side:THREE.DoubleSide,depthWrite:false,vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'varying vec2 vUv; void main(){vec3 top=vec3(0.28,0.25,0.43);vec3 mid=vec3(0.91,0.48,0.43);vec3 low=vec3(1.0,0.72,0.49);vec3 c=mix(low,mid,smoothstep(0.0,0.58,vUv.y));c=mix(c,top,smoothstep(0.55,1.0,vUv.y));gl_FragColor=vec4(c,1.0);}'});
    const sky=new THREE.Mesh(skyGeo,skyMat);sky.position.set(0,9,-18);scene.add(sky);
    const ground=addMesh(scene,new THREE.PlaneGeometry(80,80),mat('#57465c'),[0,-.08,0],[1,1,1],false,true);ground.rotation.x=-Math.PI/2;
    function hill(x,y,z,sx,sy,sz,color){return addMesh(scene,new THREE.SphereGeometry(1,48,32),mat(color),[x,y,z],[sx,sy,sz],true,true);}
    hill(-8,1.1,-7,8,2.4,2.4,'#a95f69');hill(1,1.2,-8,9,2.6,2.8,'#86546c');hill(9,1.0,-9,8,2.2,2.5,'#694b66');hill(-1,.35,-3,13,1.3,3.5,'#5b4b62');
    // Curved low-poly trees, kept in silhouette against the sunset
    const trunk=mat('#493b4d'), foliage=mat('#55445d');
    function tree(x,z,h=2.2){addMesh(scene,new THREE.CylinderGeometry(.09,.15,h*.55,8),trunk,[x,h*.28,z]);for(let i=0;i<3;i++)addMesh(scene,new THREE.IcosahedronGeometry(.58-i*.08,1),foliage,[x+(i-1)*.22,h*.53+i*.3,z],[1.05,1.05,1.05]);}
    tree(-6,-1,2.8);tree(6,-2,2.5);tree(8,0,2.1);tree(-8,1,2.2);
    // Cozy two-seat bench/sofa in the foreground
    const sofaMat=mat('#b8757e'), cushion=mat('#e6b0a7'), wood=mat('#74505a');
    addMesh(scene,new THREE.BoxGeometry(4.2,.42,1.15),sofaMat,[.2,.9,2.1],[1,1,1]);
    addMesh(scene,new THREE.BoxGeometry(4.2,1.15,.28),sofaMat,[.2,1.55,2.62],[1,1,1]);
    for(let x=-1.25;x<=1.7;x+=2.9)addMesh(scene,new THREE.BoxGeometry(.28,1.1,1.05),sofaMat,[x,1.35,2.1]);
    addMesh(scene,new THREE.BoxGeometry(1.7,.2,.8),cushion,[-.8,1.2,2.0]);addMesh(scene,new THREE.BoxGeometry(1.7,.2,.8),cushion,[1.1,1.2,2.0]);
    // Round side table with two little cups
    addMesh(scene,new THREE.CylinderGeometry(.66,.72,.12,32),wood,[3.1,.95,1.5]);addMesh(scene,new THREE.CylinderGeometry(.09,.12,.9,16),wood,[3.1,.48,1.5]);
    function cup(x,z){addMesh(scene,new THREE.CylinderGeometry(.16,.13,.28,24),mat('#fff0df'),[x,1.15,z]);const ring=addMesh(scene,new THREE.TorusGeometry(.16,.035,8,24),mat('#d6a58f'),[x,1.29,z]);ring.rotation.x=Math.PI/2;addMesh(scene,new THREE.TorusGeometry(.105,.028,8,20),mat('#fff0df'),[x+.18,1.17,z],[1,1,1]);}
    cup(2.9,1.5);cup(3.35,1.5);
    // Small warm lanterns along the edge
    for(let i=0;i<5;i++){const x=-4+i*2;addMesh(scene,new THREE.SphereGeometry(.07,12,10),new THREE.MeshBasicMaterial({color:'#ffd59b'}),[x,2.5+Math.sin(i)*.18,1.0]);}
    let t=0;
    function animate(){requestAnimationFrame(animate);t+=.006;sun.position.y=4.2+Math.sin(t)*.08;halo.position.y=sun.position.y;camera.position.x=Math.sin(t*.28)*.22;camera.lookAt(0,1.8,0);fit(renderer,camera,sunsetCanvas);renderer.render(scene,camera);}
    animate();
  }
})();
