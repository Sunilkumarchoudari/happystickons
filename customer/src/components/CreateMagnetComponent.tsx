"use client";
import { useState, Suspense, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useTexture, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCurrency } from '@/context/CurrencyContext';
import Cropper from 'react-easy-crop';
import toast from 'react-hot-toast';

const getHeartShape = () => {
  const shape = new THREE.Shape();
  // Original right-side up coordinates: lobes at top (Y > 0), tip at bottom (Y = -1.6).
  shape.moveTo(0, 0.5);
  shape.bezierCurveTo(0.5, 1.2, 1.5, 1.2, 1.5, 0.4);
  shape.bezierCurveTo(1.5, -0.4, 0.7, -1.0, 0, -1.6);
  shape.bezierCurveTo(-0.7, -1.0, -1.5, -0.4, -1.5, 0.4);
  shape.bezierCurveTo(-1.5, 1.2, -0.5, 1.2, 0, 0.5);
  return shape;
};

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    if (!url.startsWith('data:') && !url.startsWith('blob:')) {
      image.crossOrigin = 'anonymous';
    }
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

const getRadianAngle = (degreeValue: number) => {
  return (degreeValue * Math.PI) / 180;
};

const rotateSize = (width: number, height: number, rotation: number) => {
  const rotRad = (rotation * Math.PI) / 180;
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
};

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: any,
  rotation = 0,
  brightness = 1,
  contrast = 1
): Promise<string | null> {
  const image = await createImage(imageSrc);
  let workingImage = image;
  let scaleX = 1;
  let scaleY = 1;
  const MAX_IMAGE_SIZE = 2048;
  
  if (image.width > MAX_IMAGE_SIZE || image.height > MAX_IMAGE_SIZE) {
    const scale = Math.min(MAX_IMAGE_SIZE / image.width, MAX_IMAGE_SIZE / image.height);
    const resizeCanvas = document.createElement('canvas');
    resizeCanvas.width = Math.ceil(image.width * scale);
    resizeCanvas.height = Math.ceil(image.height * scale);
    const resizeCtx = resizeCanvas.getContext('2d');
    if (resizeCtx) {
      resizeCtx.drawImage(image, 0, 0, resizeCanvas.width, resizeCanvas.height);
      const resizedImg = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = resizeCanvas.toDataURL('image/jpeg', 0.9);
      });
      workingImage = resizedImg;
      scaleX = resizeCanvas.width / image.width;
      scaleY = resizeCanvas.height / image.height;
    }
  }

  const scaledPixelCrop = {
    x: pixelCrop.x * scaleX,
    y: pixelCrop.y * scaleY,
    width: pixelCrop.width * scaleX,
    height: pixelCrop.height * scaleY
  };

  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(workingImage.width, workingImage.height, rotation);
  const bBoxCanvas = document.createElement('canvas');
  bBoxCanvas.width = bBoxWidth;
  bBoxCanvas.height = bBoxHeight;
  const bBoxCtx = bBoxCanvas.getContext('2d');
  if (!bBoxCtx) return null;

  bBoxCtx.translate(bBoxWidth / 2, bBoxHeight / 2);
  bBoxCtx.rotate(getRadianAngle(rotation));
  bBoxCtx.translate(-workingImage.width / 2, -workingImage.height / 2);
  bBoxCtx.filter = `brightness(${brightness}) contrast(${contrast})`;
  bBoxCtx.drawImage(workingImage, 0, 0);

  let finalWidth = Math.ceil(scaledPixelCrop.width);
  let finalHeight = Math.ceil(scaledPixelCrop.height);
  const MAX_SIZE = 800;
  if (finalWidth > MAX_SIZE || finalHeight > MAX_SIZE) {
    const scale = Math.min(MAX_SIZE / finalWidth, MAX_SIZE / finalHeight);
    finalWidth = Math.ceil(finalWidth * scale);
    finalHeight = Math.ceil(finalHeight * scale);
  }

  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = finalWidth;
  finalCanvas.height = finalHeight;
  const finalCtx = finalCanvas.getContext('2d');
  finalCtx?.drawImage(
    bBoxCanvas,
    Math.round(scaledPixelCrop.x),
    Math.round(scaledPixelCrop.y),
    Math.round(scaledPixelCrop.width),
    Math.round(scaledPixelCrop.height),
    0, 0, finalWidth, finalHeight
  );

  return new Promise((resolve) => {
    finalCanvas.toBlob((blob) => {
      if (blob) {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => resolve(reader.result as string);
      } else {
        resolve(null);
      }
    }, 'image/jpeg', 0.85);
  });
}

