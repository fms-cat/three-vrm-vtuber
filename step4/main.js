/* global THREE, JEEFACEFILTERAPI, JeelizResizer */

const width = window.innerWidth;
const height = window.innerHeight;

// -- renderer -------------------------------------------------------------------------------------
const renderer = new THREE.WebGLRenderer();
renderer.setSize( width, height );
document.body.appendChild( renderer.domElement );

// -- camera ---------------------------------------------------------------------------------------
const camera = new THREE.PerspectiveCamera( 30.0, width / height, 0.01, 20.0 );
camera.position.set( 0.0, 0.0, 5.0 );

// -- scene ----------------------------------------------------------------------------------------
const scene = new THREE.Scene();

// -- avocado (gltf) -------------------------------------------------------------------------------
let currentVRM = undefined;

function initVRM( gltf ) {
  THREE.VRM.from( gltf ).then( ( vrm ) => {
    scene.add( vrm.scene );
    currentVRM = vrm;

    const hips = vrm.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.Hips ); // Hipsボーンを取得
    hips.rotation.y = Math.PI; // Hipsボーンを180度回転、正面を向かせる
    
    vrm.humanoid.setPose( {
      [ THREE.VRMSchema.HumanoidBoneName.LeftShoulder ]: {
        rotation: new THREE.Quaternion().setFromEuler( new THREE.Euler( 0.0, 0.0, 0.2 ) ).toArray()
      },
      [ THREE.VRMSchema.HumanoidBoneName.RightShoulder ]: {
        rotation: new THREE.Quaternion().setFromEuler( new THREE.Euler( 0.0, 0.0, -0.2 ) ).toArray()
      },
      [ THREE.VRMSchema.HumanoidBoneName.LeftUpperArm ]: {
        rotation: new THREE.Quaternion().setFromEuler( new THREE.Euler( 0.0, 0.0, 1.1 ) ).toArray()
      },
      [ THREE.VRMSchema.HumanoidBoneName.RightUpperArm ]: {
        rotation: new THREE.Quaternion().setFromEuler( new THREE.Euler( 0.0, 0.0, -1.1 ) ).toArray()
      },
      [ THREE.VRMSchema.HumanoidBoneName.LeftLowerArm ]: {
        rotation: new THREE.Quaternion().setFromEuler( new THREE.Euler( 0.0, 0.0, 0.1 ) ).toArray()
      },
      [ THREE.VRMSchema.HumanoidBoneName.RightLowerArm ]: {
        rotation: new THREE.Quaternion().setFromEuler( new THREE.Euler( 0.0, 0.0, -0.1 ) ).toArray()
      },
    } );

    const head = vrm.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.Head );
    camera.position.set( 0.0, head.getWorldPosition(new THREE.Vector3()).y, 2.0 );
    
    vrm.lookAt.target = camera; // 常にカメラ方向を向く
  } );
}

const loader = new THREE.GLTFLoader();
loader.load(
  'https://cdn.glitch.com/e9accf7e-65be-4792-8903-f44e1fc88d68%2Fthree-vrm-girl.vrm?v=1568881824654',
  ( gltf ) => { initVRM( gltf ); },
  ( progress ) => { console.info( ( 100.0 * progress.loaded / progress.total ).toFixed( 2 ) + '% loaded' ); },
  ( error ) => { console.error( error ); }
);

// -- light ----------------------------------------------------------------------------------------
const light = new THREE.DirectionalLight( 0xffffff );
light.position.set( 1.0, 1.0, 1.0 ).normalize();
scene.add( light );

// -- update ---------------------------------------------------------------------------------------
const clock = new THREE.Clock();
clock.start();

function update() {
  requestAnimationFrame( update );

  const delta = clock.getDelta();

  if ( currentVRM ) {
    currentVRM.update( delta );

    const blink = Math.max( 0.0, 1.0 - 10.0 * Math.abs( ( clock.getElapsedTime() % 4.0 ) - 2.0 ) ); // まばたきのウェイト
    currentVRM.blendShapeProxy.setValue( THREE.VRMSchema.BlendShapePresetName.Blink, blink ); // まばたきのウェイトを制御する
  }

  renderer.render( scene, camera );
};
update();

// -- mouse ----------------------------------------------------------------------------------------
renderer.domElement.addEventListener( 'mousemove', ( event ) => { // マウスイベントの取得
  if ( currentVRM ) { // もしcurrentVRMがあれば
    const x = event.clientX / renderer.domElement.clientWidth; // マウスのx位置、正規化されている
    currentVRM.blendShapeProxy.setValue( THREE.VRMSchema.BlendShapePresetName.Fun, x ); // マウスのx位置を表情に反映

    const y = event.clientY / renderer.domElement.clientHeight; // マウスのy位置、正規化されている
    currentVRM.blendShapeProxy.setValue( THREE.VRMSchema.BlendShapePresetName.Sorrow, y ); // マウスのy位置を表情に反映
  }
} );

// -- face recognition -----------------------------------------------------------------------------
const jeelizCanvas = document.createElement( 'canvas' ); // jeeliz用のキャンバスを生成

function handleJeelizReady( error, spec ) { // jeelizの初期化処理が終わった際の処理
  if ( error ) { console.error( error ); return; } // エラーが有った場合、エラーを出力
}

function handleJeelizTrack( state ) { // jeelizのトラッキング情報が取得された際の処理
  if ( currentVRM ) { // もしcurrentVRMがあれば
    const head = currentVRM.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.Head ); // VRMのHeadを取得
    head.rotation.set( -state.rx, -state.ry, state.rz, 'ZXY' ); // 頭の回転をVRMに反映

    const expressionA = state.expressions[ 0 ]; // 口の開き具合
    currentVRM.blendShapeProxy.setValue( THREE.VRMSchema.BlendShapePresetName.A, expressionA ); // 口の開き具合をVRMに反映
  }
}

function initJeeliz() {
  JEEFACEFILTERAPI.init( { // jeelizの初期化
    canvas: jeelizCanvas, // 顔認識に使うキャンバス
    NNCpath: 'https://unpkg.com/facefilter@1.1.1/dist/NNC.json', // データセットを指定
    followZRot: true, // Z回転を有効にする
    maxFacedDetected: 1, // 顔の最大認識数を指定
    callbackReady: handleJeelizReady, // 初期化処理が終わった際の処理
    callbackTrack: handleJeelizTrack // トラッキング情報が取得された際の処理
  } );
}

JeelizResizer.size_canvas( { // キャンバスを最適なサイズに調整する
  canvas: jeelizCanvas, // 顔認識に使うキャンバス
  callback: initJeeliz // キャンバスサイズ調整後の処理
} );
