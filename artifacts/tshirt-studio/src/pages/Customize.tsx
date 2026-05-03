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

const SKIN = "#d4a574";
const PANTS = "#2a2a3e";

// Design overlay plane shown on chest
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
      <mesh
        position={[-(forearmX + 0.08), shoulderY - 0.7, 0]}
      >
        <sphereGeometry args={[0.1, 10, 10]} />
        {skinMat}
      </mesh>

      {/* Right hand */}
      <mesh
        position={[forearmX + 0.08, shoulderY - 0.7, 0]}
      >
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
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>

      {/* Right foot */}
      <mesh position={[legX, legY - legLen / 2 - 0.07, 0.08]}>
        <boxGeometry args={[0.22, 0.13, 0.42]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
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
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 6, 4]} intensity={1.6} castShadow />
      <directionalLight position={[-3, 2, -2]} intensity={0.4} />
      <Environment preset="studio" />
      <ModelFigure
        bodyType={bodyType}
        gender={gender}
        shirtHex={shirtHex}
        designDataUrl={designDataUrl}
      />
      <ContactShadows
        position={[0, -0.38, 0]}
        opacity={0.35}
        scale={4}
        blur={1.5}
        far={4}
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

const COLOR_OPTIONS = [
  { name: "Black", hex: "#111111" },
  { name: "White", hex: "#f5f5f5" },
  { name: "Gray", hex: "#888888" },
  { name: "Navy", hex: "#1a2b4a" },
  { name: "Olive", hex: "#4a5240" },
  { name: "Burgundy", hex: "#6b1f1f" },
];

