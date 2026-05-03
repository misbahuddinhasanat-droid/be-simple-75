import { useState, useRef, useMemo, Suspense, Component, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, useTexture } from "@react-three/drei";
import * as THREE from "three";
import {
  useListProducts,
  useUploadDesign,
  useAddCartItem,
  getGetCartQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2 } from "lucide-react";
import { useLocation } from "wouter";

class WebGLErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

type BodyType = "slim" | "medium" | "oversized";
type Gender = "man" | "woman";

interface Dims {
  torsoW: number;
  torsoH: number;
  torsoD: number;
  sleeveLen: number;
  sleeveR: number;
  hipW: number;
  hipH: number;
}

function getDims(bodyType: BodyType, gender: Gender): Dims {
  const map: Record<BodyType, Dims> = {
    slim: {
      torsoW: 0.72,
      torsoH: 1.22,
      torsoD: 0.4,
      sleeveLen: 0.44,
      sleeveR: 0.155,
      hipW: 0.62,
      hipH: 0.52,
    },
    medium: {
      torsoW: 0.98,
      torsoH: 1.3,
      torsoD: 0.46,
      sleeveLen: 0.54,
      sleeveR: 0.21,
      hipW: 0.86,
      hipH: 0.54,
    },
    oversized: {
      torsoW: 1.35,
      torsoH: 1.48,
      torsoD: 0.54,
      sleeveLen: 0.72,
      sleeveR: 0.28,
      hipW: 1.06,
      hipH: 0.58,
    },
  };
  const d = { ...map[bodyType] };
  if (gender === "woman") {
    d.hipW *= 1.22;
    d.torsoW *= 0.9;
  }
  return d;
}

const SKIN = "#b88a62"; // Slightly darker skin tone for dark vibe
const PANTS = "#0f0f0f";

function DesignOverlay({
  dataUrl,
  torsoW,
  torsoH,
  torsoD,
  torsoY,
}: {
  dataUrl: string;
  torsoW: number;
  torsoH: number;
  torsoD: number;
  torsoY: number;
}) {
  const tex = useTexture(dataUrl);
  tex.colorSpace = THREE.SRGBColorSpace;
  const size = Math.min(torsoW, torsoH) * 0.56;
  return (
    <mesh position={[0, torsoY + torsoH * 0.06, torsoD / 2 + 0.002]}>
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial map={tex} transparent alphaTest={0.01} roughness={0.8} />
    </mesh>
  );
}

