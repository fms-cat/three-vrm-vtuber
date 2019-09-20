/* global THREE */

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
let currentVRM = undefined; // 現在使用中のvrm、update内で使えるようにするため

function initVRM( gltf ) { // モデルが読み込まれたあとの処理
  THREE.VRM.from( gltf ).then( ( vrm ) => { // gltfをvrmにする
    scene.add( vrm.scene ); // gltfのモデルをsceneに追加
    currentVRM = vrm; // currentGLTFにvrmを代入

    const head = vrm.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.Head ); // vrmの頭を参照する
    camera.position.set( 0.0, head.getWorldPosition(new THREE.Vector3()).y, 2.0 ); // カメラを頭が中心に来るように動かす
  } );
}

const loader = new THREE.GLTFLoader(); // vrmをGLTFLoaderで読み込む
loader.load( // モデルを読み込む
  'assets/three-vrm-girl.vrm', // モデルデータのURL
  ( gltf ) => { initVRM( gltf ); }, // モデルが読み込まれたあとの処理
  ( progress ) => { console.info( ( 100.0 * progress.loaded / progress.total ).toFixed( 2 ) + '% loaded' ); }, // モデル読み込みの進捗を表示
  ( error ) => { console.error( error ); } // モデル読み込み時のエラーを表示
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

  if ( currentVRM ) { // VRMが読み込まれていれば
    currentVRM.scene.rotation.y = Math.PI * Math.sin( clock.getElapsedTime() ); // VRMを回転する

    currentVRM.update( delta ); // VRMの各コンポーネントを更新
  }

  renderer.render( scene, camera );
};
update();