function MagnetModel({ textureUrl, shape }: { textureUrl: string; shape: string }) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (!textureUrl) return;
    const loader = new THREE.TextureLoader();
    if (!textureUrl.startsWith('data:') && !textureUrl.startsWith('blob:')) {
      loader.setCrossOrigin('anonymous');
    }
    let isMounted = true;
    loader.load(
      textureUrl,
      (tex) => {
        if (isMounted) {
          tex.colorSpace = THREE.SRGBColorSpace;
          if (shape === 'Round') {
            tex.center.set(0.5, 0.5);
            tex.rotation = -Math.PI / 2; // Rotate 90 degrees clockwise to align right-side up
          }
          setTexture(tex);
        }
      },
      undefined,
      (err) => {
        console.error('Failed to load texture:', err);
      }
    );
    return () => {
      isMounted = false;
    };
  }, [textureUrl, shape]);

  const materialProps = {
    roughness: 0.25,
    metalness: 0.0,
  };

  if (shape === 'Square') {
    return (
      <mesh castShadow receiveShadow>
        <boxGeometry args={[3, 3, 0.2]} />
        <meshStandardMaterial attach="material-0" color="#ffffff" {...materialProps} />
        <meshStandardMaterial attach="material-1" color="#ffffff" {...materialProps} />
        <meshStandardMaterial attach="material-2" color="#ffffff" {...materialProps} />
        <meshStandardMaterial attach="material-3" color="#ffffff" {...materialProps} />
        <meshBasicMaterial attach="material-4" map={texture || undefined} />
        <meshStandardMaterial attach="material-5" color="#111111" roughness={0.8} />
      </mesh>
    );
  } else if (shape === 'Polaroid') {
     return (
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.5, 3.5, 0.2]} />
        <meshStandardMaterial attach="material-0" color="#ffffff" {...materialProps} />
        <meshStandardMaterial attach="material-1" color="#ffffff" {...materialProps} />
        <meshStandardMaterial attach="material-2" color="#ffffff" {...materialProps} />
        <meshStandardMaterial attach="material-3" color="#ffffff" {...materialProps} />
        <meshBasicMaterial attach="material-4" map={texture || undefined} />
        <meshStandardMaterial attach="material-5" color="#111111" roughness={0.8} />
      </mesh>
    );
  } else if (shape === 'Heart') {
    const heartShape = getHeartShape();
    return (
      <mesh castShadow receiveShadow scale={[1.2, 1.2, 1.2]} rotation={[0, 0, 0]}>
        <extrudeGeometry args={[heartShape, { depth: 0.2, bevelEnabled: true, bevelSegments: 5, steps: 1, bevelSize: 0.05, bevelThickness: 0.05 }]} />
        <meshBasicMaterial attach="material-0" map={texture || undefined} />
        <meshStandardMaterial attach="material-1" color="#ffffff" {...materialProps} />
      </mesh>
    );
  }

  return (
    <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[1.5, 1.5, 0.2, 64]} />
      <meshStandardMaterial attach="material-0" color="#111111" roughness={0.8} />
      <meshBasicMaterial attach="material-1" map={texture || undefined} />
      <meshStandardMaterial attach="material-2" color="#ffffff" {...materialProps} />
    </mesh>
  );
}

const shapesList = ['Square', 'Round', 'Polaroid', 'Heart'];

