import { EffectComposer, Bloom, Vignette, Noise } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";

/**
 * The cinematic grade: a soft mipmap bloom for the cosmic glow, a deep
 * vignette to focus the eye, and a whisper of grain for film texture.
 */
export default function Effects({ low = false }: { low?: boolean }) {
  return (
    <EffectComposer multisampling={low ? 0 : 2} enableNormalPass={false}>
      <Bloom
        intensity={low ? 0.55 : 0.7}
        luminanceThreshold={0.0}
        luminanceSmoothing={0.9}
        mipmapBlur
        radius={0.55}
      />
      <Vignette eskil={false} offset={0.2} darkness={0.95} />
      <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.28} />
    </EffectComposer>
  );
}
