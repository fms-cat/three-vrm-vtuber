/* global THREE */

const width = window.innerWidth;
const height = window.innerHeight;

// -- renderer -------------------------------------------------------------------------------------
const renderer = new THREE.WebGLRenderer(); // WebGLレンダラを作成
renderer.setSize( width, height ); // キャンバスの大きさを設定
document.body.appendChild( renderer.domElement ); // キャンバスをドキュメントに追加

// -- camera ---------------------------------------------------------------------------------------
const camera = new THREE.PerspectiveCamera( 30, width / height, 0.01, 20.0 ); // Cameraを作成
camera.position.set( 0.0, 0.0, 5.0 ); // Cameraを手前に移動

// -- scene ----------------------------------------------------------------------------------------
const scene = new THREE.Scene(); // Sceneを作成

// -- cube -----------------------------------------------------------------------------------------
const geometry = new THREE.BoxGeometry( 1.0, 1.0, 1.0 ); // 1辺が1.0の立方体のGeometry
const material = new THREE.MeshStandardMaterial( { color: 0x00ff00 } ); // 緑色のMaterial
const cube = new THREE.Mesh( geometry, material ); // geometryの形状を持ちmaterialの材質を持つものを作成
scene.add( cube ); // sceneに追加

// -- light ----------------------------------------------------------------------------------------
const light = new THREE.DirectionalLight( 0xffffff ); // 白色の平行光源
light.position.set( 1.0, 1.0, 1.0 ).normalize(); // ライトの向きを設定
scene.add( light ); // sceneに追加

// -- update　--------------------------------------------------------------------------------------　
const clock = new THREE.Clock(); // 時間を司るクロックを作成
clock.start(); // clockを開始

function update() {
  const delta = clock.getDelta(); // 前回のupdateとの差分時間を取得

  cube.rotation.y += delta; // cubeを回転する

  renderer.render( scene, camera ); // 描画する

  requestAnimationFrame( update ); // 次のフレームにもう一回updateを呼ぶ
};
update(); // updateの最初の一回を呼ぶ