export default function CreateMagnet() {
  const { formatPrice } = useCurrency();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const initialShapeQuery = searchParams ? searchParams.get('shape') : null;
  const getNormalizedShape = (q: string | null) => {
    if (!q) return 'Square';
    const lower = q.toLowerCase();
    if (lower === 'round') return 'Round';
    if (lower === 'polaroid') return 'Polaroid';
    if (lower === 'heart') return 'Heart';
    return 'Square';
  };

  const [activeShape, setActiveShape] = useState<string>(() => getNormalizedShape(initialShapeQuery));
  const [photo, setPhoto] = useState<string | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [originalPhotoSrc, setOriginalPhotoSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(1);
  const [contrast, setContrast] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const [largePreviewShape, setLargePreviewShape] = useState<string | null>(null);

  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  // Load products dynamically from database
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProducts(data);
        }
      })
      .catch(err => console.error('Failed to fetch products', err));
  }, []);

  const getNormalizedShapeName = (s: string) => {
    if (!s) return '';
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  };

  // Derive shape list from active products, fallback to default shapes
  const dynamicShapesList = products.length > 0 
    ? Array.from(new Set(products.map(p => getNormalizedShapeName(p.shape))))
    : ['Square', 'Round', 'Polaroid', 'Heart'];

  // Calculate dynamic base price for the selected active shape
  const activeProduct = products.find(p => getNormalizedShapeName(p.shape) === activeShape);
  const basePrice = activeProduct && activeProduct.sizeOptions?.length > 0
    ? activeProduct.sizeOptions[0].price
    : 4.99;

  // Toggle modal-open class on body when large preview is active to fix navbar stacking/zIndex issues
  useEffect(() => {
    if (largePreviewShape) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [largePreviewShape]);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('happy_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart', e);
      }
    }
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setCropSrc(url);
      setOriginalPhotoSrc(url);
      setPhoto(null);
    }
  };

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const applyCrop = async () => {
    if (!cropSrc || !croppedAreaPixels) return;
    const croppedImage = await getCroppedImg(cropSrc, croppedAreaPixels, rotation, brightness, contrast);
    if (croppedImage) {
      setPhoto(croppedImage);
      setCropSrc(null);
    }
  };

  const addToCart = (shape: string) => {
    if (photo) {
      const newCart = [...cart, { photo, shape, quantity, price: basePrice }];
      setCart(newCart);
      localStorage.setItem('happy_cart', JSON.stringify(newCart));
      setQuantity(1);
      toast.success(`${shape} Magnet added to cart!`);
    }
  };

  const removeFromCart = (indexToRemove: number) => {
    const newCart = cart.filter((_, idx) => idx !== indexToRemove);
    setCart(newCart);
    localStorage.setItem('happy_cart', JSON.stringify(newCart));
    toast.success('Item removed from cart');
  };

  const handleCheckout = () => {
    const token = localStorage.getItem('customerToken');
    if (token) {
      router.push('/checkout');
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="container" style={{ position: 'relative', zIndex: 10 }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '3rem', color: 'var(--primary)', textShadow: '2px 2px 4px rgba(255,255,255,0.6)', fontFamily: 'var(--font-comfortaa), sans-serif' }}>✨ Design Your Magnets</h1>
      
      <div style={{ display: (!photo && !cropSrc) ? 'block' : 'none' }}>
        <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', background: 'rgba(236,231,218,0.9)' }}>
          <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)', fontFamily: 'var(--font-comfortaa), sans-serif' }}>Start by Uploading a Photo</h2>
          <label style={{ display: 'block', padding: '40px', border: '3px dashed var(--secondary)', borderRadius: '20px', cursor: 'pointer', background: 'rgba(255,255,255,0.5)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📸</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--secondary)' }}>Click to upload an image</div>
            <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      <div style={{ display: cropSrc ? 'block' : 'none' }}>
        {cropSrc && (
          <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', background: '#fff' }}>
            <h2 style={{ color: 'var(--primary)', marginBottom: '1rem', fontFamily: 'var(--font-comfortaa), sans-serif' }}>Crop Your Photo</h2>
            <p style={{ color: 'var(--secondary)', marginBottom: '2rem' }}>Drag and zoom to select the perfect frame for your magnets.</p>
            <div style={{ position: 'relative', width: '100%', height: '400px', background: '#333', marginBottom: '2rem', borderRadius: '10px', overflow: 'hidden', filter: `brightness(${brightness}) contrast(${contrast})`, touchAction: 'none' }}>
              <Cropper
                image={cropSrc}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
                onCropComplete={onCropComplete}
              />
            </div>
            <div style={{ marginBottom: '2rem', display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
               <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                 <label style={{ color: 'var(--secondary)', fontWeight: 'bold' }}>Zoom</label>
                 <input type="range" min="1" max="3" step="0.1" value={zoom} onChange={(e) => setZoom(Number(e.target.value))} />
               </div>
               <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                 <label style={{ color: 'var(--secondary)', fontWeight: 'bold' }}>Rotate</label>
                 <input type="range" min="0" max="360" step="1" value={rotation} onChange={(e) => setRotation(Number(e.target.value))} />
               </div>
               <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                 <label style={{ color: 'var(--secondary)', fontWeight: 'bold' }}>Bright</label>
                 <input type="range" min="0.5" max="2" step="0.1" value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} />
               </div>
               <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                 <label style={{ color: 'var(--secondary)', fontWeight: 'bold' }}>Contrast</label>
                 <input type="range" min="0.5" max="2" step="0.1" value={contrast} onChange={(e) => setContrast(Number(e.target.value))} />
               </div>
            </div>
            <button onClick={applyCrop} className="btn-primary" style={{ padding: '15px 40px', fontSize: '1.2rem' }}>
              ✂️ Apply Crop & Preview
            </button>
          </div>
        )}
      </div>

      {photo && !largePreviewShape && !cropSrc ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
          {/* Left Column: 3D Preview */}
          <div className="glass-card" style={{ background: 'rgba(255,255,255,0.9)', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--primary)', fontFamily: 'var(--font-comfortaa), sans-serif' }}>
              3D Live Preview
            </h3>
            
            <div style={{ height: '400px', background: 'rgba(236,231,218,0.5)', borderRadius: '15px', overflow: 'hidden', border: '2px solid var(--glass-border)', marginBottom: '1.5rem', position: 'relative', pointerEvents: 'auto' }}>
              <Canvas shadows={{ type: THREE.PCFShadowMap }} camera={{ position: [0, 0, 5], fov: 50 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'auto' }}>
                <ambientLight intensity={0.7} />
                <directionalLight position={[5, 5, 5]} intensity={0.9} castShadow />
                <directionalLight position={[-5, -5, 3]} intensity={0.3} />
                <ContactShadows position={[0, -2, 0]} opacity={0.5} scale={10} blur={2} far={4} />
                <Suspense fallback={null}>
                  <MagnetModel textureUrl={photo} shape={activeShape} />
                </Suspense>
                <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={1.5} />
              </Canvas>
            </div>

            <button onClick={() => setLargePreviewShape(activeShape)} className="btn-primary" style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.8)', border: '2px solid var(--secondary)', color: 'var(--primary)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', pointerEvents: 'auto', textAlign: 'center' }}>
              🔍 View Large / Immersive View
            </button>
          </div>

          {/* Right Column: Customizer Controls */}
          <div className="glass-card" style={{ background: 'rgba(255,255,255,0.9)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', fontFamily: 'var(--font-comfortaa), sans-serif' }}>
                1. Select Shape
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                {dynamicShapesList.map(shape => {
                  const isActive = activeShape === shape;
                  return (
                    <button
                      key={shape}
                      onClick={() => {
                        setActiveShape(shape);
                        setQuantity(1);
                      }}
                      style={{
                        padding: '15px 10px',
                        borderRadius: '12px',
                        border: isActive ? '3px solid var(--primary)' : '2px solid var(--glass-border)',
                        background: isActive ? 'rgba(79, 44, 31, 0.1)' : '#fff',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        color: 'var(--primary)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s',
                        pointerEvents: 'auto'
                      }}
                    >
                      <span style={{ fontSize: '1.8rem' }}>
                        {shape === 'Square' ? '🟩' : shape === 'Round' ? '🔵' : shape === 'Polaroid' ? '📸' : shape === 'Heart' ? '💖' : '✨'}
                      </span>
                      <span>{shape} Magnet</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)' }} />

            <div>
              <h3 style={{ color: 'var(--primary)', marginBottom: '0.8rem', fontFamily: 'var(--font-comfortaa), sans-serif' }}>
                2. Choose Quantity
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                  style={{ width: '40px', height: '40px', borderRadius: '50%', border: 'none', background: 'var(--glass-bg)', cursor: 'pointer', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)', pointerEvents: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  -
                </button>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', minWidth: '40px', textAlign: 'center' }}>
                  {quantity}
                </span>
                <button 
                  onClick={() => setQuantity(quantity + 1)} 
                  style={{ width: '40px', height: '40px', borderRadius: '50%', border: 'none', background: 'var(--glass-bg)', cursor: 'pointer', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)', pointerEvents: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  +
                </button>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.9rem', color: 'var(--secondary)', fontWeight: 600 }}>Total Price</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                  {formatPrice(basePrice * quantity)}
                </div>
              </div>
              <button 
                onClick={() => addToCart(activeShape)} 
                className="btn-primary" 
                style={{ flex: 1, marginLeft: '2rem', padding: '15px', fontSize: '1.1rem', pointerEvents: 'auto' }}
              >
                ➕ Add to Cart
              </button>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)' }} />

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <label className="btn-primary" style={{ cursor: 'pointer', background: '#fff', color: 'var(--primary)', border: '2px solid var(--primary)', flex: 1, padding: '10px', fontSize: '0.95rem', textAlign: 'center' }}>
                📸 New Photo
                <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
              </label>
              {originalPhotoSrc && (
                <button onClick={() => setCropSrc(originalPhotoSrc)} className="btn-primary" style={{ background: 'var(--accent)', color: '#fff', flex: 1, padding: '10px', fontSize: '0.95rem', border: 'none' }}>
                  ✏️ Recrop Photo
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {largePreviewShape && photo ? (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.95)', zIndex: 99999, display: 'flex', flexDirection: 'column', pointerEvents: 'auto' }}>
          <div style={{ width: '100%', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(79, 44, 31, 0.9)', borderBottom: '1px solid var(--glass-border)', zIndex: 1000000, pointerEvents: 'auto' }}>
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.2rem', fontFamily: 'var(--font-comfortaa), sans-serif' }}>🔍 3D Large Preview ({largePreviewShape})</span>
            <button onClick={() => setLargePreviewShape(null)} className="btn-primary" style={{ background: '#e74c3c', color: 'white', padding: '8px 20px', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', pointerEvents: 'auto', zIndex: 1000001 }}>
              ✕ Close Preview
            </button>
          </div>
          <div style={{ flex: 1, width: '100%', minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', pointerEvents: 'auto' }}>
            <div style={{ width: '100%', height: '100%', minHeight: '60vh', maxWidth: '800px', maxHeight: '800px', position: 'relative', pointerEvents: 'auto' }}>
              <Canvas shadows={{ type: THREE.PCFShadowMap }} camera={{ position: [0, 0, 4], fov: 40 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'auto' }}>
                <ambientLight intensity={0.7} />
                <directionalLight position={[5, 5, 5]} intensity={0.9} castShadow />
                <directionalLight position={[-5, -5, 3]} intensity={0.3} />
                <ContactShadows position={[0, -2, 0]} opacity={0.5} scale={10} blur={2} far={4} />
                <Suspense fallback={null}>
                  {photo && <MagnetModel textureUrl={photo} shape={largePreviewShape || 'Square'} />}
                </Suspense>
                <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={1} />
              </Canvas>
            </div>
          </div>
        </div>
      ) : null}

      {/* Cart Summary */}
      {cart.length > 0 && !cropSrc && (
        <div className="glass-card" style={{ marginTop: '3rem', background: 'rgba(236,231,218,0.9)', pointerEvents: 'auto' }}>
          <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)', fontFamily: 'var(--font-comfortaa), sans-serif' }}>🛒 Your Cart ({cart.length} items)</h2>
          <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
            {cart.map((item, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', padding: '15px', background: 'rgba(255,255,255,0.6)', borderRadius: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                  <img src={item.photo} alt="thumbnail" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '10px' }} />
                  <div>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--primary)', fontFamily: 'var(--font-comfortaa), sans-serif' }}>{item.shape} Magnet</h3>
                    <p style={{ color: 'var(--secondary)' }}>Qty: {item.quantity}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--primary)' }}>
                    {formatPrice((item.price || 4.99) * item.quantity)}
                  </div>
                  <button 
                    onClick={() => removeFromCart(index)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem', marginLeft: '1.5rem', color: '#e74c3c', pointerEvents: 'auto' }}
                    title="Remove Item"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', marginRight: '2rem' }}>
              Total: {formatPrice(cart.reduce((sum, item) => sum + ((item.price || 4.99) * item.quantity), 0))}
            </div>
            <button onClick={handleCheckout} className="btn-primary" style={{ fontSize: '1.2rem', padding: '15px 40px', pointerEvents: 'auto' }}>
              💳 Secure Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
