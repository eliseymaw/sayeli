import { EffectComposer, Bloom, Vignette, Noise } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";

/**
 * The cinematic grade: a soft mipmap bloom for the cosmic glow, a deep
 * vignette to focus the eye, and a whisper of grain for film texture.
 *
 * On low/mobile tiers we drop multisampling and the full-screen grain pass,
 * and ease the bloom — the heaviest fragment work — for a smoother framerate.
 */
export default function Effects({ low = false }: { low?: boolean }) {
  // Two explicit trees so EffectComposer never receives a conditional child.
  if (low) {
    return (
      <EffectComposer multisampling={0} enableNormalPass={false}>
        <Bloom
          intensity={0.5}
          luminanceThreshold={0.0}
          luminanceSmoothing={0.9}
          mipmapBlur
          radius={0.5}
        />
        <Vignette eskil={false} offset={0.22} darkness={0.92} />
      </EffectComposer>
    );
  }

  return (
    <EffectComposer multisampling={2} enableNormalPass={false}>
      <Bloom
        intensity={0.7}
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