function ModelFigure({
  bodyType,
  gender,
  shirtHex,
  designDataUrl,
}: {
  bodyType: BodyType;
  gender: Gender;
  shirtHex: string;
  designDataUrl: string | null;
}) {
  const d = useMemo(() => getDims(bodyType, gender), [bodyType, gender]);
  const shirtColor = useMemo(() => new THREE.Color(shirtHex), [shirtHex]);

  const torsoY = 1.4;
  const headY = torsoY + d.torsoH / 2 + 0.21 + 0.32;
  const neckY = torsoY + d.torsoH / 2 + 0.12;
  const shoulderY = torsoY + d.torsoH / 2 - 0.08;
  const sleeveX = d.torsoW / 2 + d.sleeveLen / 2 - 0.04;
  const forearmLen = 0.68;
  const forearmX = d.torsoW / 2 + d.sleeveLen + forearmLen / 2 - 0.06;
  const forearmDropAngle = 0.32;
  const hipY = torsoY - d.torsoH / 2 - d.hipH / 2 + 0.04;
  const legR = gender === "woman" ? 0.2 : 0.22;
  const legLen = 1.35;
  const legY = hipY - d.hipH / 2 - legLen / 2 + 0.04;
  const legX = d.hipW * 0.27;

  const shirtMat = (
    <meshStandardMaterial color={shirtColor} roughness={0.88} metalness={0.0} />
  );
  const skinMat = <meshStandardMaterial color={SKIN} roughness={0.9} />;
  const pantsMat = <meshStandardMaterial color={PANTS} roughness={0.85} />;

  return (
    <group>
      {/* Head */}
      <mesh position={[0, headY, 0]}>
        <sphereGeometry args={[0.3, 24, 24]} />
        {skinMat}
      </mesh>

      {/* Neck */}
      <mesh position={[0, neckY, 0]}>
        <cylinderGeometry args={[0.1, 0.12, 0.28, 12]} />
        {skinMat}
      </mesh>

      {/* Torso / Shirt body */}
      <mesh position={[0, torsoY, 0]}>
        <boxGeometry args={[d.torsoW, d.torsoH, d.torsoD]} />
        {shirtMat}
      </mesh>

      {/* Design overlay on chest */}
      {designDataUrl && (
        <Suspense fallback={null}>
          <DesignOverlay
            dataUrl={designDataUrl}
            torsoW={d.torsoW}
            torsoH={d.torsoH}
            torsoD={d.torsoD}
            torsoY={torsoY}
          />
        </Suspense>
      )}

      {/* Left sleeve */}
      <mesh
        position={[-sleeveX, shoulderY, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[d.sleeveR, d.sleeveR * 0.88, d.sleeveLen, 12]} />
        {shirtMat}
      </mesh>

      {/* Right sleeve */}
      <mesh
        position={[sleeveX, shoulderY, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[d.sleeveR * 0.88, d.sleeveR, d.sleeveLen, 12]} />
        {shirtMat}
      </mesh>

      {/* Left forearm */}
      <mesh
        position={[-forearmX, shoulderY - 0.28, 0]}
        rotation={[0, 0, forearmDropAngle]}
      >
        <cylinderGeometry args={[0.1, 0.09, forearmLen, 10]} />
        {skinMat}
      </mesh>

      {/* Right forearm */}
      <mesh
        position={[forearmX, shoulderY - 0.28, 0]}
        rotation={[0, 0, -forearmDropAngle]}
      >
        <cylinderGeometry args={[0.09, 0.1, forearmLen, 10]} />
        {skinMat}
      </mesh>

      {/* Left hand */}
      <mesh position={[-(forearmX + 0.08), shoulderY - 0.7, 0]}>
        <sphereGeometry args={[0.1, 10, 10]} />
        {skinMat}
      </mesh>

      {/* Right hand */}
      <mesh position={[forearmX + 0.08, shoulderY - 0.7, 0]}>
        <sphereGeometry args={[0.1, 10, 10]} />
        {skinMat}
      </mesh>

      {/* Hips / pants top */}
      <mesh position={[0, hipY, 0]}>
        <boxGeometry args={[d.hipW, d.hipH, d.torsoD * 0.92]} />
        {pantsMat}
      </mesh>

      {/* Left leg */}
      <mesh position={[-legX, legY, 0]}>
        <cylinderGeometry args={[legR, legR * 0.88, legLen, 12]} />
        {pantsMat}
      </mesh>

      {/* Right leg */}
      <mesh position={[legX, legY, 0]}>
        <cylinderGeometry args={[legR, legR * 0.88, legLen, 12]} />
        {pantsMat}
      </mesh>

      {/* Left foot */}
      <mesh position={[-legX, legY - legLen / 2 - 0.07, 0.08]}>
        <boxGeometry args={[0.22, 0.13, 0.42]} />
        <meshStandardMaterial color="#050505" roughness={0.9} />
      </mesh>

      {/* Right foot */}
      <mesh position={[legX, legY - legLen / 2 - 0.07, 0.08]}>
        <boxGeometry args={[0.22, 0.13, 0.42]} />
        <meshStandardMaterial color="#050505" roughness={0.9} />
      </mesh>
    </group>
  );
}

function Scene({
  bodyType,
  gender,
  shirtHex,
  designDataUrl,
}: {
  bodyType: BodyType;
  gender: Gender;
  shirtHex: string;
  designDataUrl: string | null;
}) {
  return (
    <>
      {/* Darker lighting setup for the streetwear vibe */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 6, 4]} intensity={1.8} castShadow />
      <directionalLight position={[-3, 2, -2]} intensity={0.8} />
      <Environment preset="city" />
      <ModelFigure
        bodyType={bodyType}
        gender={gender}
        shirtHex={shirtHex}
        designDataUrl={designDataUrl}
      />
      <ContactShadows
        position={[0, -0.38, 0]}
        opacity={0.6}
        scale={6}
        blur={2}
        far={4}
        color="#000"
      />
      <OrbitControls
        enablePan={false}
        minDistance={2.5}
        maxDistance={7}
        minPolarAngle={Math.PI * 0.15}
        maxPolarAngle={Math.PI * 0.75}
        target={[0, 1.4, 0]}
      />
    </>
  );
}

export default function Customize() {
  const [, setLocation] = useLocation();
  const { data: products } = useListProducts();
  const uploadDesign = useUploadDesign();
  const addCartItem = useAddCartItem();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [bodyType, setBodyType] = useState<BodyType>("oversized");
  const [gender, setGender] = useState<Gender>("man");
  const [size, setSize] = useState("XL");
  const [quantity, setQuantity] = useState(1);
  const [designDataUrl, setDesignDataUrl] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const customProduct = products?.find((p) => p.category === "custom") ?? products?.[0];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image under 5MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string;
      setDesignDataUrl(base64);
      setIsUploading(true);
      try {
        const result = await uploadDesign.mutateAsync({
          data: { imageData: base64, filename: file.name },
        });
        setUploadedUrl(result.url);
        toast({ title: "Design Applied", description: "Ready to drop." });
      } catch {
        toast({
          title: "Upload failed",
          description: "Could not save design to server. Preview still works.",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleClearDesign = () => {
    setDesignDataUrl(null);
    setUploadedUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAddToCart = () => {
    if (!customProduct) return;
    addCartItem.mutate(
      {
        data: {
          productId: customProduct.id,
          size,
          color: "Black",
          quantity,
          customDesignUrl: uploadedUrl ?? null,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          toast({ title: "Added to Bag", description: "Your custom piece is in the bag." });
          setLocation("/cart");
        },
        onError: () => {
          toast({ title: "Error", description: "Could not add to bag.", variant: "destructive" });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f0f0f0] pb-24">
      <div className="container px-4 py-12 md:py-16">
        <div className="text-center mb-12">
          <h1 className="font-display text-5xl md:text-7xl font-black uppercase tracking-tighter text-white">
            The Studio
          </h1>
          <p className="text-zinc-400 font-bold uppercase tracking-widest max-w-xl mx-auto mt-4 text-sm">
            Upload your vision. Choose your fit. Make it concrete.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* 3D Canvas */}
          <div className="lg:col-span-7 xl:col-span-8 bg-[#111] border-2 border-[#1f1f1f] rounded-none overflow-hidden relative"
            style={{ height: "720px" }}>

            {!designDataUrl && (
              <div className="absolute inset-0 pointer-events-none opacity-20 flex items-center justify-center mix-blend-screen z-0">
                <img src="/products/angel-back.jpg" alt="Ghost" className="w-[150%] h-[150%] object-cover object-center grayscale blur-[2px]" />
              </div>
            )}

            <div className="absolute top-6 left-6 z-10 flex gap-3">
              <span className="bg-black/90 border border-[#1f1f1f] text-white text-[10px] font-black px-4 py-2 uppercase tracking-widest backdrop-blur-sm">
                Drag to Rotate
              </span>
              {designDataUrl && (
                <span className="bg-[#e63329] text-white text-[10px] font-black px-4 py-2 uppercase tracking-widest">
                  Design Applied
                </span>
              )}
            </div>

            <WebGLErrorBoundary
              fallback={
                <div className="flex flex-col items-center justify-center h-full text-center px-8 bg-[#050505] relative z-10">
                  <p className="font-black uppercase text-xl mb-3 text-white">3D Preview Offline</p>
                  <p className="text-sm font-bold uppercase tracking-wider text-zinc-500">
                    WebGL support required.
                  </p>
                </div>
              }
            >
              <Canvas
                camera={{ position: [0, 1.8, 5], fov: 38 }}
                gl={{ antialias: true, toneMapping: THREE.NoToneMapping }}
                shadows
                className="relative z-10"
              >
                <Suspense fallback={null}>
                  <Scene
                    bodyType={bodyType}
                    gender={gender}
                    shirtHex="#0d0d0d" // Always dark/black
                    designDataUrl={designDataUrl}
                  />
                </Suspense>
              </Canvas>
            </WebGLErrorBoundary>

            {isUploading && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20">
                <div className="bg-[#111] border border-[#1f1f1f] px-8 py-6 flex flex-col items-center gap-4">
                  <Loader2 className="w-8 h-8 animate-spin text-[#e63329]" />
                  <span className="font-black text-xs uppercase tracking-widest text-white">Processing Artwork...</span>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6">

            {/* Upload */}
            <div className="bg-[#050505] border-2 border-[#1f1f1f] p-6">
              <h3 className="font-display text-xl font-black uppercase tracking-wider mb-6 text-white border-b-2 border-[#1f1f1f] pb-3">Artwork</h3>
              {designDataUrl ? (
                <div className="flex items-center gap-4 p-4 bg-[#111] border border-[#1f1f1f]">
                  <img
                    src={designDataUrl}
                    alt="Design preview"
                    className="w-16 h-16 object-contain bg-black border border-[#1f1f1f]"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm uppercase tracking-wide text-white truncate">Custom Print</p>
                    <p className="text-xs font-bold tracking-wider uppercase text-[#e63329] mt-1">Live on Model</p>
                  </div>
                  <button
                    onClick={handleClearDesign}
                    className="text-zinc-500 hover:text-[#e63329] transition-colors p-2"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-[#1f1f1f] p-8 flex flex-col items-center text-center hover:border-white transition-all cursor-pointer group relative overflow-hidden bg-[#0a0a0a]"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="absolute inset-0 opacity-10 grayscale mix-blend-screen pointer-events-none transition-opacity group-hover:opacity-20">
                    <img src="/products/deadly-back.jpg" className="w-full h-full object-cover object-center" alt="" />
                  </div>
                  <div className="relative z-10 w-16 h-16 bg-[#111] border border-[#1f1f1f] text-white flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-white group-hover:text-black transition-all">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="font-black uppercase tracking-widest text-sm text-white relative z-10">Upload Graphic</p>
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mt-2 relative z-10">PNG / JPG (Max 5MB)</p>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/jpg, image/webp"
                className="hidden"
              />
            </div>

            {/* Model & Fit */}
            <div className="bg-[#050505] border-2 border-[#1f1f1f] p-6">
              <h3 className="font-display text-xl font-black uppercase tracking-wider mb-6 text-white border-b-2 border-[#1f1f1f] pb-3">Silhouette</h3>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                {(["man", "woman"] as Gender[]).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={`h-12 border-2 font-black uppercase tracking-widest text-xs transition-all ${
                      gender === g
                        ? "border-white bg-white text-black"
                        : "border-[#1f1f1f] text-zinc-400 hover:border-zinc-500 hover:text-white"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3">
                {(["slim", "medium", "oversized"] as BodyType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setBodyType(type)}
                    className={`h-12 border-2 font-black uppercase tracking-widest text-[10px] transition-all ${
                      bodyType === type
                        ? "border-white bg-white text-black"
                        : "border-[#1f1f1f] text-zinc-400 hover:border-zinc-500 hover:text-white"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Size & Qty */}
            <div className="bg-[#050505] border-2 border-[#1f1f1f] p-6">
              <h3 className="font-display text-xl font-black uppercase tracking-wider mb-6 text-white border-b-2 border-[#1f1f1f] pb-3">Details</h3>
              
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">Size</p>
              <div className="grid grid-cols-5 gap-2 mb-8">
                {["S", "M", "L", "XL", "XXL"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`h-12 border-2 font-black text-sm transition-all ${
                      size === s
                        ? "border-white bg-white text-black"
                        : "border-[#1f1f1f] text-zinc-400 hover:border-zinc-500 hover:text-white"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">Quantity</p>
              <div className="flex items-center border-2 border-[#1f1f1f] w-full h-14 bg-[#111]">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-16 h-full flex items-center justify-center text-zinc-400 hover:text-white transition-colors hover:bg-[#1f1f1f]"
                >
                  -
                </button>
                <span className="flex-1 text-center font-black text-xl text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-16 h-full flex items-center justify-center text-zinc-400 hover:text-white transition-colors hover:bg-[#1f1f1f]"
                >
                  +
                </button>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full h-16 font-black uppercase tracking-widest text-lg bg-[#e63329] hover:bg-white hover:text-black text-white transition-colors border-2 border-transparent rounded-none shadow-[0_0_30px_rgba(230,51,41,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]"
              onClick={handleAddToCart}
              disabled={!customProduct || addCartItem.isPending}
            >
              {addCartItem.isPending
                ? "Processing..."
                : `Add to Bag — $${((customProduct?.price ?? 49.99) * quantity).toFixed(2)}`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