export default function Customize() {
  const [, setLocation] = useLocation();
  const { data: products } = useListProducts();
  const uploadDesign = useUploadDesign();
  const addCartItem = useAddCartItem();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [bodyType, setBodyType] = useState<BodyType>("medium");
  const [gender, setGender] = useState<Gender>("man");
  const [shirtColor, setShirtColor] = useState(COLOR_OPTIONS[0]);
  const [size, setSize] = useState("M");
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
        toast({ title: "Design applied", description: "Looking good on the model." });
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
          color: shirtColor.name,
          quantity,
          customDesignUrl: uploadedUrl ?? null,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          toast({ title: "Added to Bag", description: "Your custom tee is in the bag." });
          setLocation("/cart");
        },
        onError: () => {
          toast({ title: "Error", description: "Could not add to bag.", variant: "destructive" });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="container px-4 py-8 md:py-12">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl md:text-6xl font-black uppercase tracking-tighter">
            The Studio
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto mt-3">
            Upload your design. Choose your fit. Rotate the model. Make it yours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* 3D Canvas */}
          <div className="lg:col-span-7 xl:col-span-8 bg-gradient-to-b from-zinc-200 to-zinc-100 rounded-2xl overflow-hidden relative"
            style={{ height: "680px" }}>

            <div className="absolute top-4 left-4 z-10 flex gap-2">
              <span className="bg-black/80 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Drag to rotate
              </span>
              {designDataUrl && (
                <span className="bg-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Design on
                </span>
              )}
            </div>

            <WebGLErrorBoundary
              fallback={
                <div className="flex flex-col items-center justify-center h-full text-center px-8">
                  <p className="font-black uppercase text-lg mb-2">3D Preview Unavailable</p>
                  <p className="text-sm text-muted-foreground">
                    Your browser or environment does not support WebGL.<br />
                    Try opening this page in a modern browser for the full 3D experience.
                  </p>
                </div>
              }
            >
              <Canvas
                camera={{ position: [0, 1.8, 5], fov: 38 }}
                gl={{ antialias: true }}
                shadows
              >
                <Suspense fallback={null}>
                  <Scene
                    bodyType={bodyType}
                    gender={gender}
                    shirtHex={shirtColor.hex}
                    designDataUrl={designDataUrl}
                  />
                </Suspense>
              </Canvas>
            </WebGLErrorBoundary>

            {isUploading && (
              <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-20">
                <div className="bg-white rounded-xl px-6 py-4 flex items-center gap-3 shadow-xl">
                  <Loader2 className="w-5 h-5 animate-spin text-orange-600" />
                  <span className="font-bold text-sm uppercase tracking-wider">Applying design...</span>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-5">

            {/* Upload */}
            <div className="bg-white border rounded-xl p-5">
              <h3 className="font-black uppercase tracking-wider text-sm mb-4">Your Artwork</h3>
              {designDataUrl ? (
                <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-lg border">
                  <img
                    src={designDataUrl}
                    alt="Design preview"
                    className="w-14 h-14 object-contain rounded bg-white border"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">Custom Design</p>
                    <p className="text-xs text-muted-foreground">Showing on model</p>
                  </div>
                  <button
                    onClick={handleClearDesign}
                    className="text-zinc-400 hover:text-red-500 transition-colors p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-zinc-200 rounded-xl p-7 flex flex-col items-center text-center hover:border-orange-400 hover:bg-orange-50/50 transition-all cursor-pointer group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="font-bold text-sm">Click to upload design</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG or JPG, up to 5MB</p>
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

            {/* Gender */}
            <div className="bg-white border rounded-xl p-5">
              <h3 className="font-black uppercase tracking-wider text-sm mb-4">Model</h3>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {(["man", "woman"] as Gender[]).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={`h-11 border-2 rounded-lg font-bold uppercase text-sm transition-all ${
                      gender === g
                        ? "border-orange-500 bg-orange-500 text-white"
                        : "border-zinc-200 hover:border-zinc-400"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>

              <h3 className="font-black uppercase tracking-wider text-sm mb-3">Fit</h3>
              <div className="grid grid-cols-3 gap-2">
                {(["slim", "medium", "oversized"] as BodyType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setBodyType(type)}
                    className={`h-11 border-2 rounded-lg font-bold uppercase text-xs transition-all ${
                      bodyType === type
                        ? "border-orange-500 bg-orange-500 text-white"
                        : "border-zinc-200 hover:border-zinc-400"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div className="bg-white border rounded-xl p-5">
              <h3 className="font-black uppercase tracking-wider text-sm mb-4">
                Color — {shirtColor.name}
              </h3>
              <div className="flex gap-3 flex-wrap">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setShirtColor(c)}
                    title={c.name}
                    className={`w-9 h-9 rounded-full transition-all border-2 ${
                      shirtColor.name === c.name
                        ? "border-orange-500 scale-110 shadow-md"
                        : "border-transparent hover:scale-105 shadow-sm"
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>

            {/* Size + Qty */}
            <div className="bg-white border rounded-xl p-5">
              <h3 className="font-black uppercase tracking-wider text-sm mb-4">Size</h3>
              <div className="grid grid-cols-5 gap-2 mb-5">
                {["XS", "S", "M", "L", "XL", "XXL"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`h-10 border-2 rounded-lg font-bold text-xs transition-all ${
                      size === s
                        ? "border-orange-500 bg-orange-500 text-white"
                        : "border-zinc-200 hover:border-zinc-400"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <h3 className="font-black uppercase tracking-wider text-sm mb-3">Quantity</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border-2 border-zinc-200 rounded-lg font-bold text-lg hover:border-zinc-400 transition-all"
                >
                  -
                </button>
                <span className="font-black text-xl w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 border-2 border-zinc-200 rounded-lg font-bold text-lg hover:border-zinc-400 transition-all"
                >
                  +
                </button>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full h-14 font-black uppercase tracking-widest text-base bg-orange-600 hover:bg-orange-700 text-white rounded-xl"
              onClick={handleAddToCart}
              disabled={!customProduct || addCartItem.isPending}
            >
              {addCartItem.isPending
                ? "Adding..."
                : `Add to Bag — $${((customProduct?.price ?? 49.99) * quantity).toFixed(2)}`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
