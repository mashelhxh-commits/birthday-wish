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

  // A hand-finished, three-tier strawberry-cream cake with real 3D depth and lighting.
  const cakeCanvas = document.getElementById('cake3d');
  if (cakeCanvas) {
    const renderer = rendererFor(cakeCanvas, true);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, .1, 100);
    camera.position.set(5.5, 4.1, 8.6); camera.lookAt(0, 1.15, 0);
    scene.add(new THREE.HemisphereLight(0xfff2e8, 0x8d5264, 2.0));
    const key = new THREE.DirectionalLight(0xffe2c5, 3.1); key.position.set(-4, 8, 6); key.castShadow=true; key.shadow.mapSize.set(1024,1024); scene.add(key);
    const fill = new THREE.PointLight(0xff9eae, 1.2, 18); fill.position.set(4,3,2); scene.add(fill);
    const pink = mat('#e99aaa'), pale = mat('#ffe0df'), cream = mat('#fff0e7'), berry = mat('#c94f68',.36), leaf = mat('#668f63');
    const plate = addMesh(scene,new THREE.CylinderGeometry(2.35,2.42,.16,96),mat('#fff5ef',.22,.12),[0,.12,0],[1,1,1]);
    addMesh(scene,new THREE.TorusGeometry(2.25,.055,12,96),mat('#d7b6a8',.3,.25),[0,.205,0],[1,1,1]);
    const tiers=[{r:1.75,h:.82,y:.67},{r:1.32,h:.78,y:1.42},{r:.91,h:.72,y:2.12}];
    tiers.forEach((tier,i)=>{
      addMesh(scene,new THREE.CylinderGeometry(tier.r*.98,tier.r,tier.h,96,1,false),pink,[0,tier.y,0]);
      addMesh(scene,new THREE.CylinderGeometry(tier.r*1.005,tier.r*1.005,.13,96),pale,[0,tier.y+tier.h/2-.025,0]);
      addMesh(scene,new THREE.TorusGeometry(tier.r*.985,.045,12,96),cream,[0,tier.y-tier.h/2+.09,0],[1,1,1]);
      // Small piped cream pearls around each tier
      const count= Math.round(tier.r*25);
      for(let j=0;j<count;j++){
        const a=j/count*Math.PI*2;
        addMesh(scene,new THREE.SphereGeometry(.055,12,10),cream,[Math.cos(a)*(tier.r+.012),tier.y-tier.h/2+.13,Math.sin(a)*(tier.r+.012)],[1,1,1],false,false);
      }
    });
    // Frosting drips, piped rosettes and strawberries around the top
    for(let i=0;i<15;i++){
      const a=i/15*Math.PI*2, r=1.72;
      const drip=addMesh(scene,new THREE.SphereGeometry(.105,16,12),pale,[Math.cos(a)*r,.98,Math.sin(a)*r],[.72,1.9,.72],false,false);
    }
    for(let i=0;i<8;i++){
      const a=i/8*Math.PI*2, r=.67;
      addMesh(scene,new THREE.TorusGeometry(.13,.045,10,24),cream,[Math.cos(a)*r,2.56,Math.sin(a)*r],[1,1,1],false,false);
    }
    function strawberry(x,z,s=1){
      const g=new THREE.SphereGeometry(.19,20,16); const m=addMesh(scene,g,berry,[x,2.62,z],[.82*s,1.18*s,.82*s]);
      m.rotation.z=-.22;
      const crown=addMesh(scene,new THREE.ConeGeometry(.15,.16,5),leaf,[x,2.84*s,z],[1,1,1],false,false); crown.rotation.y=.4;
      for(let k=0;k<5;k++){const a=k/5*Math.PI*2;addMesh(scene,new THREE.SphereGeometry(.018,8,8),mat('#ffe2a7'),[x+Math.cos(a)*.11,2.63+Math.sin(a)*.09,z+.11],[1,1,1],false,false);}
    }
    strawberry(-.34,.04,.9); strawberry(.25,.12,.72); strawberry(.05,-.38,.66);
    // Candle and golden flame
    addMesh(scene,new THREE.CylinderGeometry(.055,.065,.55,20),mat('#fff9ef'),[0,3.02,0]);
    const stripe=addMesh(scene,new THREE.CylinderGeometry(.058,.067,.56,20),new THREE.MeshStandardMaterial({color:'#d78b9b',roughness:.5}),[0,3.02,0]);
    const flameMat=new THREE.MeshBasicMaterial({color:0xffb54e});
    const flame=addMesh(scene,new THREE.SphereGeometry(.105,20,16),flameMat,[0,3.38,0],[.68,1.5,.68],false,false);
    const flameGlow=new THREE.PointLight(0xffa94e,1.5,3);flameGlow.position.set(0,3.4,0);scene.add(flameGlow);
    const base=addMesh(scene,new THREE.CylinderGeometry(.12,.16,.12,24),mat('#f2c8cf'),[0,2.76,0]);
    const cakeGroup={flame,flameGlow,scene,camera,renderer,canvas:cakeCanvas,base};
    window.extinguishCakeCandle=()=>{flame.visible=false;flameGlow.intensity=0;};
    let t=0;
    function animate(){requestAnimationFrame(animate);t+=.012;flame.scale.y=1.5+Math.sin(t*9)*.12;flame.rotation.z=Math.sin(t*5)*.08;camera.position.x=5.5+Math.sin(t*.35)*.18;camera.lookAt(0,1.25,0);fit(renderer,camera,cakeCanvas);renderer.render(scene,camera);}
    animate();
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
