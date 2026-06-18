import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle, Settings } from 'lucide-react';
import sakuraSrc from './Images/Sakura.png';
import sakura2Src from './Images/Sakura2.png';
import lfoSrc from './Images/LFO.png';
import leatherTextureSrc from './Images/textures/leather texture.jpg';
import leatherTexture2Src from './Images/textures/leather texture 2.jpg';
import fineLeatherTextureSrc from './Images/textures/fine leather textured.jpg';
import whiteLeatherTextureSrc from './Images/textures/white-leather-texture.jpg';
import gptTextureSrc from './Images/textures/GPT.jpg';

const SATURATION_MODULE_STYLES = [
  'Hidden (Disabled)',
  'Walnut Twin Push',
  'Anodized Rocker',
  'Ivory & Brass Tabs',
  'Glowing Soft Silicone',
  'Bakelite Horizontal Slider',
  'Stealth Glass Panel',
  'Chrome Lever Switch',
  'Industrial Amber Grid',
  'Porcelain & Gold',
  'Raw Steel & Red'
];

const normalizeSaturationStyle = (value) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return 0;
  return Math.max(0, Math.min(SATURATION_MODULE_STYLES.length - 1, numericValue));
};

const DRIFT_ANIMATION_STYLES = [
  'Original Flutter',
  'Aurora Veil',
  'Aurora Flutter',
  'Knob Flutter Coral Thin',
  'Coral Drift Needles',
  'Coral Needles Fine',
  'Coral Needles Meter',
  'Coral Dual Rails Arc',
  'Coral Dual Smooth Ribbon',
  'Coral Dual Smooth Aurora',
  'Coral Dual Outer Ribbon',
  'Coral Dual Outer Ribbon Flutter',
  'Coral Dual Outer Flutter Clean',
  'Knob Flutter Coral Filled',
  'Knob Flutter Coral Filled + Spread Ribbon'
];

const SAT_MODES = ['Tape Saturation', 'Desk Saturation'];
const FLUTTER_ANIMATION_EPOCH = Date.now();

const normalizeSaturationMode = (value) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return 0;
  return Math.max(0, Math.min(SAT_MODES.length - 1, numericValue));
};

const normalizeFilterPole = (value) => Number(value) === 24 ? 24 : 12;

const FACE_TEXTURE_BLEND_MODES = [
  'multiply',
  'soft-light',
  'overlay',
  'screen',
  'darken',
  'lighten',
  'luminosity',
  'color-burn'
];

const normalizeFaceTextureBlendMode = (value) =>
  FACE_TEXTURE_BLEND_MODES.includes(value) ? value : FACE_TEXTURE_BLEND_MODES[0];

const DEFAULT_FACE_TEXTURE_SCALE = 100;
const CURVES_FILTER_ID = 'global-mastering-curves-filter';
const CURVE_CHANNELS = ['rgb', 'r', 'g', 'b'];
const createIdentityCurve = () => (
  Array.from({ length: 5 }, (_, index) => {
    const value = index / 4;
    return { x: value, y: value };
  })
);
const clamp01 = (value) => Math.max(0, Math.min(1, value));
const DEFAULT_GLOBAL_CURVES = {
  enabled: false,
  channels: {
    rgb: createIdentityCurve(),
    r: createIdentityCurve(),
    g: createIdentityCurve(),
    b: createIdentityCurve()
  }
};

const hexToRgba = (hex, alpha = 1) => {
  const value = String(hex || '').replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(value)) return `rgba(230,106,83,${alpha})`;
  const numeric = parseInt(value, 16);
  const r = (numeric >> 16) & 255;
  const g = (numeric >> 8) & 255;
  const b = numeric & 255;
  return `rgba(${r},${g},${b},${alpha})`;
};

const normalizeDriftAnimationStyle = (value) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return 0;
  return Math.max(0, Math.min(DRIFT_ANIMATION_STYLES.length - 1, numericValue));
};

const SAKURA_IMAGE_PRESETS = {
  sakura: { enabled: true, x: 845, y: 286, size: 300, rotate: 6 },
  sakura2: { enabled: true, x: 0, y: 266, size: 335, rotate: 1 },
  sakura3: { enabled: true, x: 872, y: 774, size: 338, rotate: 34 }
};

const LFO_IMAGE_PRESET = { enabled: true, locked: true, x: 250, y: 636, size: 72, rotate: 0 };
const DEFAULT_PANEL_FACE_COLOR = '#f4ead6';
const DEFAULT_VINTAGE_LOGO_COLOR = '#e66a53';
const DEFAULT_POLARIS_LOGO_COLOR = '#e66a53';
const DEFAULT_KNOB_FLUTTER_FILLED_COLORS = {
  highlight: '#ffc0a4',
  mid: '#e36f55',
  tail: '#7e3028'
};
const DEFAULT_GLOBAL_MASTERING = {
  enabled: false,
  studioDim: { enabled: false, opacity: 18, color: '#050403', x: 50, y: 45, size: 118, softness: 56 },
  light: { enabled: false, x: 18, y: 12, intensity: 22, size: 70, warmth: 62, color: '#fff2cf' },
  vignette: { enabled: false, strength: 22, size: 68, softness: 45, color: '#060403' },
  grade: { enabled: false, warmth: 50, contrast: 50, saturation: 50, lift: 50, fade: 0, opacity: 18, tint: '#9a493c' },
  curves: DEFAULT_GLOBAL_CURVES,
  shadowGlue: { enabled: false, opacity: 18, x: 54, y: 58, size: 68, blur: 28, color: '#120906' },
  bloom: { enabled: false, opacity: 12, size: 62, blur: 28, color: '#e66a53' },
  grain: { enabled: false, opacity: 8, scale: 1, contrast: 24, tone: 50, hold: 0 },
  edgeWash: { enabled: false, opacity: 10, angle: 225, color: '#20100b' }
};
const PANEL_TEXT_DEPTH_SHADOW = '0 1px 0 rgba(255,255,255,0.24), 0 -1px 0 rgba(0,0,0,0.12)';
const OUTER_PLUGIN_SCALE = 0.95;

const CENTER_DIAL_GUIDE_RING_DEFAULTS = {
  large: { enabled: true, locked: true, size: 245 },
  small: { enabled: true, locked: true, size: 161 }
};

const BRAND_TEXT_STYLES = [
  {
    name: 'Warm Ivory',
    polarisColor: '#fff8eb',
    powerColor: '#fff8eb',
    powerShadow: '0 1px 2px rgba(0,0,0,0.18)'
  },
  {
    name: 'Original Red / Grey',
    polarisColor: '#e66a53',
    powerColor: 'rgba(58,53,45,0.7)',
    powerShadow: '0 1px 0 rgba(255,255,255,0.18)'
  }
];

const normalizeBrandTextStyle = (value) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return 0;
  return Math.max(0, Math.min(BRAND_TEXT_STYLES.length - 1, numericValue));
};

const normalizeGlobalMastering = (settings = {}) => {
  const value = settings || {};
  const curvesValue = value.curves || {};
  const normalizedCurves = CURVE_CHANNELS.reduce((acc, channel) => {
    const source = Array.isArray(curvesValue.channels?.[channel]) ? curvesValue.channels[channel] : DEFAULT_GLOBAL_CURVES.channels[channel];
    const points = source
      .slice(0, 5)
      .map((point, index) => ({
        x: clamp01(Number(point?.x)),
        y: clamp01(Number(point?.y)),
        index
      }))
      .filter(point => Number.isFinite(point.x) && Number.isFinite(point.y))
      .sort((a, b) => a.x - b.x)
      .map(({ x, y }, index, array) => {
        const minX = index === 0 ? 0 : array[index - 1].x + 0.001;
        const maxX = index === array.length - 1 ? 1 : array[index + 1].x - 0.001;
        return {
          x: index === 0 ? 0 : index === array.length - 1 ? 1 : Math.max(minX, Math.min(maxX, x)),
          y: clamp01(y)
        };
      });
    while (points.length < 5) points.push(createIdentityCurve()[points.length]);
    points[0] = { x: 0, y: clamp01(points[0].y) };
    points[points.length - 1] = { x: 1, y: clamp01(points[points.length - 1].y) };
    acc[channel] = points;
    return acc;
  }, {});
  return {
    ...DEFAULT_GLOBAL_MASTERING,
    ...value,
    studioDim: { ...DEFAULT_GLOBAL_MASTERING.studioDim, ...(value.studioDim || {}) },
    light: { ...DEFAULT_GLOBAL_MASTERING.light, ...(value.light || {}) },
    vignette: { ...DEFAULT_GLOBAL_MASTERING.vignette, ...(value.vignette || {}) },
    grade: { ...DEFAULT_GLOBAL_MASTERING.grade, ...(value.grade || {}) },
    curves: {
      ...DEFAULT_GLOBAL_CURVES,
      ...curvesValue,
      channels: normalizedCurves
    },
    shadowGlue: { ...DEFAULT_GLOBAL_MASTERING.shadowGlue, ...(value.shadowGlue || {}) },
    bloom: { ...DEFAULT_GLOBAL_MASTERING.bloom, ...(value.bloom || {}) },
    grain: { ...DEFAULT_GLOBAL_MASTERING.grain, ...(value.grain || {}) },
    edgeWash: { ...DEFAULT_GLOBAL_MASTERING.edgeWash, ...(value.edgeWash || {}) }
  };
};

const sampleCurve = (points, x) => {
  const clampedX = clamp01(x);
  for (let index = 0; index < points.length - 1; index += 1) {
    const left = points[index];
    const right = points[index + 1];
    if (clampedX >= left.x && clampedX <= right.x) {
      const span = Math.max(0.0001, right.x - left.x);
      const mix = (clampedX - left.x) / span;
      return left.y + (right.y - left.y) * mix;
    }
  }
  return points[points.length - 1]?.y ?? clampedX;
};

const curveToTableValues = (points, samples = 33) => (
  Array.from({ length: samples }, (_, index) => {
    const x = index / (samples - 1);
    return clamp01(sampleCurve(points, x)).toFixed(4);
  }).join(' ')
);

const composeCurveTables = (masterPoints, channelPoints, samples = 33) => (
  Array.from({ length: samples }, (_, index) => {
    const x = index / (samples - 1);
    const masterY = sampleCurve(masterPoints, x);
    return clamp01(sampleCurve(channelPoints, masterY)).toFixed(4);
  }).join(' ')
);

const buildSmoothCurvePath = (points) => {
  if (!points.length) return '';
  const scaledPoints = points.map(point => ({ x: point.x * 100, y: (1 - point.y) * 100 }));
  if (scaledPoints.length === 1) return `M ${scaledPoints[0].x} ${scaledPoints[0].y}`;
  let path = `M ${scaledPoints[0].x} ${scaledPoints[0].y}`;
  for (let index = 0; index < scaledPoints.length - 1; index += 1) {
    const prev = scaledPoints[index - 1] || scaledPoints[index];
    const current = scaledPoints[index];
    const next = scaledPoints[index + 1];
    const after = scaledPoints[index + 2] || next;
    const control1X = current.x + (next.x - prev.x) / 6;
    const control1Y = current.y + (next.y - prev.y) / 6;
    const control2X = next.x - (after.x - current.x) / 6;
    const control2Y = next.y - (after.y - current.y) / 6;
    path += ` C ${control1X} ${control1Y}, ${control2X} ${control2Y}, ${next.x} ${next.y}`;
  }
  return path;
};

const DEFAULT_ORIGINAL_COPPER_TUNING = {
  ringInset: 8.2,
  darkMetalColor: '#a88842',
  lightMetalColor: '#edd39a',
  baseOuterShadowOpacity: 0.5,
  baseInnerHighlightOpacity: 0.9,
  baseInnerShadowOpacity: 0.6,
  overlayDarkOpacity: 0.4,
  overlayLightOpacity: 0.2,
  overlayInnerShadowOpacity: 0.8,
  overlayOuterHighlightOpacity: 0.5
};

const normalizeOriginalCopperTuning = (settings = {}) => {
  const value = settings || {};
  const clamp = (input, min, max, fallback) => {
    const numericValue = Number(input);
    if (!Number.isFinite(numericValue)) return fallback;
    return Math.max(min, Math.min(max, numericValue));
  };
  return {
    ringInset: clamp(value.ringInset, 4, 14, DEFAULT_ORIGINAL_COPPER_TUNING.ringInset),
    darkMetalColor: typeof value.darkMetalColor === 'string' ? value.darkMetalColor : DEFAULT_ORIGINAL_COPPER_TUNING.darkMetalColor,
    lightMetalColor: typeof value.lightMetalColor === 'string' ? value.lightMetalColor : DEFAULT_ORIGINAL_COPPER_TUNING.lightMetalColor,
    baseOuterShadowOpacity: clamp(value.baseOuterShadowOpacity, 0, 1, DEFAULT_ORIGINAL_COPPER_TUNING.baseOuterShadowOpacity),
    baseInnerHighlightOpacity: clamp(value.baseInnerHighlightOpacity, 0, 1, DEFAULT_ORIGINAL_COPPER_TUNING.baseInnerHighlightOpacity),
    baseInnerShadowOpacity: clamp(value.baseInnerShadowOpacity, 0, 1, DEFAULT_ORIGINAL_COPPER_TUNING.baseInnerShadowOpacity),
    overlayDarkOpacity: clamp(value.overlayDarkOpacity, 0, 1, DEFAULT_ORIGINAL_COPPER_TUNING.overlayDarkOpacity),
    overlayLightOpacity: clamp(value.overlayLightOpacity, 0, 1, DEFAULT_ORIGINAL_COPPER_TUNING.overlayLightOpacity),
    overlayInnerShadowOpacity: clamp(value.overlayInnerShadowOpacity, 0, 1, DEFAULT_ORIGINAL_COPPER_TUNING.overlayInnerShadowOpacity),
    overlayOuterHighlightOpacity: clamp(value.overlayOuterHighlightOpacity, 0, 1, DEFAULT_ORIGINAL_COPPER_TUNING.overlayOuterHighlightOpacity)
  };
};

const DEFAULT_AGED_CHAMPAGNE_BRASS_TUNING = {
  ringInset: 8,
  darkMetalColor: '#6b5a42',
  midMetalColor: '#a4936d',
  lightMetalColor: '#bead85',
  faceHighlightOpacity: 0.39,
  faceShadowOpacity: 0.54,
  baseOuterShadowOpacity: 0.5,
  baseInnerHighlightOpacity: 0.34,
  baseInnerShadowOpacity: 0.54,
  ringBorderOpacity: 0.26,
  ringHighlightOpacity: 0.12,
  ringShadowOpacity: 0.38,
  sheenOpacity: 0.24
};

const normalizeAgedChampagneBrassTuning = (settings = {}) => {
  const value = settings || {};
  const clamp = (input, min, max, fallback) => {
    const numericValue = Number(input);
    if (!Number.isFinite(numericValue)) return fallback;
    return Math.max(min, Math.min(max, numericValue));
  };
  return {
    ringInset: clamp(value.ringInset, 4, 14, DEFAULT_AGED_CHAMPAGNE_BRASS_TUNING.ringInset),
    darkMetalColor: typeof value.darkMetalColor === 'string' ? value.darkMetalColor : DEFAULT_AGED_CHAMPAGNE_BRASS_TUNING.darkMetalColor,
    midMetalColor: typeof value.midMetalColor === 'string' ? value.midMetalColor : DEFAULT_AGED_CHAMPAGNE_BRASS_TUNING.midMetalColor,
    lightMetalColor: typeof value.lightMetalColor === 'string' ? value.lightMetalColor : DEFAULT_AGED_CHAMPAGNE_BRASS_TUNING.lightMetalColor,
    faceHighlightOpacity: clamp(value.faceHighlightOpacity, 0, 1, DEFAULT_AGED_CHAMPAGNE_BRASS_TUNING.faceHighlightOpacity),
    faceShadowOpacity: clamp(value.faceShadowOpacity, 0, 1, DEFAULT_AGED_CHAMPAGNE_BRASS_TUNING.faceShadowOpacity),
    baseOuterShadowOpacity: clamp(value.baseOuterShadowOpacity, 0, 1, DEFAULT_AGED_CHAMPAGNE_BRASS_TUNING.baseOuterShadowOpacity),
    baseInnerHighlightOpacity: clamp(value.baseInnerHighlightOpacity, 0, 1, DEFAULT_AGED_CHAMPAGNE_BRASS_TUNING.baseInnerHighlightOpacity),
    baseInnerShadowOpacity: clamp(value.baseInnerShadowOpacity, 0, 1, DEFAULT_AGED_CHAMPAGNE_BRASS_TUNING.baseInnerShadowOpacity),
    ringBorderOpacity: clamp(value.ringBorderOpacity, 0, 1, DEFAULT_AGED_CHAMPAGNE_BRASS_TUNING.ringBorderOpacity),
    ringHighlightOpacity: clamp(value.ringHighlightOpacity, 0, 1, DEFAULT_AGED_CHAMPAGNE_BRASS_TUNING.ringHighlightOpacity),
    ringShadowOpacity: clamp(value.ringShadowOpacity, 0, 1, DEFAULT_AGED_CHAMPAGNE_BRASS_TUNING.ringShadowOpacity),
    sheenOpacity: clamp(value.sheenOpacity, 0, 1, DEFAULT_AGED_CHAMPAGNE_BRASS_TUNING.sheenOpacity)
  };
};

const DEFAULT_SMOKED_CHAMPAGNE_BOLD_CLEAN_TUNING = {
  ringInset: 8,
  darkMetalColor: '#6e634a',
  midMetalColor: '#afa178',
  lightMetalColor: '#c4b58b',
  faceHighlightOpacity: 0.4,
  faceShadowOpacity: 0.46,
  baseOuterShadowOpacity: 0.5,
  baseInnerHighlightOpacity: 0.35,
  baseInnerShadowOpacity: 0.47,
  ringBorderOpacity: 0.28,
  ringHighlightOpacity: 0.13,
  ringShadowOpacity: 0.4,
  sheenOpacity: 0.24
};

const normalizeSmokedChampagneBoldCleanTuning = (settings = {}) => {
  const value = settings || {};
  const clamp = (input, min, max, fallback) => {
    const numericValue = Number(input);
    if (!Number.isFinite(numericValue)) return fallback;
    return Math.max(min, Math.min(max, numericValue));
  };
  return {
    ringInset: clamp(value.ringInset, 4, 14, DEFAULT_SMOKED_CHAMPAGNE_BOLD_CLEAN_TUNING.ringInset),
    darkMetalColor: typeof value.darkMetalColor === 'string' ? value.darkMetalColor : DEFAULT_SMOKED_CHAMPAGNE_BOLD_CLEAN_TUNING.darkMetalColor,
    midMetalColor: typeof value.midMetalColor === 'string' ? value.midMetalColor : DEFAULT_SMOKED_CHAMPAGNE_BOLD_CLEAN_TUNING.midMetalColor,
    lightMetalColor: typeof value.lightMetalColor === 'string' ? value.lightMetalColor : DEFAULT_SMOKED_CHAMPAGNE_BOLD_CLEAN_TUNING.lightMetalColor,
    faceHighlightOpacity: clamp(value.faceHighlightOpacity, 0, 1, DEFAULT_SMOKED_CHAMPAGNE_BOLD_CLEAN_TUNING.faceHighlightOpacity),
    faceShadowOpacity: clamp(value.faceShadowOpacity, 0, 1, DEFAULT_SMOKED_CHAMPAGNE_BOLD_CLEAN_TUNING.faceShadowOpacity),
    baseOuterShadowOpacity: clamp(value.baseOuterShadowOpacity, 0, 1, DEFAULT_SMOKED_CHAMPAGNE_BOLD_CLEAN_TUNING.baseOuterShadowOpacity),
    baseInnerHighlightOpacity: clamp(value.baseInnerHighlightOpacity, 0, 1, DEFAULT_SMOKED_CHAMPAGNE_BOLD_CLEAN_TUNING.baseInnerHighlightOpacity),
    baseInnerShadowOpacity: clamp(value.baseInnerShadowOpacity, 0, 1, DEFAULT_SMOKED_CHAMPAGNE_BOLD_CLEAN_TUNING.baseInnerShadowOpacity),
    ringBorderOpacity: clamp(value.ringBorderOpacity, 0, 1, DEFAULT_SMOKED_CHAMPAGNE_BOLD_CLEAN_TUNING.ringBorderOpacity),
    ringHighlightOpacity: clamp(value.ringHighlightOpacity, 0, 1, DEFAULT_SMOKED_CHAMPAGNE_BOLD_CLEAN_TUNING.ringHighlightOpacity),
    ringShadowOpacity: clamp(value.ringShadowOpacity, 0, 1, DEFAULT_SMOKED_CHAMPAGNE_BOLD_CLEAN_TUNING.ringShadowOpacity),
    sheenOpacity: clamp(value.sheenOpacity, 0, 1, DEFAULT_SMOKED_CHAMPAGNE_BOLD_CLEAN_TUNING.sheenOpacity)
  };
};

const DEFAULT_POWER_SWITCH_TUNING = {
  bodyRadius: 6,
  insertTopColor: '#ddc48b',
  insertBottomColor: '#88764f'
};

const normalizePowerSwitchTuning = (settings = {}) => {
  const value = settings || {};
  const clamp = (input, min, max, fallback) => {
    const numericValue = Number(input);
    if (!Number.isFinite(numericValue)) return fallback;
    return Math.max(min, Math.min(max, numericValue));
  };
  return {
    bodyRadius: clamp(value.bodyRadius, 2, 16, DEFAULT_POWER_SWITCH_TUNING.bodyRadius),
    insertTopColor: typeof value.insertTopColor === 'string' ? value.insertTopColor : DEFAULT_POWER_SWITCH_TUNING.insertTopColor,
    insertBottomColor: typeof value.insertBottomColor === 'string' ? value.insertBottomColor : DEFAULT_POWER_SWITCH_TUNING.insertBottomColor
  };
};

const CENTER_DIAL_GRAIN_EXCLUSION_MASK =
  'radial-gradient(circle at 50% 52%, rgba(0,0,0,0.5) 0 138px, #000 156px)';


const DECORATIVE_CIRCLE_PRESETS = {
  circle1: { enabled: true, locked: true, x: 619, y: 676, size: 655, rotate: 0, color: '#e66a53', opacity: 0.9 },
  circle2: { enabled: true, locked: true, x: 59, y: 504, size: 334, rotate: 0, color: '#e0a96d', opacity: 0.7 },
  circle3: { enabled: false, locked: true, x: 639, y: 303, size: 245, rotate: 0, color: '#b04a4a', opacity: 0.5 },
  leaf1: { enabled: true, locked: true, x: 105, y: 757, size: 320, rotate: -3, color: '#2c3e35', opacity: 0.8 },
  leaf2: { enabled: false, locked: true, x: 180, y: 720, size: 280, rotate: 15, color: '#1e2a24', opacity: 0.6 }
};

const DECORATIVE_CIRCLE_LABELS = {
  circle1: 'Bottom Coral',
  circle2: 'Left Ochre',
  circle3: 'Top Wine',
  leaf1: 'Rate Shape A',
  leaf2: 'Rate Shape B'
};

const CONTROL_SECTION_PRESETS = {
  io: { x: 424, y: 207, locked: true },
  mode: { x: 143, y: 421, locked: true },
  driftVisual: { x: 703, y: 580, locked: true },
  rate: { x: 150, y: 720, locked: true },
  lfo: { x: 250, y: 636, locked: true },
  autoGain: { x: 694, y: 710, locked: true }
};

const CODE_DEFAULT_DESIGN = {
  "power": true,
  "input": 37.0497314453125,
  "output": 62.95026855468748,
  "ioLinkStyle": "fiberCoralCenter",
  "ioLinked": true,
  "drift": 30,
  "spread": 0,
  "character": 83.43,
  "sweeten": 80.14729003906251,
  "biasHF": 100,
  "noise": 100,
  "mix": 50,
  "rate": 27.302001953124986,
  "depth": 100,
  "stereoPhase": 100,
  "mode": "vintage",
  "lfoEnabled": true,
  "lfoSync": false,
  "lfoShape": 0,
  "lfoSyncDiv": 6,
  "currentPreset": 9,
  "frameStyle": 3,
  "modeStyle": 13,
  "knobStyle": 0,
  "mixKnobStyle": 0,
  "smallKnobRingEnabled": true,
  "centerDialStyle": 1,
  "middleKnobStyle": 16,
  "centerDialSurfaceStyle": 14,
  "centerDialGrooveStyle": 0,
  "centerDialMarkStyle": 0,
  "centerDialNumberStyle": 0,
  "centerDialCirclesEnabled": true,
  "centerDialNumbersEnabled": true,
  "centerDialGuideRings": {
    "large": {
      "enabled": true,
      "locked": true,
      "size": 245
    },
    "small": {
      "enabled": true,
      "locked": true,
      "size": 161
    }
  },
  "spreadPointerStyle": 0,
  "outerRingScaleStyle": 0,
  "driftAnimation": 13,
  "bgIndex": 3,
  "showOutputs": true,
  "showWabiSabi": false,
  "parallelCables": true,
  "showStems": false,
  "showFerns": false,
  "faceTextureEnabled": true,
  "faceTextureStyle": 0,
  "faceTextureOpacity": 29,
  "faceTextureBlendMode": "multiply",
  "faceTextureScale": 100,
  "panelFaceColor": "#e8dfcc",
  "useDefaultPanelFaceColor": true,
  "brandTextStyle": 1,
  "vintageLogoColor": "#e66a53",
  "polarisLogoColor": "#e66a53",
  "knobFlutterFilledColors": {
    "highlight": "#ffc0a4",
    "mid": "#e36f55",
    "tail": "#7e3028"
  },
  "originalCopperTuning": {
    "ringInset": 8,
    "darkMetalColor": "#a88842",
    "lightMetalColor": "#edd39a",
    "baseOuterShadowOpacity": 0.5,
    "baseInnerHighlightOpacity": 0.9,
    "baseInnerShadowOpacity": 0.6,
    "overlayDarkOpacity": 0.4,
    "overlayLightOpacity": 0.2,
    "overlayInnerShadowOpacity": 0.8,
    "overlayOuterHighlightOpacity": 0.5
  },
  "agedChampagneBrassTuning": {
    "ringInset": 8,
    "darkMetalColor": "#6b5a42",
    "midMetalColor": "#a4936d",
    "lightMetalColor": "#bead85",
    "faceHighlightOpacity": 0.39,
    "faceShadowOpacity": 0.54,
    "baseOuterShadowOpacity": 0.5,
    "baseInnerHighlightOpacity": 0.34,
    "baseInnerShadowOpacity": 0.54,
    "ringBorderOpacity": 0.26,
    "ringHighlightOpacity": 0.12,
    "ringShadowOpacity": 0.38,
    "sheenOpacity": 0.24
  },
  "powerSwitchTuning": {
    "bodyRadius": 6,
    "insertTopColor": "#ddc48b",
    "insertBottomColor": "#88764f"
  },
  "screwsEnabled": false,
  "screwStyle": 0,
  "lfoImageState": {
    "enabled": true,
    "locked": true,
    "x": 131,
    "y": 710,
    "size": 155,
    "rotate": 6
  },
  "sakuraImageState": {
    "sakura": {
      "enabled": true,
      "x": 841,
      "y": 277,
      "size": 300,
      "rotate": 6
    },
    "sakura2": {
      "enabled": true,
      "x": 8,
      "y": 271,
      "size": 335,
      "rotate": 1
    },
    "sakura3": {
      "enabled": true,
      "x": 872,
      "y": 774,
      "size": 338,
      "rotate": 34
    }
  },
  "decorativeCircles": {
    "circle1": {
      "enabled": false,
      "locked": true,
      "x": 635,
      "y": 777,
      "size": 733,
      "rotate": 0,
      "color": "#e66a53",
      "opacity": 0.92
    },
    "circle2": {
      "enabled": false,
      "locked": true,
      "x": 59,
      "y": 504,
      "size": 334,
      "rotate": 0,
      "color": "#e0a96d",
      "opacity": 0.7
    },
    "circle3": {
      "enabled": false,
      "locked": true,
      "x": 590,
      "y": 330,
      "size": 225,
      "rotate": 0,
      "color": "#b04a4a",
      "opacity": 0.5
    },
    "leaf1": {
      "enabled": false,
      "locked": true,
      "x": 105,
      "y": 757,
      "size": 320,
      "rotate": -3,
      "color": "#2c3e35",
      "opacity": 0.82
    },
    "leaf2": {
      "enabled": false,
      "locked": true,
      "x": 180,
      "y": 720,
      "size": 280,
      "rotate": 15,
      "color": "#1e2a24",
      "opacity": 0.6
    }
  },
  "hardwarePositions": {
    "io": {
      "x": 420,
      "y": 204,
      "locked": true
    },
    "mode": {
      "x": 79,
      "y": 440,
      "locked": true
    },
    "driftVisual": {
      "x": 696,
      "y": 564,
      "locked": true
    },
    "rate": {
      "x": 132,
      "y": 721,
      "locked": true
    },
    "lfo": {
      "x": 230,
      "y": 625,
      "locked": true
    },
    "autoGain": {
      "x": 691,
      "y": 718,
      "locked": true
    }
  },
  "auraShapes": [
    {
      "id": "aura-1",
      "enabled": true,
      "x": 65,
      "y": 470,
      "size": 318,
      "blur": 0,
      "opacity": 1,
      "gradientAngle": 0,
      "color1": "#d5a981",
      "color2": "#eca57e",
      "isAnimated": true,
      "locked": true,
      "rotate": 0,
      "blobRadius": "51% 48% 61% 28% / 67% 69% 40% 31%"
    },
    {
      "id": "aura-1777944917420",
      "enabled": true,
      "locked": true,
      "x": 95,
      "y": 759,
      "size": 304,
      "rotate": 82.00053901898676,
      "opacity": 0,
      "blur": 0,
      "color1": "#324d39",
      "color2": "#2c4939",
      "gradientAngle": 295,
      "isAnimated": true,
      "blobRadius": "70% 62% 43% 75% / 67% 50% 33% 41%"
    },
    {
      "id": "aura-1777948941070",
      "enabled": true,
      "locked": true,
      "x": 295,
      "y": 822,
      "size": 50,
      "rotate": 11,
      "opacity": 0,
      "blur": 0,
      "color1": "#d77058",
      "color2": "#ca6c59",
      "gradientAngle": 343,
      "isAnimated": true,
      "blobRadius": "45% 65% 63% 36% / 56% 53% 53% 33%"
    },
    {
      "id": "aura-1777948979946",
      "enabled": true,
      "locked": true,
      "x": 622,
      "y": 731,
      "size": 621,
      "rotate": -2,
      "opacity": 0,
      "blur": 0,
      "color1": "#b04a4a",
      "color2": "#edd39a",
      "gradientAngle": 182,
      "isAnimated": true,
      "blobRadius": "51% 27% 59% 55% / 56% 27% 64% 33%"
    },
    {
      "id": "aura-1778074211761",
      "enabled": true,
      "locked": true,
      "x": 633,
      "y": 720,
      "size": 641,
      "rotate": 193,
      "opacity": 0,
      "blur": 0,
      "color1": "#de6c58",
      "color2": "#de6c59",
      "gradientAngle": 114,
      "isAnimated": true,
      "blobRadius": "41% 29% 68% 42% / 33% 59% 50% 61%"
    },
    {
      "id": "aura-1778074515921",
      "enabled": true,
      "locked": true,
      "x": 658,
      "y": 714,
      "size": 634,
      "rotate": -38,
      "opacity": 0.97,
      "blur": 0,
      "color1": "#de6c59",
      "color2": "#de7058",
      "gradientAngle": 360,
      "isAnimated": true,
      "blobRadius": "38% 70% 60% 56% / 26% 64% 40% 72%"
    }
  ],
  "ioScaleStyle": 6,
  "bottomSectionStyle": 0,
  "readoutStyleIndex": 5,
  "saturationMode": 0,
  "saturationStyle": 0
};

Object.assign(CODE_DEFAULT_DESIGN, {
  "power": true,
  "input": 50,
  "output": 50,
  "ioLinkStyle": "fiberCoralCenter",
  "ioLinked": false,
  "drift": 29.875000000000025,
  "spread": 0,
  "character": 100,
  "sweeten": 0,
  "biasHF": 0,
  "noise": 0,
  "mix": 50,
  "rate": 27.286376953124986,
  "depth": 100,
  "stereoPhase": 100,
  "mode": "vintage",
  "lfoEnabled": true,
  "lfoSync": false,
  "lfoShape": 0,
  "lfoSyncDiv": 6,
  "currentPreset": 9,
  "frameStyle": 3,
  "modeStyle": 13,
  "knobStyle": 6,
  "mixKnobStyle": 0,
  "smallKnobRingEnabled": true,
  "centerDialStyle": 1,
  "middleKnobStyle": 5,
  "centerDialSurfaceStyle": 14,
  "centerDialGrooveStyle": 0,
  "centerDialMarkStyle": 0,
  "centerDialNumberStyle": 0,
  "centerDialCirclesEnabled": true,
  "centerDialNumbersEnabled": true,
  "centerDialGuideRings": {
    "large": {
      "enabled": true,
      "locked": true,
      "size": 245
    },
    "small": {
      "enabled": true,
      "locked": true,
      "size": 161
    }
  },
  "spreadPointerStyle": 0,
  "driftAnimation": 13,
  "bgIndex": 3,
  "showOutputs": true,
  "parallelCables": true,
  "showStems": false,
  "showFerns": false,
  "faceTextureEnabled": true,
  "faceTextureStyle": 0,
  "faceTextureOpacity": 30,
  "panelFaceColor": "#935748",
  "useDefaultPanelFaceColor": true,
  "brandTextStyle": 1,
  "vintageLogoColor": "#e66a53",
  "polarisLogoColor": "#e66a53",
  "knobFlutterFilledColors": {
    "highlight": "#ffc0a4",
    "mid": "#e36f55",
    "tail": "#7e3028"
  },
  "screwsEnabled": true,
  "screwStyle": 2,
  "lfoImageState": {
    "enabled": true,
    "locked": true,
    "x": 131,
    "y": 710,
    "size": 155,
    "rotate": 6
  },
  "sakuraImageState": {
    "sakura": {
      "enabled": true,
      "x": 841,
      "y": 277,
      "size": 300,
      "rotate": 6
    },
    "sakura2": {
      "enabled": true,
      "x": 8,
      "y": 271,
      "size": 335,
      "rotate": 1
    },
    "sakura3": {
      "enabled": true,
      "x": 872,
      "y": 774,
      "size": 338,
      "rotate": 34
    }
  },
  "decorativeCircles": {
    "circle1": {
      "enabled": false,
      "locked": true,
      "x": 635,
      "y": 777,
      "size": 733,
      "rotate": 0,
      "color": "#e66a53",
      "opacity": 0.92
    },
    "circle2": {
      "enabled": false,
      "locked": true,
      "x": 59,
      "y": 504,
      "size": 334,
      "rotate": 0,
      "color": "#e0a96d",
      "opacity": 0.7
    },
    "circle3": {
      "enabled": false,
      "locked": true,
      "x": 590,
      "y": 330,
      "size": 225,
      "rotate": 0,
      "color": "#b04a4a",
      "opacity": 0.5
    },
    "leaf1": {
      "enabled": false,
      "locked": true,
      "x": 105,
      "y": 757,
      "size": 320,
      "rotate": -3,
      "color": "#2c3e35",
      "opacity": 0.82
    },
    "leaf2": {
      "enabled": false,
      "locked": true,
      "x": 180,
      "y": 720,
      "size": 280,
      "rotate": 15,
      "color": "#1e2a24",
      "opacity": 0.6
    }
  },
  "hardwarePositions": {
    "io": {
      "x": 420,
      "y": 204,
      "locked": true
    },
    "mode": {
      "x": 79,
      "y": 440,
      "locked": true
    },
    "driftVisual": {
      "x": 696,
      "y": 564,
      "locked": true
    },
    "rate": {
      "x": 132,
      "y": 721,
      "locked": true
    },
    "lfo": {
      "x": 230,
      "y": 625,
      "locked": true
    },
    "autoGain": {
      "x": 691,
      "y": 718,
      "locked": true
    }
  },
  "auraShapes": [
    {
      "id": "aura-1",
      "enabled": true,
      "x": 65,
      "y": 470,
      "size": 318,
      "blur": 0,
      "opacity": 1,
      "gradientAngle": 0,
      "color1": "#d5a981",
      "color2": "#eca57e",
      "isAnimated": true,
      "locked": true,
      "rotate": 0,
      "blobRadius": "51% 48% 61% 28% / 67% 69% 40% 31%"
    },
    {
      "id": "aura-1777944917420",
      "enabled": true,
      "locked": true,
      "x": 24,
      "y": 588,
      "size": 782,
      "rotate": 27,
      "opacity": 0.2,
      "blur": 0,
      "color1": "#623628",
      "color2": "#e2d1c0",
      "gradientAngle": 295,
      "isAnimated": true,
      "blobRadius": "70% 62% 43% 75% / 67% 50% 33% 41%"
    },
    {
      "id": "aura-1777948941070",
      "enabled": true,
      "locked": true,
      "x": 926,
      "y": -138,
      "size": 742,
      "rotate": 11,
      "opacity": 0,
      "blur": 0,
      "color1": "#2d2725",
      "color2": "#201d1d",
      "gradientAngle": 343,
      "isAnimated": true,
      "blobRadius": "45% 65% 63% 36% / 56% 53% 53% 33%"
    },
    {
      "id": "aura-1777948979946",
      "enabled": true,
      "locked": true,
      "x": 622,
      "y": 731,
      "size": 621,
      "rotate": -2,
      "opacity": 0,
      "blur": 0,
      "color1": "#b04a4a",
      "color2": "#edd39a",
      "gradientAngle": 182,
      "isAnimated": true,
      "blobRadius": "51% 27% 59% 55% / 56% 27% 64% 33%"
    },
    {
      "id": "aura-1778074211761",
      "enabled": true,
      "locked": true,
      "x": 630,
      "y": 742,
      "size": 698,
      "rotate": 193,
      "opacity": 0,
      "blur": 0,
      "color1": "#de6c58",
      "color2": "#de6c59",
      "gradientAngle": 114,
      "isAnimated": true,
      "blobRadius": "41% 29% 68% 42% / 33% 59% 50% 61%"
    },
    {
      "id": "aura-1778074515921",
      "enabled": true,
      "locked": true,
      "x": 682,
      "y": 727,
      "size": 692,
      "rotate": -38,
      "opacity": 1,
      "blur": 0,
      "color1": "#97473b",
      "color2": "#935a4d",
      "gradientAngle": 360,
      "isAnimated": true,
      "blobRadius": "38% 70% 60% 56% / 26% 64% 40% 72%"
    },
    {
      "id": "aura-1779007816614",
      "enabled": true,
      "locked": true,
      "x": 189,
      "y": -277,
      "size": 826,
      "rotate": 185.02305981078567,
      "opacity": 0,
      "blur": 0,
      "color1": "#634c36",
      "color2": "#d17261",
      "gradientAngle": 174,
      "isAnimated": true,
      "blobRadius": "50% 27% 26% 49% / 38% 41% 48% 67%"
    },
    {
      "id": "aura-1779007900426",
      "enabled": true,
      "locked": true,
      "x": 1084,
      "y": -67,
      "size": 895,
      "rotate": 101.3313096051421,
      "opacity": 0,
      "blur": 0,
      "color1": "#be8b50",
      "color2": "#b05e4a",
      "gradientAngle": 185,
      "isAnimated": true,
      "blobRadius": "33% 30% 42% 46% / 51% 74% 55% 56%"
    }
  ],
  "ioScaleStyle": 6,
  "bottomSectionStyle": 0,
  "readoutStyleIndex": 5,
  "saturationMode": 0,
  "saturationStyle": 0
});

Object.assign(CODE_DEFAULT_DESIGN, {
  "power": true,
  "input": 50,
  "output": 50,
  "ioLinkStyle": "fiberCoralCenter",
  "ioLinked": false,
  "drift": 29.634375,
  "spread": 0,
  "character": 100,
  "sweeten": 0,
  "biasHF": 0,
  "noise": 0,
  "mix": 100,
  "rate": 27.61875000000001,
  "depth": 0,
  "stereoPhase": 0,
  "depthDisplayStyle": 0,
  "phaseDisplayStyle": 0,
  "spreadDisplayStyle": 0,
  "noiseDisplayStyle": 0,
  "mode": "vintage",
  "lfoEnabled": true,
  "lfoSync": false,
  "lfoShape": 0,
  "lfoSyncDiv": 6,
  "currentPreset": 8,
  "frameStyle": 3,
  "panelDepthStyle": 0,
  "objectContactShadowStyle": 0,
  "panelLightingStyle": 0,
  "panelSurfaceTextureStyle": 0,
  "modeStyle": 13,
  "knobStyle": 7,
  "mixKnobStyle": 2,
  "smallKnobRingEnabled": true,
  "centerDialStyle": 1,
  "middleKnobStyle": 9,
  "centerDialSurfaceStyle": 15,
  "centerDialGrooveStyle": 0,
  "centerDialMarkStyle": 0,
  "centerDialNumberStyle": 0,
  "centerDialCirclesEnabled": true,
  "centerDialNumbersEnabled": true,
  "centerDialGuideRings": {
    "large": {
      "enabled": true,
      "locked": true,
      "size": 245
    },
    "small": {
      "enabled": true,
      "locked": true,
      "size": 161
    }
  },
  "spreadPointerStyle": 0,
  "driftAnimation": 14,
  "bgIndex": 3,
  "customBackgroundColor": "#918676",
  "showOutputs": true,
  "parallelCables": true,
  "showStems": false,
  "showFerns": false,
  "faceTextureEnabled": true,
  "faceTextureStyle": 0,
  "faceTextureOpacity": 29,
  "faceTextureBlendMode": "multiply",
  "faceTextureScale": 100,
  "panelFaceColor": "#e2d4c6",
  "useDefaultPanelFaceColor": false,
  "brandTextStyle": 1,
  "vintageLogoColor": "#7f3629",
  "polarisLogoColor": "#7f362e",
  "knobFlutterFilledColors": {
    "highlight": "#e9af96",
    "mid": "#9a5242",
    "tail": "#782a21"
  },
  "originalCopperTuning": {
    "ringInset": 8,
    "darkMetalColor": "#a88842",
    "lightMetalColor": "#edd39a",
    "baseOuterShadowOpacity": 0.5,
    "baseInnerHighlightOpacity": 0.9,
    "baseInnerShadowOpacity": 0.6,
    "overlayDarkOpacity": 0.4,
    "overlayLightOpacity": 0.2,
    "overlayInnerShadowOpacity": 0.8,
    "overlayOuterHighlightOpacity": 0.5
  },
  "agedChampagneBrassTuning": {
    "ringInset": 7.8,
    "darkMetalColor": "#716047",
    "midMetalColor": "#a79072",
    "lightMetalColor": "#bdab84",
    "faceHighlightOpacity": 0.38,
    "faceShadowOpacity": 0.16,
    "baseOuterShadowOpacity": 0.54,
    "baseInnerHighlightOpacity": 0.32,
    "baseInnerShadowOpacity": 0.58,
    "ringBorderOpacity": 0.29,
    "ringHighlightOpacity": 0.11,
    "ringShadowOpacity": 0.32,
    "sheenOpacity": 0.25
  },
  "smokedChampagneBoldCleanTuning": {
    "ringInset": 8,
    "darkMetalColor": "#6e6349",
    "midMetalColor": "#b09b78",
    "lightMetalColor": "#c0a887",
    "faceHighlightOpacity": 0.39,
    "faceShadowOpacity": 0.18,
    "baseOuterShadowOpacity": 0.52,
    "baseInnerHighlightOpacity": 0.32,
    "baseInnerShadowOpacity": 0.5,
    "ringBorderOpacity": 0.28,
    "ringHighlightOpacity": 0.12,
    "ringShadowOpacity": 0.36,
    "sheenOpacity": 0.22
  },
  "powerSwitchTuning": {
    "bodyRadius": 6,
    "insertTopColor": "#d9bb92",
    "insertBottomColor": "#9b8059"
  },
  "screwsEnabled": false,
  "screwStyle": 2,
  "lfoImageState": {
    "enabled": true,
    "locked": true,
    "x": 131,
    "y": 712,
    "size": 155,
    "rotate": 6
  },
  "sakuraImageState": {
    "sakura": {
      "enabled": true,
      "x": 841,
      "y": 277,
      "size": 300,
      "rotate": 6
    },
    "sakura2": {
      "enabled": true,
      "x": 8,
      "y": 266,
      "size": 335,
      "rotate": 1
    },
    "sakura3": {
      "enabled": true,
      "x": 872,
      "y": 774,
      "size": 338,
      "rotate": 34
    }
  },
  "decorativeCircles": {
    "circle1": {
      "enabled": false,
      "locked": true,
      "x": 635,
      "y": 777,
      "size": 733,
      "rotate": 0,
      "color": "#e66a53",
      "opacity": 0.92
    },
    "circle2": {
      "enabled": false,
      "locked": true,
      "x": 59,
      "y": 504,
      "size": 334,
      "rotate": 0,
      "color": "#e0a96d",
      "opacity": 0.7
    },
    "circle3": {
      "enabled": false,
      "locked": true,
      "x": 590,
      "y": 330,
      "size": 225,
      "rotate": 0,
      "color": "#b04a4a",
      "opacity": 0.5
    },
    "leaf1": {
      "enabled": false,
      "locked": true,
      "x": 105,
      "y": 757,
      "size": 320,
      "rotate": -3,
      "color": "#2c3e35",
      "opacity": 0.82
    },
    "leaf2": {
      "enabled": false,
      "locked": true,
      "x": 180,
      "y": 720,
      "size": 280,
      "rotate": 15,
      "color": "#1e2a24",
      "opacity": 0.6
    }
  },
  "hardwarePositions": {
    "io": {
      "x": 426,
      "y": 204,
      "locked": true
    },
    "mode": {
      "x": 79,
      "y": 440,
      "locked": true
    },
    "driftVisual": {
      "x": 696,
      "y": 564,
      "locked": true
    },
    "rate": {
      "x": 133,
      "y": 722,
      "locked": true
    },
    "lfo": {
      "x": 230,
      "y": 625,
      "locked": true
    },
    "autoGain": {
      "x": 680,
      "y": 722,
      "locked": true
    }
  },
  "auraShapes": [
    {
      "id": "aura-1779077140857",
      "enabled": true,
      "x": 65,
      "y": 470,
      "size": 314,
      "blur": 0,
      "opacity": 0,
      "gradientAngle": 0,
      "color1": "#d5a981",
      "color2": "#eca57e",
      "isAnimated": true,
      "locked": true,
      "rotate": 0,
      "blobRadius": "51% 48% 61% 28% / 67% 69% 40% 31%",
      "outlineEnabled": false,
      "outlineWidth": 10,
      "outlineColor": "#f1d8c5",
      "outlineOpacity": 0.8
    },
    {
      "id": "aura-1777944917420",
      "enabled": true,
      "locked": true,
      "x": 24,
      "y": 588,
      "size": 885,
      "rotate": 27,
      "opacity": 0.12,
      "blur": 150,
      "color1": "#623628",
      "color2": "#e2d1c0",
      "gradientAngle": 295,
      "isAnimated": true,
      "blobRadius": "70% 62% 43% 75% / 67% 50% 33% 41%"
    },
    {
      "id": "aura-1777948979946",
      "enabled": true,
      "locked": true,
      "x": 622,
      "y": 731,
      "size": 621,
      "rotate": -2,
      "opacity": 0,
      "blur": 0,
      "color1": "#b04a4a",
      "color2": "#edd39a",
      "gradientAngle": 182,
      "isAnimated": true,
      "blobRadius": "51% 27% 59% 55% / 56% 27% 64% 33%"
    },
    {
      "id": "aura-1778074515921",
      "enabled": true,
      "locked": true,
      "x": 749,
      "y": 735,
      "size": 805,
      "rotate": -38,
      "opacity": 0,
      "blur": 0,
      "color1": "#9a493c",
      "color2": "#9b594b",
      "gradientAngle": 360,
      "isAnimated": true,
      "blobRadius": "38% 70% 60% 56% / 26% 64% 40% 72%",
      "outlineEnabled": false,
      "outlineWidth": 10,
      "outlineColor": "#d6cdb6",
      "outlineOpacity": 0.25
    },
    {
      "id": "aura-1779053759249",
      "enabled": true,
      "locked": true,
      "x": 740,
      "y": -449,
      "size": 1800,
      "rotate": 164.6706919575618,
      "opacity": 0,
      "blur": 0,
      "color1": "#e5ddcc",
      "color2": "#e4d7c4",
      "gradientAngle": 114,
      "isAnimated": true,
      "blobRadius": "38% 73% 64% 52% / 51% 48% 42% 31%",
      "outlineEnabled": false,
      "outlineColor": "#9a574c",
      "outlineWidth": 14,
      "outlineOpacity": 0.08,
      "outlineBlur": 0
    },
    {
      "id": "aura-1779078414844",
      "enabled": true,
      "locked": true,
      "x": 772,
      "y": -463,
      "size": 1800,
      "rotate": 164.6706919575618,
      "opacity": 0.6,
      "blur": 110,
      "color1": "#e5ddce",
      "color2": "#e4d7c4",
      "gradientAngle": 114,
      "isAnimated": true,
      "blobRadius": "38% 73% 64% 52% / 51% 48% 42% 31%",
      "outlineEnabled": false,
      "outlineColor": "#9a574c",
      "outlineWidth": 14,
      "outlineOpacity": 0.1,
      "outlineBlur": 0
    },
    {
      "id": "aura-1779077395352",
      "enabled": true,
      "locked": true,
      "x": 723,
      "y": 751,
      "size": 764,
      "rotate": -38,
      "opacity": 0,
      "blur": 0,
      "color1": "#9a493c",
      "color2": "#9b594b",
      "gradientAngle": 360,
      "isAnimated": true,
      "blobRadius": "38% 70% 60% 56% / 26% 64% 40% 72%",
      "outlineEnabled": false,
      "outlineWidth": 12,
      "outlineColor": "#d6cdb6",
      "outlineOpacity": 0.28
    },
    {
      "id": "aura-1779079657594",
      "enabled": true,
      "locked": true,
      "x": 639,
      "y": 770,
      "size": 742,
      "rotate": -90,
      "opacity": 1,
      "blur": 0,
      "color1": "#9a493c",
      "color2": "#9b594b",
      "gradientAngle": 345,
      "isAnimated": true,
      "blobRadius": "45% 69% 32% 48% / 72% 74% 61% 66%",
      "outlineEnabled": true,
      "outlineWidth": 11,
      "outlineColor": "#d6cdb6",
      "outlineOpacity": 0.28
    },
    {
      "id": "aura-1779082464726",
      "enabled": true,
      "locked": true,
      "x": 360,
      "y": 844,
      "size": 548,
      "rotate": 46,
      "opacity": 0,
      "blur": 0,
      "color1": "#d3bdab",
      "color2": "#c8b9a5",
      "gradientAngle": 327,
      "isAnimated": true,
      "blobRadius": "42% 71% 29% 60% / 31% 36% 56% 52%",
      "outlineEnabled": false,
      "outlineColor": "#e66a53",
      "outlineWidth": 8,
      "outlineOpacity": 1,
      "outlineBlur": 0
    },
    {
      "id": "aura-1779054599532",
      "enabled": true,
      "x": 73,
      "y": 463,
      "size": 314,
      "blur": 0,
      "opacity": 1,
      "gradientAngle": 360,
      "color1": "#b8856f",
      "color2": "#c49d82",
      "isAnimated": true,
      "locked": true,
      "rotate": 0,
      "blobRadius": "51% 48% 61% 28% / 67% 69% 40% 31%",
      "outlineEnabled": true,
      "outlineWidth": 11,
      "outlineColor": "#e7d9d0",
      "outlineOpacity": 0.34,
      "outlineBlur": 0
    }
  ],
  "ioScaleStyle": 6,
  "bottomSectionStyle": 0,
  "readoutStyleIndex": 5,
  "topBarStyle": 0,
  "topBarCustomStyles": [
    {
      "barColor": "#1d1b1b",
      "outlineColor": "#2c2321",
      "outlineWidth": 2,
      "dropdownColor": "#070a0a",
      "selectedRowColor": "#202624",
      "hoverRowColor": "#aa5041",
      "textColor": "#f8dbbe",
      "selectedTextColor": "#ead2a4",
      "hoverTextColor": "#111111",
      "mutedTextColor": "#bdb4b2",
      "brandColor": "#a6503a",
      "buttonColor": "#1a1514",
      "activeColor": "#9a4f3c",
      "copperActiveColor": "#b87333"
    },
    {
      "barColor": "#d8c29a",
      "outlineColor": "#d0b990",
      "outlineWidth": 1,
      "dropdownColor": "#ead7b2",
      "selectedRowColor": "#8b5a35",
      "hoverRowColor": "#c87948",
      "textColor": "#30271e",
      "selectedTextColor": "#edcf88",
      "hoverTextColor": "#fff8ea",
      "mutedTextColor": "#79664b",
      "brandColor": "#6f4a2f",
      "buttonColor": "#fff0c9",
      "activeColor": "#8b5a35",
      "copperActiveColor": "#b87333"
    }
  ],
  "globalMastering": {
    "enabled": true,
    "studioDim": {
      "enabled": true,
      "opacity": 2,
      "color": "#050403",
      "x": 45,
      "y": 33,
      "size": 149,
      "softness": 79
    },
    "light": {
      "enabled": true,
      "x": 10,
      "y": 2,
      "intensity": 1,
      "size": 48,
      "warmth": 100,
      "color": "#fff2cf"
    },
    "vignette": {
      "enabled": false,
      "strength": 22,
      "size": 68,
      "softness": 45,
      "color": "#060403"
    },
    "grade": {
      "enabled": false,
      "warmth": 51,
      "contrast": 71,
      "saturation": 28,
      "lift": 10,
      "fade": 0,
      "opacity": 1,
      "tint": "#9e7961"
    },
    "curves": {
      "enabled": false,
      "channels": {
        "rgb": [
          { "x": 0, "y": 0 },
          { "x": 0.25, "y": 0.25 },
          { "x": 0.5, "y": 0.5 },
          { "x": 0.75, "y": 0.75 },
          { "x": 1, "y": 1 }
        ],
        "r": [
          { "x": 0, "y": 0 },
          { "x": 0.25, "y": 0.25 },
          { "x": 0.5, "y": 0.5 },
          { "x": 0.75, "y": 0.75 },
          { "x": 1, "y": 1 }
        ],
        "g": [
          { "x": 0, "y": 0 },
          { "x": 0.25, "y": 0.25 },
          { "x": 0.5, "y": 0.5 },
          { "x": 0.75, "y": 0.75 },
          { "x": 1, "y": 1 }
        ],
        "b": [
          { "x": 0, "y": 0 },
          { "x": 0.25, "y": 0.25 },
          { "x": 0.5, "y": 0.5 },
          { "x": 0.75, "y": 0.75 },
          { "x": 1, "y": 1 }
        ]
      }
    },
    "shadowGlue": {
      "enabled": true,
      "opacity": 1,
      "x": 66,
      "y": 100,
      "size": 62,
      "blur": 0,
      "color": "#120906"
    },
    "bloom": {
      "enabled": false,
      "opacity": 0,
      "size": 58,
      "blur": 90,
      "color": "#dd785f"
    },
    "grain": {
      "enabled": false,
      "opacity": 2,
      "scale": 3,
      "contrast": 0,
      "tone": 44,
      "hold": 50,
      "shadow": 2,
      "highlight": 0
    },
    "edgeWash": {
      "enabled": false,
      "opacity": 1,
      "angle": 233,
      "color": "#20100b"
    }
  },
  "depthModel": {
    "enabled": true,
    "preset": 1,
    "shadowAngle": 57,
    "lightHeight": 85,
    "heightScale": 55,
    "contactStrength": 70,
    "castStrength": 70,
    "softness": 48,
    "opacity": 48,
    "heights": {
      "smallKnobs": 1,
      "bigDial": 16,
      "modules": 11,
      "slabs": 5,
      "buttons": 10
    }
  },
  "centerDepthModel": {
    "enabled": true,
    "shadowAngle": 56,
    "height": 1,
    "distance": 28,
    "contactStrength": 38,
    "castStrength": 28,
    "softness": 50,
    "opacity": 45,
    "size": 90,
    "x": -22,
    "y": -40
  },
  "hqMode": false,
  "cableToneEnabled": false,
  "filterPole": 24,
  "saturationMode": 0,
  "saturationStyle": 0,
  "showWabiSabi": false
});


const textureDataUrl = (svg) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
const RUBBER_MATTE_NOISE = textureDataUrl("<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='noise'><feTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(#noise)'/></svg>");

const FACE_TEXTURES = [
  {
    name: 'Studio Grain',
    backgroundImage: textureDataUrl('<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"><filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="2.0" numOctaves="4" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#noise)"/></svg>'),
    backgroundSize: '400px 400px',
    mixBlendMode: 'multiply'
  },
  {
    name: 'Paper Fiber',
    backgroundImage: `${textureDataUrl('<svg viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg"><filter id="paper"><feTurbulence type="fractalNoise" baseFrequency="0.75 0.16" numOctaves="5" seed="12" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#paper)" opacity="0.82"/></svg>')}, repeating-linear-gradient(18deg, rgba(91,68,44,0.06) 0px, rgba(91,68,44,0.06) 1px, transparent 1px, transparent 9px)`,
    backgroundSize: '320px 320px, 120px 120px',
    mixBlendMode: 'multiply'
  },
  {
    name: 'Linen Weave',
    backgroundImage: 'repeating-linear-gradient(0deg, rgba(76,58,40,0.09) 0px, rgba(76,58,40,0.09) 1px, transparent 1px, transparent 6px), repeating-linear-gradient(90deg, rgba(255,255,255,0.2) 0px, rgba(255,255,255,0.2) 1px, transparent 1px, transparent 7px)',
    backgroundSize: '42px 42px',
    mixBlendMode: 'multiply'
  },
  {
    name: 'Warm Pulp',
    backgroundImage: `${textureDataUrl('<svg viewBox="0 0 360 360" xmlns="http://www.w3.org/2000/svg"><filter id="pulp"><feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="5" seed="31"/><feComponentTransfer><feFuncA type="table" tableValues="0 0.22"/></feComponentTransfer></filter><rect width="100%" height="100%" filter="url(#pulp)"/></svg>')}, radial-gradient(circle at 30% 18%, rgba(230,106,83,0.22), transparent 34%), radial-gradient(circle at 70% 82%, rgba(212,175,55,0.18), transparent 38%)`,
    backgroundSize: '360px 360px, 850px 850px, 850px 850px',
    mixBlendMode: 'multiply'
  },
  {
    name: 'Brushed Plate',
    backgroundImage: `${textureDataUrl('<svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg"><filter id="brush"><feTurbulence type="fractalNoise" baseFrequency="0.9 0.035" numOctaves="3" seed="6" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#brush)" opacity="0.72"/></svg>')}, repeating-linear-gradient(90deg, rgba(0,0,0,0.07) 0px, rgba(0,0,0,0.07) 1px, transparent 1px, transparent 4px)`,
    backgroundSize: '240px 240px, 90px 90px',
    mixBlendMode: 'multiply'
  },
  {
    name: 'Dust Speckle',
    backgroundImage: textureDataUrl('<svg viewBox="0 0 260 260" xmlns="http://www.w3.org/2000/svg"><filter id="speckle"><feTurbulence type="fractalNoise" baseFrequency="1.35" numOctaves="2" seed="44"/><feColorMatrix type="matrix" values="0 0 0 0 0.22 0 0 0 0 0.18 0 0 0 0 0.12 0 0 0 1 0"/><feComponentTransfer><feFuncA type="discrete" tableValues="0 0 0 0.42"/></feComponentTransfer></filter><rect width="100%" height="100%" filter="url(#speckle)"/></svg>'),
    backgroundSize: '260px 260px',
    mixBlendMode: 'multiply'
  },
  {
    name: 'Leather Texture',
    backgroundImage: `url("${leatherTextureSrc}"), url("${leatherTextureSrc}"), url("${leatherTextureSrc}")`,
    backgroundSize: '300px auto, 300px auto, 300px auto',
    backgroundRepeat: 'repeat, repeat, repeat',
    backgroundPosition: '0 0, 150px 104px, 75px 52px',
    backgroundBlendMode: 'multiply, soft-light, overlay',
    mixBlendMode: 'multiply'
  },
  {
    name: 'Leather Texture 2',
    backgroundImage: `url("${leatherTexture2Src}"), url("${leatherTexture2Src}"), url("${leatherTexture2Src}")`,
    backgroundSize: '270px auto, 270px auto, 270px auto',
    backgroundRepeat: 'repeat, repeat, repeat',
    backgroundPosition: '0 0, 135px 92px, 68px 46px',
    backgroundBlendMode: 'multiply, soft-light, overlay',
    mixBlendMode: 'multiply'
  },
  {
    name: 'Fine Leather',
    backgroundImage: `url("${fineLeatherTextureSrc}"), url("${fineLeatherTextureSrc}"), url("${fineLeatherTextureSrc}")`,
    backgroundSize: '240px auto, 240px auto, 240px auto',
    backgroundRepeat: 'repeat, repeat, repeat',
    backgroundPosition: '0 0, 120px 80px, 60px 40px',
    backgroundBlendMode: 'multiply, soft-light, overlay',
    mixBlendMode: 'multiply'
  },
  {
    name: 'White Leather',
    backgroundImage: `url("${whiteLeatherTextureSrc}"), url("${whiteLeatherTextureSrc}"), url("${whiteLeatherTextureSrc}")`,
    backgroundSize: '240px auto, 240px auto, 240px auto',
    backgroundRepeat: 'repeat, repeat, repeat',
    backgroundPosition: '0 0, 120px 80px, 60px 40px',
    backgroundBlendMode: 'soft-light, overlay, multiply',
    mixBlendMode: 'soft-light'
  },
  {
    name: 'GPT Texture',
    backgroundImage: `url("${gptTextureSrc}"), url("${gptTextureSrc}"), url("${gptTextureSrc}")`,
    backgroundSize: '260px auto, 260px auto, 260px auto',
    backgroundRepeat: 'repeat, repeat, repeat',
    backgroundPosition: '0 0, 130px 88px, 65px 44px',
    backgroundBlendMode: 'overlay, soft-light, multiply',
    mixBlendMode: 'overlay'
  },
  {
    name: 'Mottled Wash',
    backgroundImage: textureDataUrl('<svg viewBox="0 0 420 420" xmlns="http://www.w3.org/2000/svg"><filter id="mottle"><feTurbulence type="fractalNoise" baseFrequency="0.026" numOctaves="6" seed="19"/><feGaussianBlur stdDeviation="1.2"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#mottle)" opacity="0.9"/></svg>'),
    backgroundSize: '420px 420px',
    mixBlendMode: 'soft-light'
  },
  {
    name: 'Fine Canvas',
    backgroundImage: 'repeating-linear-gradient(45deg, rgba(58,44,31,0.08) 0px, rgba(58,44,31,0.08) 1px, transparent 1px, transparent 5px), repeating-linear-gradient(-45deg, rgba(255,255,255,0.18) 0px, rgba(255,255,255,0.18) 1px, transparent 1px, transparent 6px)',
    backgroundSize: '38px 38px',
    mixBlendMode: 'multiply'
  },
  {
    name: 'Plate Patina',
    backgroundImage: `${textureDataUrl('<svg viewBox="0 0 380 380" xmlns="http://www.w3.org/2000/svg"><filter id="patina"><feTurbulence type="fractalNoise" baseFrequency="0.11" numOctaves="4" seed="28"/><feColorMatrix type="saturate" values="0.25"/></filter><rect width="100%" height="100%" filter="url(#patina)" opacity="0.68"/></svg>')}, radial-gradient(circle at 18% 24%, rgba(122,166,120,0.2), transparent 28%), radial-gradient(circle at 78% 62%, rgba(176,74,74,0.14), transparent 32%)`,
    backgroundSize: '380px 380px, 850px 850px, 850px 850px',
    mixBlendMode: 'multiply'
  }
];

const SCREW_STYLES = [
  {
    name: 'Reference Grey',
    size: 12,
    bg: '#4a4a4a',
    border: '#222',
    slot: '#111',
    slotRotate: 45,
    slotWidth: '70%',
    slotHeight: 1.5,
    opacity: 1,
    shadow: 'inset 0 2px 4px rgba(0,0,0,0.9), 0 1px 1px rgba(255,255,255,0.3)'
  },
  {
    name: 'Deep Graphite',
    size: 14,
    bg: '#333331',
    border: '#171615',
    slot: '#090909',
    slotRotate: -32,
    slotWidth: '68%',
    slotHeight: 1.7,
    opacity: 0.96,
    shadow: 'inset 0 2px 5px rgba(0,0,0,0.88), inset 0 -1px 1px rgba(255,255,255,0.08), 0 2px 2px rgba(0,0,0,0.22)'
  },
  {
    name: 'Warm Gunmetal',
    size: 14,
    bg: '#514b42',
    border: '#28231d',
    slot: '#17120e',
    slotRotate: 18,
    slotWidth: '66%',
    slotHeight: 1.6,
    opacity: 0.86,
    shadow: 'inset 0 2px 4px rgba(0,0,0,0.82), inset 0 -1px 2px rgba(255,230,190,0.1), 0 1px 1px rgba(255,255,255,0.18)'
  },
  {
    name: 'Aged Brass',
    size: 13,
    bg: '#8a6a32',
    border: '#3b2a10',
    slot: '#211708',
    slotRotate: 52,
    slotWidth: '64%',
    slotHeight: 1.5,
    opacity: 0.78,
    shadow: 'inset 0 2px 4px rgba(42,25,8,0.86), inset 0 -1px 2px rgba(255,235,170,0.18), 0 1px 1px rgba(255,255,255,0.22)'
  },
  {
    name: 'Black Oxide',
    size: 13,
    bg: '#1c1c1b',
    border: '#080808',
    slot: '#030303',
    slotRotate: -8,
    slotWidth: '72%',
    slotHeight: 1.6,
    opacity: 0.98,
    shadow: 'inset 0 2px 5px rgba(0,0,0,0.95), inset 0 -1px 1px rgba(255,255,255,0.06), 0 1px 1px rgba(255,255,255,0.12)'
  },
  {
    name: 'Soft Nickel',
    size: 13,
    bg: '#6a675e',
    border: '#2d2b27',
    slot: '#201f1c',
    slotRotate: 35,
    slotWidth: '62%',
    slotHeight: 1.4,
    opacity: 0.68,
    shadow: 'inset 0 2px 4px rgba(0,0,0,0.72), inset 0 -1px 2px rgba(255,255,255,0.16), 0 1px 1px rgba(255,255,255,0.2)'
  }
];

const ORGANIC_AURORA_VARIANTS = {
  3: {
    type: 'fractalNoise',
    numOctaves: 2,
    seedValues: '17;17;52;23;23',
    keyTimes: '0;0.66;0.75;0.88;1',
    channels: ['R', 'G'],
    axis: 'horizontal',
    cycle: (intensity, rate) => Math.max(1.02, 1.62 - intensity * 0.2 - rate / 270),
    frequency: (intensity) => `${(0.018 + intensity * 0.01).toFixed(3)} ${(0.082 + intensity * 0.032).toFixed(3)}`,
    restScale: (intensity) => 0.22 + intensity * 0.62,
    burstScale: (intensity) => 8 + intensity * 20,
    blur: (intensity) => 0.06 + intensity * 0.11
  }
};

const generateRandomBlob = () => {
  const r = () => Math.floor(Math.random() * 50) + 25; // 25% to 75%
  return `${r()}% ${100-r()}% ${r()}% ${100-r()}% / ${r()}% ${r()}% ${100-r()}% ${100-r()}%`;
};

const AURA_SHAPE_MAX_SIZE = 1800;

const DESIGN_DEFAULTS_KEY = 'vintage-drifter-current-default-v6';
const USER_PRESETS_KEY = 'vintage-drifter-user-presets-v1';

const createDefaultAuraShapes = () => CODE_DEFAULT_DESIGN.auraShapes.map(shape => ({ ...shape }));

const loadSavedDesignDefaults = () => {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(DESIGN_DEFAULTS_KEY) || '{}') || {};
  } catch {
    return {};
  }
};

const saveDesignDefaults = (state) => {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(DESIGN_DEFAULTS_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
};

const loadUserPresets = () => {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(USER_PRESETS_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveUserPresets = (presets) => {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(USER_PRESETS_KEY, JSON.stringify(presets));
    return true;
  } catch {
    return false;
  }
};

const USER_PRESET_SETTING_KEYS = [
  'power',
  'input',
  'output',
  'ioLinkStyle',
  'ioLinked',
  'drift',
  'spread',
  'character',
  'sweeten',
  'biasHF',
  'noise',
  'mix',
  'rate',
  'depth',
  'stereoPhase',
  'depthDisplayStyle',
  'phaseDisplayStyle',
  'spreadDisplayStyle',
  'noiseDisplayStyle',
  'mode',
  'lfoEnabled',
  'lfoSync',
  'lfoShape',
  'lfoSyncDiv',
  'saturationMode'
];

const pickUserPresetSettings = (settings = {}) => {
  const picked = {};
  USER_PRESET_SETTING_KEYS.forEach(key => {
    if (key in settings) picked[key] = settings[key];
  });
  return picked;
};

const EditableAuraShapes = ({ shapes, selectedId, setSelectedId, onUpdate, stageRef }) => {
  const getScale = () => {
    const rect = stageRef.current?.getBoundingClientRect();
    return rect ? rect.width / 850 : 1;
  };
  const getLocalPoint = (event) => {
    const rect = stageRef.current?.getBoundingClientRect();
    const scale = getScale();
    return {
      x: rect ? (event.clientX - rect.left) / scale : event.clientX,
      y: rect ? (event.clientY - rect.top) / scale : event.clientY
    };
  };
  const startEdit = (event, id, mode) => {
    const shape = shapes.find(s => s.id === id);
    if (!shape || shape.locked) return;
    event.preventDefault();
    event.stopPropagation();
    setSelectedId(id);
    const startClient = { x: event.clientX, y: event.clientY };
    const start = { ...shape };
    const handleMove = (moveEvent) => {
      const scale = getScale();
      if (mode === 'move') {
        onUpdate(id, {
          x: Math.round(start.x + (moveEvent.clientX - startClient.x) / scale),
          y: Math.round(start.y + (moveEvent.clientY - startClient.y) / scale)
        });
      }
      if (mode === 'resize') {
        const delta = ((moveEvent.clientX - startClient.x) + (moveEvent.clientY - startClient.y)) / scale;
        onUpdate(id, { size: Math.round(Math.max(24, Math.min(AURA_SHAPE_MAX_SIZE, start.size + delta))) });
      }
      if (mode === 'rotate') {
        const point = getLocalPoint(moveEvent);
        onUpdate(id, { rotate: Math.round(Math.atan2(point.y - start.y, point.x - start.x) * 180 / Math.PI + 90) });
      }
    };
    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  };

  return (
    <>
      {shapes.map((shape, index) => {
        if (!shape.enabled) return null;
        const selected = selectedId === shape.id && !shape.locked;
        return (
          <div
            key={shape.id}
            onPointerDown={event => startEdit(event, shape.id, 'move')}
            className={`absolute select-none ${shape.locked ? 'pointer-events-none' : 'cursor-move touch-none'}`}
            style={{
              left: shape.x - shape.size / 2,
              top: shape.y - shape.size / 2,
              width: shape.size,
              height: shape.size,
              zIndex: index + 1
            }}
          >
            <div
              className={`absolute inset-0 pointer-events-none transition-all duration-300 ${shape.isAnimated ? 'drift-aurora-sheet' : ''}`}
              style={{
                background: `linear-gradient(${shape.gradientAngle || 0}deg, ${shape.color1 || shape.color}, ${shape.color2 || shape.color})`,
                opacity: shape.opacity,
                filter: `blur(${shape.blur}px)`,
                borderRadius: shape.blobRadius,
                transform: `rotate(${shape.rotate}deg)`,
                transformOrigin: 'center'
              }}
            />
            {(shape.outlineEnabled && (shape.outlineWidth ?? 0) > 0) && (
              <div
                className="absolute inset-0 pointer-events-none transition-all duration-300"
                style={{
                  border: `${shape.outlineWidth}px solid ${shape.outlineColor || '#e66a53'}`,
                  borderRadius: shape.blobRadius,
                  filter: shape.outlineBlur ? `blur(${shape.outlineBlur}px)` : undefined,
                  opacity: shape.outlineOpacity ?? shape.opacity ?? 1,
                  transform: `rotate(${shape.rotate}deg)`,
                  transformOrigin: 'center'
                }}
              />
            )}
            {selected && (
              <>
                <div className="absolute -inset-4 rounded-full border border-white/40 border-dashed pointer-events-none" />
                <button
                  onPointerDown={event => startEdit(event, shape.id, 'resize')}
                  className="absolute -right-3 -bottom-3 h-6 w-6 rounded-full border-2 border-white bg-[#e66a53] shadow-lg cursor-nwse-resize z-50"
                />
                <button
                  onPointerDown={event => startEdit(event, shape.id, 'rotate')}
                  className="absolute left-1/2 -top-11 h-6 w-6 -translate-x-1/2 rounded-full border-2 border-white bg-[#d4af37] shadow-lg cursor-grab z-50"
                />
              </>
            )}
          </div>
        );
      })}
    </>
  );
};

const EditableHardwareWrapper = ({ id, x, y, locked, selected, onSelect, onUpdate, stageRef, children }) => {
  const getScale = () => {
    const rect = stageRef.current?.getBoundingClientRect();
    return rect ? rect.width / 850 : 1;
  };

  const startMove = (event) => {
    if (locked) return;
    event.preventDefault();
    event.stopPropagation();
    onSelect(id);
    
    const scale = getScale();
    const startX = x;
    const startY = y;
    const startClientX = event.clientX;
    const startClientY = event.clientY;

    const handleMove = (moveEvent) => {
      onUpdate(id, {
        x: Math.round(startX + (moveEvent.clientX - startClientX) / scale),
        y: Math.round(startY + (moveEvent.clientY - startClientY) / scale)
      });
    };

    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  };

  return (
    <div
      onPointerDown={startMove}
      className={`absolute select-none transition-shadow ${locked ? '' : 'cursor-move touch-none hover:ring-2 hover:ring-white/30 rounded-xl'}`}
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
        zIndex: selected ? 100 : id === 'lfo' ? 70 : id === 'io' ? 45 : 30,
      }}
    >
      {children}
      {!locked && selected && (
        <div className="absolute -inset-4 border-2 border-white/50 border-dashed rounded-2xl pointer-events-none" />
      )}
    </div>
  );
};

const CollapsibleSection = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="w-full border-b border-white/10 overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-white/90 hover:bg-white/5 transition-colors"
      >
        <span className="text-[13px] font-black tracking-[0.2em] uppercase">{title}</span>
        <span className={`text-[10px] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-6 py-6 flex flex-col gap-8 overflow-y-auto max-h-[500px] custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- Procedural Drift Animation Engine ---
const OriginalWobblyAura = ({ drift, spread, active, rate, originalFlutter = false }) => {
  const ring1Ref = useRef(null);
  const ring2Ref = useRef(null);
  const requestRef = useRef();
  const tRef = useRef(0);
  const isPerfectRef = useRef(false);
  const paramsRef = useRef({ drift, rate });
  useEffect(() => { paramsRef.current = { drift, rate }; }, [drift, rate]);

  useEffect(() => {
    let lastUpdate = 0;
    const loop = (timestamp) => {
      requestRef.current = requestAnimationFrame(loop);
      if (timestamp - lastUpdate < 30) return;
      lastUpdate = timestamp;
      const { drift, rate } = paramsRef.current;
      if (drift <= 0.1) {
        if (!isPerfectRef.current) {
          if (ring1Ref.current) ring1Ref.current.style.borderRadius = '50%';
          if (ring2Ref.current) ring2Ref.current.style.borderRadius = '50%';
          isPerfectRef.current = true;
        }
        return;
      }
      isPerfectRef.current = false;
      tRef.current += 0.03 * Math.max(0.5, rate / 20);
      const t = tRef.current;
      const w = drift / 100;
      const getWobble = (offset, scale) => {
        const b1 = 50 + (w * scale * Math.sin(t + offset));
        const b2 = 50 - (w * scale * 0.8 * Math.cos(t * 1.2 + offset));
        const b3 = 50 + (w * scale * 1.2 * Math.sin(t * 0.8 + offset));
        const b4 = 50 - (w * scale * Math.cos(t * 1.1 + offset));
        return `${b1}% ${100-b1}% ${b2}% ${100-b2}% / ${b3}% ${b4}% ${100-b4}% ${100-b3}%`;
      };
      if (ring1Ref.current && ring2Ref.current) {
        ring1Ref.current.style.borderRadius = getWobble(0, 12);
        ring2Ref.current.style.borderRadius = getWobble(2, 18);
      }
    };
    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  const animSpeed = Math.max(1, 10 - (rate / 10));
  const visualSpread = spread * 0.5;
  const spreadScaleX = 1 + (visualSpread / 166.6);
  const spreadScaleY = 1 + (visualSpread / 500);
  const intensity = Math.max(0.08, drift / 100);
  const flutterRestScale = originalFlutter ? 0.22 + intensity * 0.62 : 0;
  const flutterBurstScale = originalFlutter ? 8 + intensity * 20 : 0;
  const flutterBlur = 0.06 + intensity * 0.11;
  const flutterCycle = Math.max(1.02, 1.62 - intensity * 0.2 - rate / 270);
  const flutterFrequency = `${(0.018 + intensity * 0.01).toFixed(3)} ${(0.082 + intensity * 0.032).toFixed(3)}`;
  const flutterBegin = `-${(((Date.now() - FLUTTER_ANIMATION_EPOCH) / 1000) % flutterCycle).toFixed(3)}s`;

  return (
    <div className={`absolute inset-0 pointer-events-none transition-all duration-700 ease-out flex justify-center items-center ${active ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
      {originalFlutter && (
        <svg className="absolute w-0 h-0" aria-hidden="true" focusable="false">
          <defs>
            <filter id="driftOriginalFlutter" x="-40%" y="-40%" width="180%" height="180%" colorInterpolationFilters="sRGB">
              <feTurbulence type="fractalNoise" baseFrequency={flutterFrequency} numOctaves="2" seed="17" result="originalFlutterNoise">
                <animate attributeName="seed" values="17;17;52;23;23" keyTimes="0;0.66;0.75;0.88;1" dur={`${flutterCycle}s`} begin={flutterBegin} repeatCount="indefinite" />
              </feTurbulence>
              <feGaussianBlur in="originalFlutterNoise" stdDeviation={flutterBlur} result="softOriginalFlutterNoise" />
              <feColorMatrix
                in="softOriginalFlutterNoise"
                type="matrix"
                values="1 0 0 0 0  0 0 0 0 0.5  0 0 1 0 0  0 0 0 1 0"
                result="horizontalOriginalFlutterNoise"
              />
              <feDisplacementMap in="SourceGraphic" in2="horizontalOriginalFlutterNoise" scale={flutterRestScale} xChannelSelector="R" yChannelSelector="G">
                <animate
                  attributeName="scale"
                  values={`${flutterRestScale};${flutterRestScale};${flutterBurstScale};${flutterRestScale};${flutterRestScale}`}
                  keyTimes="0;0.66;0.75;0.88;1"
                  dur={`${flutterCycle}s`}
                  begin={flutterBegin}
                  repeatCount="indefinite"
                />
              </feDisplacementMap>
            </filter>
          </defs>
        </svg>
      )}
      <div className="absolute w-full h-full rounded-full blur-[60px] transition-transform duration-[45ms]" style={{ backgroundColor: '#e66a53', opacity: 0.15 + (drift/100)*0.1 + (spread/100)*0.15, transform: `translateX(-${visualSpread * 1.5}px) scaleX(${1 + visualSpread/200})` }} />
      <div className="absolute w-full h-full rounded-full blur-[60px] transition-transform duration-[45ms]" style={{ backgroundColor: '#edd39a', opacity: 0.15 + (drift/100)*0.1 + (spread/100)*0.15, transform: `translateX(${visualSpread * 1.5}px) scaleX(${1 + visualSpread/200})` }} />
      <div className="absolute w-[160%] h-[160%] flex justify-center items-center transition-transform duration-[45ms]" style={{ filter: originalFlutter ? 'url(#driftOriginalFlutter) drop-shadow(0 0 8px rgba(230,106,83,0.4))' : 'drop-shadow(0 0 8px rgba(230,106,83,0.4))', transform: `scaleX(${spreadScaleX}) scaleY(${spreadScaleY})` }}>
        <div className="absolute w-[85%] h-[85%] transition-transform mix-blend-screen" style={{ animation: `spin ${animSpeed * 2.5}s linear infinite` }}>
          <div ref={ring1Ref} className="w-full h-full border-[2.5px] border-[#e66a53] border-dashed opacity-80" style={{ borderRadius: '50%', transition: 'border-radius 0.1s ease-out' }} />
        </div>
        <div className="absolute w-[70%] h-[70%] transition-transform mix-blend-screen" style={{ filter: 'drop-shadow(0 0 6px #edd39a)', animation: `spin ${animSpeed * 1.8}s linear infinite reverse` }}>
          <div ref={ring2Ref} className="w-full h-full border-[2px] border-[#edd39a] opacity-90" style={{ borderRadius: '50%', transition: 'border-radius 0.1s ease-out' }} />
        </div>
      </div>
    </div>
  );
};

const KnobFlutterRing = ({ drift, active, rate, mode, color = '#e66a53', strokeWidth = 2.5, filled = false, sizeOffset = 0, filledColors = DEFAULT_KNOB_FLUTTER_FILLED_COLORS }) => {
  const ringRef = useRef(null);
  const requestRef = useRef();
  const tRef = useRef(0);
  const paramsRef = useRef({ drift, rate });
  useEffect(() => { paramsRef.current = { drift, rate }; }, [drift, rate]);

  useEffect(() => {
    let lastUpdate = 0;
    const loop = (timestamp) => {
      requestRef.current = requestAnimationFrame(loop);
      if (timestamp - lastUpdate < 30) return;
      lastUpdate = timestamp;
      const { drift, rate } = paramsRef.current;
      if (!ringRef.current) return;
      if (drift <= 0.1) {
        ringRef.current.style.borderRadius = '50%';
        return;
      }

      tRef.current += 0.03 * Math.max(0.5, rate / 20);
      const t = tRef.current;
      const w = drift / 100;
      const b1 = 50 + (w * 6.5 * Math.sin(t));
      const b2 = 50 - (w * 5.2 * Math.cos(t * 1.18));
      const b3 = 50 + (w * 7.8 * Math.sin(t * 0.86));
      const b4 = 50 - (w * 5.9 * Math.cos(t * 1.07));

      ringRef.current.style.borderRadius = `${b1}% ${100-b1}% ${b2}% ${100-b2}% / ${b3}% ${b4}% ${100-b4}% ${100-b3}%`;
    };
    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  const modeFreqMult = (mode === 'calm' || mode === 0) ? 2.8 : ((mode === 'vintage' || mode === 1) ? 1.8 : 1.0);
  const modeIntenseMult = (mode === 'calm' || mode === 0) ? 0.5 : ((mode === 'vintage' || mode === 1) ? 0.75 : 1.0);

  const intensity = Math.max(0.08, drift / 100);
  const flutterRestScale = filled ? (0.4 + intensity * 0.8) : (0.18 + intensity * 0.46);
  const flutterBurstScale = (filled ? (12 + intensity * 24) : (3.6 + intensity * 8.4)) * modeIntenseMult;
  const flutterBlur = 0.04 + intensity * 0.08;
  const flutterCycle = Math.max(1.02, (1.6 - intensity * 0.18 - rate / 285) * modeFreqMult);
  const flutterFrequency = `${(0.018 + intensity * 0.01).toFixed(3)} ${(0.082 + intensity * 0.03).toFixed(3)}`;
  const flutterBegin = `-${(((Date.now() - FLUTTER_ANIMATION_EPOCH) / 1000) % flutterCycle).toFixed(3)}s`;
  const filterId = filled 
    ? (strokeWidth < 2 ? 'driftKnobFlutterCoralThinFilled' : 'driftKnobFlutterCoralFilled') 
    : (strokeWidth < 2 ? 'driftKnobFlutterCoralThin' : 'driftKnobFlutterCoral');
  const spinDuration = `${Math.max(7.5, 16 - rate / 7)}s`;
  const baseSize = 240 + sizeOffset;
  const innerSize = 200 + sizeOffset;
  const travel = Math.min(1, drift / 100);
  const startAngle = 225; // Matches the knob's visual start (-135deg in CSS rotation is 225deg in conic-gradient)
  const sweepAngle = travel * 270;
  const filledHighlight = filledColors?.highlight || DEFAULT_KNOB_FLUTTER_FILLED_COLORS.highlight;
  const filledMid = filledColors?.mid || DEFAULT_KNOB_FLUTTER_FILLED_COLORS.mid;
  const filledTail = filledColors?.tail || DEFAULT_KNOB_FLUTTER_FILLED_COLORS.tail;

  return (
    <div 
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none overflow-hidden rounded-full transition-all duration-500 ease-out"
      style={{ 
        width: baseSize, 
        height: baseSize,
        opacity: active ? (filled ? 1 : 0.88) : 0,
        WebkitMaskImage: filled ? `conic-gradient(from ${startAngle}deg, transparent 0deg, #000 8deg, #000 ${Math.max(8, sweepAngle - 8)}deg, transparent ${sweepAngle}deg)` : 'none',
        maskImage: filled ? `conic-gradient(from ${startAngle}deg, transparent 0deg, #000 8deg, #000 ${Math.max(8, sweepAngle - 8)}deg, transparent ${sweepAngle}deg)` : 'none'
      }}
    >
      <svg className="absolute w-0 h-0" aria-hidden="true" focusable="false">
        <defs>
          <filter id={filterId} x="-40%" y="-40%" width="180%" height="180%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency={flutterFrequency} numOctaves="2" seed="17" result="knobFlutterNoise">
              <animate attributeName="seed" values="17;17;52;23;23" keyTimes="0;0.66;0.75;0.88;1" dur={`${flutterCycle}s`} begin={flutterBegin} repeatCount="indefinite" />
            </feTurbulence>
            <feGaussianBlur in="knobFlutterNoise" stdDeviation={flutterBlur} result="softKnobFlutterNoise" />
            <feColorMatrix
              in="softKnobFlutterNoise"
              type="matrix"
              values="1 0 0 0 0  0 0 0 0 0.5  0 0 1 0 0  0 0 0 1 0"
              result="horizontalKnobFlutterNoise"
            />
            <feDisplacementMap in="SourceGraphic" in2="horizontalKnobFlutterNoise" scale={flutterRestScale} xChannelSelector="R" yChannelSelector="G">
              <animate
                attributeName="scale"
                values={`${flutterRestScale};${flutterRestScale};${flutterBurstScale};${flutterRestScale};${flutterRestScale}`}
                keyTimes="0;0.66;0.75;0.88;1"
                dur={`${flutterCycle}s`}
                begin={flutterBegin}
                repeatCount="indefinite"
              />
            </feDisplacementMap>
          </filter>
        </defs>
      </svg>
      <div 
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${filled ? 'mix-blend-normal' : 'mix-blend-screen'}`}
        style={{ width: innerSize, height: innerSize }}
      >
        <div
          ref={ringRef}
          className="w-full h-full"
          style={{
            background: filled 
              ? `conic-gradient(from ${startAngle}deg, ${filledHighlight} 0deg, ${filledMid} ${sweepAngle * 0.52}deg, ${filledTail} ${sweepAngle}deg, transparent ${sweepAngle}deg)` 
              : 'transparent',
            border: filled ? 'none' : `${strokeWidth}px solid ${color}`,
            borderRadius: '50%',
            filter: `url(#${filterId}) drop-shadow(0 0 7.45px ${filled ? filledMid : color})`,
            opacity: filled ? 1.0 : (color === '#e66a53' ? 0.88 : 0.94),
            animation: filled ? 'none' : `spin ${spinDuration} linear infinite`,
            transition: 'border-radius 0.1s ease-out'
          }}
        />
      </div>
    </div>
  );
};

const KnobFlutterSpillLight = ({ drift, rate, animationStyle, filledColors = DEFAULT_KNOB_FLUTTER_FILLED_COLORS }) => {
  const spillEnabled = true;
  if (!spillEnabled) return null;

  const styleName = DRIFT_ANIMATION_STYLES[normalizeDriftAnimationStyle(animationStyle)] || DRIFT_ANIMATION_STYLES[0];
  if (styleName !== 'Knob Flutter Coral Filled') return null;

  const travel = Math.max(0, Math.min(1, drift / 100));
  if (travel <= 0.01) return null;

  const startAngle = 225;
  const sweepAngle = travel * 270;
  const fadeIn = Math.min(1, travel / 0.08);
  const spillOpacity = 0.038;
  const edgeOpacity = 0.064;
  const featherAngle = 30;
  const highlight = filledColors?.highlight || DEFAULT_KNOB_FLUTTER_FILLED_COLORS.highlight;
  const mid = filledColors?.mid || DEFAULT_KNOB_FLUTTER_FILLED_COLORS.mid;
  const tail = filledColors?.tail || DEFAULT_KNOB_FLUTTER_FILLED_COLORS.tail;
  const spillSpeed = `${Math.max(1.55, 3.45 - (Number(rate) || 0) / 55)}s`;

  return (
    <div
      className="knob-flutter-spill absolute inset-[4px] rounded-full pointer-events-none"
      style={{
        '--spill-speed': spillSpeed,
        background: `
          radial-gradient(circle at 18% 68%, ${hexToRgba(highlight, 0.052)} 0%, ${hexToRgba(mid, 0.032)} 14%, transparent 34%),
          conic-gradient(from ${startAngle}deg, ${hexToRgba(highlight, edgeOpacity * 0.62)} 0deg, ${hexToRgba(highlight, edgeOpacity)} 10deg, ${hexToRgba(mid, spillOpacity)} ${Math.max(12, sweepAngle * 0.46)}deg, ${hexToRgba(tail, spillOpacity * 0.46)} ${Math.max(13, sweepAngle)}deg, ${hexToRgba(tail, spillOpacity * 0.18)} ${Math.max(15, sweepAngle + featherAngle * 0.45)}deg, transparent ${Math.max(18, sweepAngle + featherAngle)}deg, transparent 360deg)
        `,
        WebkitMask: 'radial-gradient(circle, transparent 0 61%, rgba(0,0,0,0.2) 64%, rgba(0,0,0,0.78) 70%, rgba(0,0,0,0.42) 78%, transparent 87%)',
        mask: 'radial-gradient(circle, transparent 0 61%, rgba(0,0,0,0.2) 64%, rgba(0,0,0,0.78) 70%, rgba(0,0,0,0.42) 78%, transparent 87%)',
        mixBlendMode: 'screen',
        filter: 'blur(1.25px) saturate(1.06)',
        opacity: 0.32 * fadeIn
      }}
    />
  );
};

const KnobDriftExperiment = ({ drift, spread, active, rate, variant, knobFlutterFilledColors = DEFAULT_KNOB_FLUTTER_FILLED_COLORS }) => {
  const intensity = Math.max(0.08, drift / 100);
  const spreadIntensity = Math.max(0.08, spread / 100);
  const baseSpeed = Math.max(4.2, 14 - rate / 8);
  const fastSpeed = Math.max(2.7, baseSpeed * 0.62);
  const slowSpeed = baseSpeed * 1.45;
  const glowOpacity = active ? 0.24 + intensity * 0.42 : 0;
  const travel = Math.max(0, Math.min(1, drift / 100));
  const spreadTravel = Math.max(0, Math.min(1, spread / 100));
  const travelDegrees = travel * 270;
  const annulusMask = 'radial-gradient(circle, transparent 0 58%, #000 59% 91%, transparent 92%)';
  const softAnnulusMask = 'radial-gradient(circle, transparent 0 56%, #000 58% 89%, transparent 91%)';
  const stageStyle = {
    '--knob-drift-speed': `${baseSpeed}s`,
    '--knob-drift-speed-fast': `${fastSpeed}s`,
    '--knob-drift-speed-slow': `${slowSpeed}s`,
    '--knob-drift-opacity': glowOpacity
  };
  const inactiveScaleClass = variant === 'dualSmoothOuterRibbonSpreadOnly' ? 'scale-100' : 'scale-75';
  const stageClass = `absolute left-1/2 top-1/2 z-30 w-[236px] h-[236px] -translate-x-1/2 -translate-y-1/2 pointer-events-none overflow-hidden rounded-full transition-all duration-500 ease-out ${active ? 'opacity-100 scale-100' : `opacity-0 ${inactiveScaleClass}`}`;
  const normalizeAngle = (angle) => ((angle + 180) % 360 + 360) % 360 - 180;
  const travelProgressForAngle = (angle) => {
    const normalizedAngle = normalizeAngle(angle);
    if (normalizedAngle < -135 || normalizedAngle > 135) return null;
    return (normalizedAngle + 135) / 270;
  };
  const isTravelReached = (progress) => progress <= travel + 0.001;
  const reachedShadow = (extra = 0) => `0 0 ${5 + intensity * 7 + extra}px rgba(230,106,83,${0.34 + intensity * 0.4})`;
  const renderFineDriftNeedles = (count = 43) => (
    Array.from({ length: count }).map((_, i) => {
      const progress = i / (count - 1);
      const angle = -135 + progress * 270;
      const driftReached = progress <= travel + 0.001;
      const major = i % 7 === 0;
      return (
        <span
          key={`fine-${i}`}
          className="knob-drift-needle absolute left-1/2 top-1/2 rounded-full bg-[#e66a53]"
          style={{
            width: major ? 1.6 : 1,
            height: major ? 10 : 6,
            transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-75px)`,
            opacity: driftReached ? 0.38 + intensity * 0.44 : 0.06,
            boxShadow: driftReached
              ? `0 0 ${3.5 + intensity * 5.5}px rgba(230,106,83,${0.3 + intensity * 0.34})`
              : 'none',
            filter: driftReached ? `brightness(${1 + intensity * 0.55})` : 'brightness(0.5)'
          }}
        />
      );
    })
  );

  if (variant === 'comets' || variant === 'cometsFlutter') {
    const isFlutter = variant === 'cometsFlutter';
    const phaseFilterId = 'driftPhaseCometsFlutter';
    const phaseRestScale = 0.28 + intensity * 0.54;
    const phaseBurstScale = 7 + intensity * 15;
    const phaseBlur = 0.055 + intensity * 0.11;
    const phaseCycle = Math.max(1.04, 1.66 - intensity * 0.22 - rate / 285);
    const phaseFrequency = `${(0.019 + intensity * 0.01).toFixed(3)} ${(0.083 + intensity * 0.034).toFixed(3)}`;
    const phaseBegin = `-${(((Date.now() - FLUTTER_ANIMATION_EPOCH) / 1000) % phaseCycle).toFixed(3)}s`;
    return (
      <div className={stageClass} style={stageStyle}>
        {isFlutter && (
          <svg className="absolute w-0 h-0" aria-hidden="true" focusable="false">
            <defs>
              <filter id={phaseFilterId} x="-45%" y="-45%" width="190%" height="190%" colorInterpolationFilters="sRGB">
                <feTurbulence type="fractalNoise" baseFrequency={phaseFrequency} numOctaves="2" seed="29" result="phaseNoise">
                  <animate attributeName="seed" values="29;29;61;37;37" keyTimes="0;0.62;0.72;0.86;1" dur={`${phaseCycle}s`} begin={phaseBegin} repeatCount="indefinite" />
                </feTurbulence>
                <feGaussianBlur in="phaseNoise" stdDeviation={phaseBlur} result="softPhaseNoise" />
                <feColorMatrix
                  in="softPhaseNoise"
                  type="matrix"
                  values="1 0 0 0 0  0 0 0 0 0.45  0 0 1 0 0  0 0 0 1 0"
                  result="horizontalPhaseNoise"
                />
                <feDisplacementMap in="SourceGraphic" in2="horizontalPhaseNoise" scale={phaseRestScale} xChannelSelector="R" yChannelSelector="G">
                  <animate
                    attributeName="scale"
                    values={`${phaseRestScale};${phaseRestScale};${phaseBurstScale};${phaseRestScale};${phaseRestScale}`}
                    keyTimes="0;0.62;0.72;0.86;1"
                    dur={`${phaseCycle}s`}
                    begin={phaseBegin}
                    repeatCount="indefinite"
                  />
                </feDisplacementMap>
              </filter>
            </defs>
          </svg>
        )}
        <div
          className="knob-drift-spin absolute inset-0 rounded-full mix-blend-screen"
          style={{
            background: 'conic-gradient(from 12deg, transparent 0deg 28deg, rgba(230,106,83,0.92) 32deg 48deg, transparent 58deg 132deg, rgba(230,106,83,0.72) 138deg 151deg, transparent 164deg 254deg, rgba(230,106,83,0.5) 262deg 273deg, transparent 286deg 360deg)',
            WebkitMask: annulusMask,
            mask: annulusMask,
            filter: `${isFlutter ? `url(#${phaseFilterId}) ` : ''}drop-shadow(0 0 7px rgba(230,106,83,0.8))`,
            opacity: 0.56 + intensity * 0.28,
            animationDuration: 'var(--knob-drift-speed)'
          }}
        />
      </div>
    );
  }

  if (variant === 'needles') {
    return (
      <div className={stageClass} style={stageStyle}>
        <div
          className="absolute inset-[10px] rounded-full"
          style={{
            border: '1px solid rgba(230,106,83,0.42)',
            WebkitMask: softAnnulusMask,
            mask: softAnnulusMask,
            boxShadow: '0 0 12px rgba(230,106,83,0.14)'
          }}
        />
        {Array.from({ length: 18 }).map((_, i) => {
          const angle = i * 20;
          const progress = travelProgressForAngle(angle);
          const isReached = progress !== null && progress <= travel + 0.001;
          const baseOpacity = 0.18 + (i % 4) * 0.08;
          const opacity = isReached ? Math.min(0.9, baseOpacity + 0.3 + intensity * 0.28) : baseOpacity;
          return (
            <span
              key={i}
              className="knob-drift-needle absolute left-1/2 top-1/2 w-[2px] rounded-full bg-[#e66a53]"
              style={{
                height: i % 3 === 0 ? 22 : 13,
                transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-95px)`,
                opacity,
                boxShadow: isReached
                  ? `0 0 ${5 + intensity * 5}px rgba(230,106,83,${0.34 + intensity * 0.34})`
                  : '0 0 4px rgba(230,106,83,0.34)',
                filter: isReached ? `brightness(${1.05 + intensity * 0.5})` : 'brightness(0.82)'
              }}
            />
          );
        })}
      </div>
    );
  }

  if (variant === 'needlesArc') {
    const needleCount = 31;
    return (
      <div className={stageClass} style={stageStyle}>
        <div
          className="absolute inset-[10px] rounded-full"
          style={{
            border: '1px solid rgba(230,106,83,0.22)',
            WebkitMask: softAnnulusMask,
            mask: softAnnulusMask,
            boxShadow: '0 0 12px rgba(230,106,83,0.1)'
          }}
        />
        <div
          className="absolute inset-0 rounded-full mix-blend-screen transition-all duration-150"
          style={{
            background: `conic-gradient(from -135deg, rgba(230,106,83,0.38) 0deg, rgba(230,106,83,0.18) ${Math.max(0, travelDegrees - 3)}deg, transparent ${travelDegrees}deg 360deg)`,
            WebkitMask: annulusMask,
            mask: annulusMask,
            opacity: 0.22 + intensity * 0.32,
            filter: 'drop-shadow(0 0 8px rgba(230,106,83,0.42))'
          }}
        />
        {Array.from({ length: needleCount }).map((_, i) => {
          const progress = i / (needleCount - 1);
          const angle = -135 + progress * 270;
          const isReached = progress <= travel + 0.001;
          const major = i % 5 === 0;
          const brightness = isReached ? 0.52 + intensity * 0.42 : 0.16;
          return (
            <span
              key={i}
              className="knob-drift-needle absolute left-1/2 top-1/2 w-[2px] rounded-full bg-[#e66a53]"
              style={{
                height: major ? 24 : 14,
                transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-95px)`,
                opacity: brightness,
                boxShadow: isReached
                  ? `0 0 ${5 + intensity * 7}px rgba(230,106,83,${0.35 + intensity * 0.4})`
                  : '0 0 3px rgba(230,106,83,0.22)',
                filter: isReached ? `brightness(${1.05 + intensity * 0.75})` : 'brightness(0.62)'
              }}
            />
          );
        })}
      </div>
    );
  }

  if (variant === 'needlesFine') {
    const needleCount = 43;
    return (
      <div className={stageClass} style={stageStyle}>
        {Array.from({ length: needleCount }).map((_, i) => {
          const progress = i / (needleCount - 1);
          const angle = -135 + progress * 270;
          const isReached = isTravelReached(progress);
          const major = i % 7 === 0;
          return (
            <span
              key={i}
              className="knob-drift-needle absolute left-1/2 top-1/2 rounded-full bg-[#e66a53]"
              style={{
                width: major ? 1.6 : 1,
                height: major ? 20 : 10,
                transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-96px)`,
                opacity: isReached ? 0.44 + intensity * 0.42 : 0.12,
                boxShadow: isReached ? reachedShadow(1) : '0 0 2px rgba(230,106,83,0.22)',
                filter: isReached ? `brightness(${1.05 + intensity * 0.6})` : 'brightness(0.58)'
              }}
            />
          );
        })}
      </div>
    );
  }

  if (variant === 'needlesMeter') {
    const needleCount = 25;
    return (
      <div className={stageClass} style={stageStyle}>
        <div
          className="absolute inset-0 rounded-full mix-blend-screen"
          style={{
            background: `conic-gradient(from -135deg, rgba(230,106,83,0.24) 0deg, rgba(230,106,83,0.13) ${Math.max(0, travelDegrees - 2)}deg, transparent ${travelDegrees}deg 360deg)`,
            WebkitMask: 'radial-gradient(circle, transparent 0 63%, #000 64% 87%, transparent 88%)',
            mask: 'radial-gradient(circle, transparent 0 63%, #000 64% 87%, transparent 88%)',
            opacity: 0.24 + intensity * 0.32
          }}
        />
        {Array.from({ length: needleCount }).map((_, i) => {
          const progress = i / (needleCount - 1);
          const angle = -135 + progress * 270;
          const isReached = isTravelReached(progress);
          const major = i % 4 === 0;
          return (
            <span
              key={i}
              className="knob-drift-needle absolute left-1/2 top-1/2 rounded-[2px] bg-[#e66a53]"
              style={{
                width: major ? 4 : 3,
                height: major ? 22 : 15,
                transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-91px)`,
                opacity: isReached ? 0.5 + intensity * 0.38 : 0.14,
                boxShadow: isReached ? reachedShadow(2) : '0 0 3px rgba(230,106,83,0.2)',
                filter: isReached ? `brightness(${1.08 + intensity * 0.62})` : 'brightness(0.56)'
              }}
            />
          );
        })}
      </div>
    );
  }

  if (variant === 'needlesCrown') {
    const needleCount = 33;
    return (
      <div className={stageClass} style={stageStyle}>
        {Array.from({ length: needleCount }).map((_, i) => {
          const progress = i / (needleCount - 1);
          const angle = -135 + progress * 270;
          const isReached = isTravelReached(progress);
          const crownLift = Math.sin(progress * Math.PI);
          return (
            <span
              key={i}
              className="knob-drift-needle absolute left-1/2 top-1/2 rounded-full bg-[#e66a53]"
              style={{
                width: 1.7,
                height: 10 + crownLift * 18,
                transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-94px)`,
                opacity: isReached ? 0.42 + intensity * 0.43 : 0.1 + crownLift * 0.08,
                boxShadow: isReached ? reachedShadow(1.5) : '0 0 2px rgba(230,106,83,0.18)',
                filter: isReached ? `brightness(${1 + intensity * 0.72})` : 'brightness(0.52)'
              }}
            />
          );
        })}
      </div>
    );
  }

  if (variant === 'needlesRails') {
    const needleCount = 29;
    return (
      <div className={stageClass} style={stageStyle}>
        {Array.from({ length: needleCount }).map((_, i) => {
          const progress = i / (needleCount - 1);
          const angle = -135 + progress * 270;
          const isReached = isTravelReached(progress);
          const major = i % 4 === 0;
          const opacity = isReached ? 0.44 + intensity * 0.4 : 0.13;
          return (
            <React.Fragment key={i}>
              <span
                className="knob-drift-needle absolute left-1/2 top-1/2 rounded-full bg-[#e66a53]"
                style={{
                  width: 1.6,
                  height: major ? 22 : 14,
                  transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-97px)`,
                  opacity,
                  boxShadow: isReached ? reachedShadow(1) : '0 0 2px rgba(230,106,83,0.2)',
                  filter: isReached ? `brightness(${1.06 + intensity * 0.62})` : 'brightness(0.6)'
                }}
              />
              <span
                className="knob-drift-needle absolute left-1/2 top-1/2 rounded-full bg-[#e66a53]"
                style={{
                  width: 1.2,
                  height: major ? 12 : 8,
                  transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-76px)`,
                  opacity: isReached ? opacity * 0.82 : 0.08,
                  boxShadow: isReached ? '0 0 5px rgba(230,106,83,0.42)' : 'none',
                  filter: isReached ? `brightness(${1 + intensity * 0.45})` : 'brightness(0.48)'
                }}
              />
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  if (variant === 'needlesDualRails') {
    const needleCount = 29;
    return (
      <div className={stageClass} style={stageStyle}>
        {Array.from({ length: needleCount }).map((_, i) => {
          const progress = i / (needleCount - 1);
          const angle = -135 + progress * 270;
          const driftReached = progress <= travel + 0.001;
          const spreadReached = progress <= spreadTravel + 0.001;
          const major = i % 4 === 0;
          const driftOpacity = driftReached ? 0.42 + intensity * 0.42 : 0.08;
          const spreadOpacity = spreadReached ? 0.46 + spreadIntensity * 0.42 : 0.12;
          return (
            <React.Fragment key={i}>
              <span
                className="knob-drift-needle absolute left-1/2 top-1/2 rounded-full bg-[#e66a53]"
                style={{
                  width: 1.25,
                  height: major ? 12 : 8,
                  transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-76px)`,
                  opacity: driftOpacity,
                  boxShadow: driftReached
                    ? `0 0 ${4 + intensity * 5}px rgba(230,106,83,${0.32 + intensity * 0.32})`
                    : 'none',
                  filter: driftReached ? `brightness(${1 + intensity * 0.5})` : 'brightness(0.5)'
                }}
              />
              <span
                className="knob-drift-needle absolute left-1/2 top-1/2 rounded-full bg-[#e66a53]"
                style={{
                  width: 1.8,
                  height: major ? 23 : 15,
                  transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-97px)`,
                  opacity: spreadOpacity,
                  boxShadow: spreadReached
                    ? `0 0 ${5 + spreadIntensity * 7}px rgba(230,106,83,${0.34 + spreadIntensity * 0.38})`
                    : '0 0 2px rgba(230,106,83,0.18)',
                  filter: spreadReached ? `brightness(${1.04 + spreadIntensity * 0.62})` : 'brightness(0.56)'
                }}
              />
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  const dualRailProfiles = {
    dualFine: {
      count: 43,
      innerY: -75,
      outerY: -98,
      innerWidth: 0.9,
      outerWidth: 1.35,
      innerHeight: (major) => major ? 10 : 6,
      outerHeight: (major) => major ? 18 : 10,
      innerRadius: '9999px',
      outerRadius: '9999px',
      majorEvery: 7,
      innerDim: 0.06,
      outerDim: 0.1
    },
    dualBars: {
      count: 25,
      innerY: -74,
      outerY: -96,
      innerWidth: 3,
      outerWidth: 4.4,
      innerHeight: (major) => major ? 12 : 8,
      outerHeight: (major) => major ? 23 : 16,
      innerRadius: '2px',
      outerRadius: '2px',
      majorEvery: 4,
      innerDim: 0.08,
      outerDim: 0.12
    },
    dualCrown: {
      count: 33,
      innerY: -75,
      outerY: -97,
      innerWidth: 1.1,
      outerWidth: 1.8,
      innerHeight: (major, progress) => 7 + Math.sin(progress * Math.PI) * 8 + (major ? 3 : 0),
      outerHeight: (major, progress) => 12 + Math.sin(progress * Math.PI) * 16 + (major ? 4 : 0),
      innerRadius: '9999px',
      outerRadius: '9999px',
      majorEvery: 6,
      innerDim: 0.07,
      outerDim: 0.1
    },
    dualSplit: {
      count: 31,
      innerY: -72,
      outerY: -100,
      innerWidth: 1.4,
      outerWidth: 1.7,
      innerHeight: (major) => major ? 15 : 9,
      outerHeight: (major) => major ? 19 : 12,
      innerRadius: '9999px',
      outerRadius: '9999px',
      majorEvery: 5,
      innerDim: 0.07,
      outerDim: 0.11
    },
    dualBlades: {
      count: 27,
      innerY: -76,
      outerY: -97,
      innerWidth: 2.1,
      outerWidth: 3.2,
      innerHeight: (major) => major ? 13 : 8,
      outerHeight: (major) => major ? 26 : 17,
      innerRadius: '1px 1px 9999px 9999px',
      outerRadius: '1px 1px 9999px 9999px',
      majorEvery: 3,
      innerDim: 0.08,
      outerDim: 0.12
    }
  };

  if (dualRailProfiles[variant]) {
    const profile = dualRailProfiles[variant];
    return (
      <div className={stageClass} style={stageStyle}>
        {Array.from({ length: profile.count }).map((_, i) => {
          const progress = i / (profile.count - 1);
          const angle = -135 + progress * 270;
          const driftReached = progress <= travel + 0.001;
          const spreadReached = progress <= spreadTravel + 0.001;
          const major = i % profile.majorEvery === 0;
          const innerOpacity = driftReached ? 0.38 + intensity * 0.44 : profile.innerDim;
          const outerOpacity = spreadReached ? 0.42 + spreadIntensity * 0.44 : profile.outerDim;
          return (
            <React.Fragment key={i}>
              <span
                className="knob-drift-needle absolute left-1/2 top-1/2 bg-[#e66a53]"
                style={{
                  width: profile.innerWidth,
                  height: profile.innerHeight(major, progress),
                  borderRadius: profile.innerRadius,
                  transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(${profile.innerY}px)`,
                  opacity: innerOpacity,
                  boxShadow: driftReached
                    ? `0 0 ${3.5 + intensity * 5.5}px rgba(230,106,83,${0.3 + intensity * 0.34})`
                    : 'none',
                  filter: driftReached ? `brightness(${1 + intensity * 0.55})` : 'brightness(0.5)'
                }}
              />
              <span
                className="knob-drift-needle absolute left-1/2 top-1/2 bg-[#e66a53]"
                style={{
                  width: profile.outerWidth,
                  height: profile.outerHeight(major, progress),
                  borderRadius: profile.outerRadius,
                  transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(${profile.outerY}px)`,
                  opacity: outerOpacity,
                  boxShadow: spreadReached
                    ? `0 0 ${5 + spreadIntensity * 7}px rgba(230,106,83,${0.32 + spreadIntensity * 0.38})`
                    : '0 0 2px rgba(230,106,83,0.16)',
                  filter: spreadReached ? `brightness(${1.04 + spreadIntensity * 0.66})` : 'brightness(0.54)'
                }}
              />
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  if (variant?.startsWith('dualSmooth')) {
    if (variant === 'dualSmoothOuterRibbon' || variant === 'dualSmoothOuterRibbonClean' || variant === 'dualSmoothOuterRibbonSpreadOnly') {
      const spreadOnly = variant === 'dualSmoothOuterRibbonSpreadOnly';
      const outerStageSize = 313;
      const outerCenter = outerStageSize / 2;
      const outerRadius = 126;
      const innerGuideRadius = 87;
      const innerGuideCircumference = 2 * Math.PI * innerGuideRadius;
      const innerGuideMaxArc = innerGuideCircumference * 0.75;
      const outerCircumference = 2 * Math.PI * outerRadius;
      const outerMaxArc = outerCircumference * 0.75;
      const outerDash = Math.max(0.001, spreadTravel * outerMaxArc);
      const outerGap = outerCircumference;
      const outerGradientId = 'dualSpreadOuterRibbonStroke';
      const spreadRibbonHighlight = spreadOnly ? knobFlutterFilledColors.highlight || DEFAULT_KNOB_FLUTTER_FILLED_COLORS.highlight : '#ffb09e';
      const spreadRibbonMid = spreadOnly ? knobFlutterFilledColors.mid || DEFAULT_KNOB_FLUTTER_FILLED_COLORS.mid : '#e66a53';
      const spreadRibbonTail = spreadOnly ? knobFlutterFilledColors.tail || DEFAULT_KNOB_FLUTTER_FILLED_COLORS.tail : '#7e2a24';
      const spreadRibbonStart = spreadOnly ? spreadRibbonMid : '#ffb09e';
      const spreadRibbonEnd = spreadOnly ? spreadRibbonMid : '#7e2a24';
      const spreadRibbonOpacity = spreadOnly ? 0.38 : 0.34 + spreadIntensity * 0.5;
      const spreadRibbonGlow = spreadOnly
        ? `drop-shadow(0 0 4px ${hexToRgba(spreadRibbonMid, 0.34)})`
        : `drop-shadow(0 0 ${4 + spreadIntensity * 8}px rgba(230,106,83,0.62))`;
      return (
        <div className={stageClass} style={{ ...stageStyle, width: outerStageSize, height: outerStageSize }}>
          <svg className="absolute inset-0 h-full w-full mix-blend-screen" viewBox={`0 0 ${outerStageSize} ${outerStageSize}`} aria-hidden="true">
            <defs>
              <linearGradient id={outerGradientId} x1="14%" y1="12%" x2="86%" y2="88%">
                <stop offset="0%" stopColor={spreadRibbonStart} stopOpacity={spreadOnly ? 0.48 : 0.95} />
                <stop offset="7%" stopColor={spreadRibbonMid} stopOpacity={spreadOnly ? 0.64 : 0.95} />
                <stop offset="52%" stopColor={spreadRibbonMid} stopOpacity={spreadOnly ? 0.66 : 0.95} />
                <stop offset="100%" stopColor={spreadRibbonEnd} stopOpacity={spreadOnly ? 0.7 : 0.64} />
              </linearGradient>
            </defs>
            {variant !== 'dualSmoothOuterRibbonClean' && !spreadOnly && (
              <circle
                cx={outerCenter}
                cy={outerCenter}
                r={innerGuideRadius}
                fill="none"
                stroke="#e66a53"
                strokeWidth="1.1"
                strokeDasharray={`${innerGuideMaxArc} ${innerGuideCircumference}`}
                opacity="0.12"
                transform={`rotate(135 ${outerCenter} ${outerCenter})`}
                vectorEffect="non-scaling-stroke"
              />
            )}
            <circle
              cx={outerCenter}
              cy={outerCenter}
              r={outerRadius}
              fill="none"
              stroke={`url(#${outerGradientId})`}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${outerDash} ${outerGap}`}
              opacity={spreadRibbonOpacity}
              transform={`rotate(135 ${outerCenter} ${outerCenter})`}
              vectorEffect="non-scaling-stroke"
              style={{
                filter: spreadRibbonGlow,
                transition: 'stroke-dasharray 45ms ease-out, opacity 45ms ease-out, filter 45ms ease-out'
              }}
            />
          </svg>
          {!spreadOnly && (
            <div className="absolute left-1/2 top-1/2 h-[236px] w-[236px] -translate-x-1/2 -translate-y-1/2">
              {renderFineDriftNeedles()}
            </div>
          )}
        </div>
      );
    }

    const outerRadius = 88;
    const circumference = 2 * Math.PI * outerRadius;
    const maxArc = circumference * 0.75;
    const dash = Math.max(0.001, spreadTravel * maxArc);
    const gap = circumference;
    const headDash = Math.min(Math.max(12, circumference * 0.045), Math.max(12, dash));
    const headOffset = -Math.max(0, dash - headDash);
    const spreadGradientId = `dualSpreadStroke-${variant}`;
    const spreadGlowId = `dualSpreadGlow-${variant}`;
    const svgBaseCircle = {
      cx: 118,
      cy: 118,
      r: outerRadius,
      fill: 'none',
      transform: 'rotate(135 118 118)',
      vectorEffect: 'non-scaling-stroke'
    };
    const svgTransition = 'stroke-dasharray 45ms ease-out, stroke-dashoffset 45ms ease-out, opacity 45ms ease-out, filter 45ms ease-out';
    const renderSpreadSvg = (children) => (
      <svg className="absolute inset-0 h-full w-full mix-blend-screen" viewBox="0 0 236 236" aria-hidden="true">
        <defs>
          <linearGradient id={spreadGradientId} x1="16%" y1="12%" x2="84%" y2="88%">
            <stop offset="0%" stopColor="#ffb09e" stopOpacity="0.95" />
            <stop offset="52%" stopColor="#e66a53" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#7e2a24" stopOpacity="0.64" />
          </linearGradient>
          <filter id={spreadGlowId} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation={2.6 + spreadIntensity * 2.4} result="spreadGlow" />
            <feMerge>
              <feMergeNode in="spreadGlow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle
          {...svgBaseCircle}
          stroke="#e66a53"
          strokeWidth="1.2"
          strokeDasharray={`${maxArc} ${gap}`}
          opacity="0.1"
        />
        {children}
      </svg>
    );

    const spreadLayer = (() => {
      if (variant === 'dualSmoothArc') {
        return renderSpreadSvg(
          <circle
            {...svgBaseCircle}
            stroke="url(#dualSpreadStroke-dualSmoothArc)"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${gap}`}
            opacity={0.3 + spreadIntensity * 0.58}
            style={{
              filter: `drop-shadow(0 0 ${4 + spreadIntensity * 8}px rgba(230,106,83,0.68))`,
              transition: svgTransition
            }}
          />
        );
      }

      if (variant === 'dualSmoothRibbon') {
        return renderSpreadSvg(
          <circle
            {...svgBaseCircle}
            stroke={`url(#${spreadGradientId})`}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${gap}`}
            opacity={0.34 + spreadIntensity * 0.5}
            style={{
              filter: `drop-shadow(0 0 ${4 + spreadIntensity * 8}px rgba(230,106,83,0.62))`,
              transition: svgTransition
            }}
          />
        );
      }

      if (variant === 'dualSmoothHalo') {
        return renderSpreadSvg(
          <>
            <circle
              {...svgBaseCircle}
              stroke={`url(#${spreadGradientId})`}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${gap}`}
              opacity={0.16 + spreadIntensity * 0.32}
              style={{
                filter: `url(#${spreadGlowId})`,
                transition: svgTransition
              }}
            />
            <circle
              {...svgBaseCircle}
              stroke="#ffb09e"
              strokeWidth="1.1"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${gap}`}
              opacity={0.26 + spreadIntensity * 0.34}
              style={{ transition: svgTransition }}
            />
          </>
        );
      }

      if (variant === 'dualSmoothSweep') {
        return renderSpreadSvg(
          <>
            <circle
              {...svgBaseCircle}
              stroke="#e66a53"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${gap}`}
              opacity={0.18 + spreadIntensity * 0.34}
              style={{ transition: svgTransition }}
            />
            <circle
              {...svgBaseCircle}
              stroke="#ffb09e"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${Math.min(headDash, dash)} ${gap}`}
              strokeDashoffset={headOffset}
              opacity={0.5 + spreadIntensity * 0.42}
              style={{
                filter: `drop-shadow(0 0 ${5 + spreadIntensity * 10}px rgba(230,106,83,0.72))`,
                transition: svgTransition
              }}
            />
          </>
        );
      }

      if (variant === 'dualSmoothComet') {
        return renderSpreadSvg(
          <>
            <circle
              {...svgBaseCircle}
              stroke={`url(#${spreadGradientId})`}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${gap}`}
              opacity={0.2 + spreadIntensity * 0.42}
              style={{
                filter: `drop-shadow(0 0 ${4 + spreadIntensity * 8}px rgba(230,106,83,0.56))`,
                transition: svgTransition
              }}
            />
            <circle
              {...svgBaseCircle}
              stroke="#ffb09e"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={`${Math.min(headDash * 0.68, dash)} ${gap}`}
              strokeDashoffset={headOffset}
              opacity={0.48 + spreadIntensity * 0.44}
              style={{
                filter: `drop-shadow(0 0 ${7 + spreadIntensity * 11}px rgba(255,176,158,0.74))`,
                transition: svgTransition
              }}
            />
          </>
        );
      }

      return renderSpreadSvg(
        <>
          <circle
            {...svgBaseCircle}
            stroke={`url(#${spreadGradientId})`}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${gap}`}
            opacity={0.12 + spreadIntensity * 0.34}
            style={{
              filter: `url(#${spreadGlowId})`,
              transition: svgTransition
            }}
          />
          <circle
            {...svgBaseCircle}
            stroke="#e66a53"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${gap}`}
            opacity={0.26 + spreadIntensity * 0.42}
            style={{ transition: svgTransition }}
          />
        </>
      );
    })();

    return (
      <div className={stageClass} style={stageStyle}>
        {spreadLayer}
        {renderFineDriftNeedles()}
      </div>
    );
  }

  return null;
};

const CreativeDriftAura = ({ drift, spread, active, rate, animationStyle, auroraScale = 1, auroraScaleX = 1, spreadReactive = true, filterId = 'driftAuroraLiquid', saturation = 1.25 }) => {
  const organicVariant = ORGANIC_AURORA_VARIANTS[animationStyle];
  const isOrganic = Boolean(organicVariant);
  const intensity = Math.max(0.08, drift / 100);
  const effectiveSpread = spreadReactive ? spread : 0;
  const visualSpread = effectiveSpread * 0.5;
  const spreadScaleX = 1 + (visualSpread / 135);
  const spreadScaleY = 1 + (visualSpread / 520);
  const spreadShift = visualSpread * 1.25;
  const baseSpeed = Math.max(1.6, 10 - (rate / 9));
  const glowOpacity = active ? 0.2 + intensity * 0.26 + (effectiveSpread / 100) * 0.12 : 0;
  const auroraWidth = 168 * auroraScale * auroraScaleX;
  const auroraHeight = 168 * auroraScale;
  const glowWidth = 95 * auroraScale * auroraScaleX;
  const glowHeight = 95 * auroraScale;
  const organicRestScale = organicVariant ? organicVariant.restScale(intensity) : 0;
  const organicBurstScale = organicVariant ? organicVariant.burstScale(intensity) : 0;
  const organicBlur = organicVariant ? organicVariant.blur(intensity) : 0;
  const organicCycle = organicVariant ? organicVariant.cycle(intensity, rate) : 2;
  const organicFrequency = organicVariant ? organicVariant.frequency(intensity) : '0.014 0.032';
  const organicBegin = `-${(((Date.now() - FLUTTER_ANIMATION_EPOCH) / 1000) % organicCycle).toFixed(3)}s`;
  const stageStyle = {
    '--drift-speed': `${baseSpeed}s`,
    '--drift-speed-fast': `${Math.max(0.85, baseSpeed * 0.58)}s`,
    '--drift-speed-slow': `${baseSpeed * 1.7}s`,
    '--liquid-cycle': `${organicCycle}s`
  };
  const chromaGlow = (
    <>
      <div
        className="absolute rounded-full blur-[72px] transition-all duration-300"
        style={{
          width: `${glowWidth}%`,
          height: `${glowHeight}%`,
          background: 'radial-gradient(circle, rgba(230,106,83,0.95), rgba(230,106,83,0.16) 52%, transparent 72%)',
          opacity: glowOpacity,
          transform: `translateX(-${spreadShift}px) scaleX(${1 + visualSpread / 180})`
        }}
      />
      <div
        className="absolute rounded-full blur-[72px] transition-all duration-300"
        style={{
          width: `${glowWidth}%`,
          height: `${glowHeight}%`,
          background: 'radial-gradient(circle, rgba(237,211,154,0.95), rgba(237,211,154,0.14) 52%, transparent 72%)',
          opacity: glowOpacity,
          transform: `translateX(${spreadShift}px) scaleX(${1 + visualSpread / 180})`
        }}
      />
    </>
  );

  return (
    <div
      className={`absolute inset-0 pointer-events-none transition-all duration-700 ease-out flex justify-center items-center ${active ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
      style={stageStyle}
    >
      {isOrganic && (
        <svg className="absolute w-0 h-0" aria-hidden="true" focusable="false">
          <defs>
            <filter id={filterId} x="-40%" y="-40%" width="180%" height="180%" colorInterpolationFilters="sRGB">
              <feTurbulence type={organicVariant.type} baseFrequency={organicFrequency} numOctaves={organicVariant.numOctaves} seed="7" result="liquidNoise">
                <animate attributeName="seed" values={organicVariant.seedValues} keyTimes={organicVariant.keyTimes} dur={`${organicCycle}s`} begin={organicBegin} repeatCount="indefinite" />
              </feTurbulence>
              <feGaussianBlur in="liquidNoise" stdDeviation={organicBlur} result="softLiquidNoise" />
              {organicVariant.axis === 'horizontal' && (
                <feColorMatrix
                  in="softLiquidNoise"
                  type="matrix"
                  values="1 0 0 0 0  0 0 0 0 0.5  0 0 1 0 0  0 0 0 1 0"
                  result="horizontalLiquidNoise"
                />
              )}
              <feDisplacementMap
                in="SourceGraphic"
                in2={organicVariant.axis === 'horizontal' ? 'horizontalLiquidNoise' : 'softLiquidNoise'}
                scale={organicRestScale}
                xChannelSelector={organicVariant.channels[0]}
                yChannelSelector={organicVariant.channels[1]}
              >
                <animate
                  attributeName="scale"
                  values={organicVariant.scaleValues
                    ? organicVariant.scaleValues(organicRestScale, organicBurstScale)
                    : `${organicRestScale};${organicRestScale};${organicBurstScale};${organicRestScale};${organicRestScale}`}
                  keyTimes={organicVariant.keyTimes}
                  dur={`${organicCycle}s`}
                  begin={organicBegin}
                  repeatCount="indefinite"
                />
              </feDisplacementMap>
            </filter>
          </defs>
        </svg>
      )}
      {chromaGlow}
      <div
        className={`absolute ${isOrganic ? 'drift-aurora-liquid-field' : ''}`}
        style={{
          width: `${auroraWidth}%`,
          height: `${auroraHeight}%`,
          transform: `scaleX(${spreadScaleX}) scaleY(${spreadScaleY})`,
          filter: isOrganic ? `url(#${filterId})` : undefined
        }}
      >
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="drift-aurora-sheet absolute left-1/2 top-1/2 mix-blend-screen"
            style={{
              width: `${74 - i * 8}%`,
              height: `${86 - i * 6}%`,
              borderRadius: `${44 + i * 6}% ${56 - i * 2}% ${42 + i * 4}% ${58 - i * 3}% / ${60 - i * 3}% ${40 + i * 5}% ${56 - i * 2}% ${44 + i * 4}%`,
              background: i % 2
                ? 'linear-gradient(130deg, transparent 8%, rgba(237,211,154,0.08), rgba(237,211,154,0.62), transparent 74%)'
                : 'linear-gradient(50deg, transparent 7%, rgba(230,106,83,0.1), rgba(230,106,83,0.55), transparent 78%)',
              filter: `blur(${2 + i * 0.7}px) saturate(${saturation})`,
              opacity: 0.38 + intensity * 0.42,
              animationDuration: `${baseSpeed * (1.06 + i * 0.14)}s`,
              animationDelay: `${i * -0.9}s`
            }}
          />
        ))}
        <div className="drift-aurora-core absolute left-1/2 top-1/2 w-[28%] h-[28%] rounded-full bg-[#edd39a]/35 blur-[12px] mix-blend-screen" style={{ animationDuration: `${baseSpeed * 0.8}s` }} />
      </div>
    </div>
  );
};

const WobblyAura = ({ mode, ...props }) => {
  const styleName = DRIFT_ANIMATION_STYLES[normalizeDriftAnimationStyle(props.animationStyle)] || DRIFT_ANIMATION_STYLES[0];
  switch (styleName) {
    case 'Original Flutter':
      return <OriginalWobblyAura {...props} originalFlutter />;
    case 'Aurora Veil':
      return <CreativeDriftAura {...props} animationStyle={2} />;
    case 'Aurora Flutter':
      return <CreativeDriftAura {...props} animationStyle={3} />;
    case 'Knob Flutter Coral Thin':
      return <KnobFlutterRing {...props} mode={mode} color="#e66a53" strokeWidth={1.35} />;
    case 'Knob Flutter Coral Filled':
      return <KnobFlutterRing {...props} mode={mode} color="#c26650" strokeWidth={1.35} filled={true} sizeOffset={-30} filledColors={props.knobFlutterFilledColors} />;
    case 'Coral Drift Needles':
      return <KnobDriftExperiment {...props} variant="needles" />;
    case 'Coral Needles Fine':
      return <KnobDriftExperiment {...props} variant="needlesFine" />;
    case 'Coral Needles Meter':
      return <KnobDriftExperiment {...props} variant="needlesMeter" />;
    case 'Coral Dual Rails Arc':
      return <KnobDriftExperiment {...props} variant="dualSmoothArc" />;
    case 'Coral Dual Smooth Ribbon':
      return <KnobDriftExperiment {...props} variant="dualSmoothRibbon" />;
    case 'Coral Dual Smooth Aurora':
      return (
        <>
          <KnobDriftExperiment {...props} variant="dualSmoothRibbon" />
          <CreativeDriftAura
            {...props}
            animationStyle={3}
            auroraScale={0.86}
            auroraScaleX={1.1}
            spreadReactive={false}
            filterId="driftAuroraLiquidCombo"
            saturation={1.08}
          />
        </>
      );
    case 'Coral Dual Outer Ribbon':
      return <KnobDriftExperiment {...props} variant="dualSmoothOuterRibbon" />;
    case 'Coral Dual Outer Ribbon Flutter':
      return (
        <>
          <KnobDriftExperiment {...props} variant="dualSmoothOuterRibbon" />
          <KnobFlutterRing {...props} color="#e66a53" strokeWidth={1.35} />
        </>
      );
    case 'Coral Dual Outer Flutter Clean':
      return (
        <>
          <KnobDriftExperiment {...props} variant="dualSmoothOuterRibbonClean" />
          <KnobFlutterRing {...props} color="#e66a53" strokeWidth={1.35} />
        </>
      );
    case 'Knob Flutter Coral Filled + Spread Ribbon':
      return (
        <>
          <KnobDriftExperiment {...props} variant="dualSmoothOuterRibbonSpreadOnly" />
          <KnobFlutterRing {...props} mode={mode} color="#c26650" strokeWidth={1.35} filled={true} sizeOffset={-30} filledColors={props.knobFlutterFilledColors} />
        </>
      );
    default:
      return <OriginalWobblyAura {...props} originalFlutter />;
  }
};

const SakuraImageLayer = ({ src, settings, alt, matteBacking = false }) => {
  if (!settings.enabled) return null;
  const layerStyle = {
    left: settings.x,
    top: settings.y,
    width: settings.size,
    transform: `translate(-50%, -50%) rotate(${settings.rotate}deg)`,
    transformOrigin: 'center'
  };

  return (
    <>
      {matteBacking && (
        <img
          src={src}
          alt=""
          aria-hidden="true"
          className="absolute pointer-events-none select-none"
          draggable={false}
          style={{
            ...layerStyle,
            zIndex: 38,
            opacity: 0.94,
            filter: 'brightness(0) saturate(100%) invert(97%) sepia(16%) saturate(355%) hue-rotate(343deg) brightness(105%) contrast(96%)'
          }}
        />
      )}
      <img
        src={src}
        alt={alt}
        className="absolute pointer-events-none select-none"
        draggable={false}
        style={{
          ...layerStyle,
          zIndex: 39,
          opacity: 0.95,
          filter: 'brightness(0.95)'
        }}
      />
    </>
  );
};

const EditableImageAsset = ({ src, settings, selected, onSelect, onUpdate, stageRef, alt, zIndex = 32 }) => {
  if (!settings.enabled) return null;

  const getScale = () => {
    const rect = stageRef.current?.getBoundingClientRect();
    return rect ? rect.width / 850 : 1;
  };

  const startMove = (event) => {
    if (settings.locked) return;
    event.preventDefault();
    event.stopPropagation();
    onSelect();

    const scale = getScale();
    const startX = settings.x;
    const startY = settings.y;
    const startClientX = event.clientX;
    const startClientY = event.clientY;

    const handleMove = (moveEvent) => {
      onUpdate({
        x: Math.round(startX + (moveEvent.clientX - startClientX) / scale),
        y: Math.round(startY + (moveEvent.clientY - startClientY) / scale)
      });
    };

    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  };

  return (
    <div
      onPointerDown={startMove}
      className={`absolute select-none ${settings.locked ? 'pointer-events-none' : 'cursor-move touch-none hover:ring-2 hover:ring-white/30 rounded-xl'}`}
      style={{
        left: settings.x,
        top: settings.y,
        width: settings.size,
        transform: `translate(-50%, -50%) rotate(${settings.rotate}deg)`,
        transformOrigin: 'center',
        zIndex: selected ? 38 : zIndex
      }}
    >
      <img src={src} alt={alt} draggable={false} className="block w-full pointer-events-none select-none" />
      {!settings.locked && selected && (
        <div className="absolute -inset-3 border-2 border-white/50 border-dashed rounded-xl pointer-events-none" />
      )}
    </div>
  );
};

const SakuraToggle = ({ active, onClick, label }) => (
  <div className="flex flex-col items-center gap-1.5">
    <button
      onClick={onClick}
      className={`w-11 h-6 rounded-full border-[3px] border-white/80 flex items-center px-0.5 transition-colors duration-300 ${active ? 'bg-white/20' : 'bg-transparent'}`}
    >
      <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform duration-300 ${active ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
    <span className="text-white/90 text-[10px] font-medium tracking-wide text-center leading-tight">{label}</span>
  </div>
);

const SakuraRange = ({ label, value, min, max, step = 1, onChange }) => (
  <label className="grid grid-cols-[34px_1fr_34px] items-center gap-2 w-full">
    <span className="text-white/90 text-[9px] font-bold tracking-[0.12em] uppercase">{label}</span>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      className="w-full accent-white"
    />
    <span className="text-white/80 text-[9px] font-bold tabular-nums text-right">{value}</span>
  </label>
);

const MasteringToggle = ({ active, onClick, label = 'On' }) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-full border px-3 py-1.5 text-[8px] font-black uppercase tracking-widest transition-all ${active ? 'border-[#edd39a]/70 bg-[#edd39a]/20 text-[#edd39a]' : 'border-white/10 bg-white/5 text-white/45 hover:text-white/70'}`}
  >
    {label}
  </button>
);

const MasteringColor = ({ label, value, onChange }) => (
  <label className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
    <span className="text-white/50 text-[8px] font-black uppercase tracking-[0.18em]">{label}</span>
    <div className="flex items-center gap-2">
      <span className="text-white/35 text-[8px] font-bold uppercase tracking-widest">{value}</span>
      <span className="relative h-7 w-7 overflow-hidden rounded-lg border border-white/15" style={{ backgroundColor: value }}>
        <input
          type="color"
          value={value}
          onChange={event => onChange(event.target.value)}
          className="absolute -inset-2 h-[calc(100%+16px)] w-[calc(100%+16px)] cursor-pointer border-none bg-transparent"
        />
      </span>
    </div>
  </label>
);

const MasteringModule = ({ title, enabled, onToggle, children }) => (
  <div className={`rounded-2xl border p-3 transition-colors ${enabled ? 'border-[#edd39a]/25 bg-[#edd39a]/[0.08]' : 'border-white/10 bg-white/[0.035]'}`}>
    <div className="mb-3 flex items-center justify-between gap-3">
      <span className="text-white/60 text-[9px] font-black uppercase tracking-[0.2em]">{title}</span>
      <MasteringToggle active={enabled} onClick={onToggle} />
    </div>
    <div className={`flex flex-col gap-2 ${enabled ? 'opacity-100' : 'opacity-45'}`}>
      {children}
    </div>
  </div>
);

const CurvesEditor = ({ curves, onChange }) => {
  const [activeChannel, setActiveChannel] = useState('rgb');
  const svgRef = useRef(null);
  const dragStateRef = useRef(null);
  const value = curves || DEFAULT_GLOBAL_CURVES;
  const points = value.channels?.[activeChannel] || DEFAULT_GLOBAL_CURVES.channels[activeChannel];
  const strokeColor = activeChannel === 'rgb' ? '#f8f4ec' : activeChannel === 'r' ? '#ff7f6c' : activeChannel === 'g' ? '#98d59c' : '#82b7ff';
  const updatePoint = (pointIndex, clientX, clientY) => {
    const bounds = svgRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const rawX = clamp01((clientX - bounds.left) / bounds.width);
    const rawY = clamp01(1 - (clientY - bounds.top) / bounds.height);
    const nextPoints = points.map((point, index) => {
      if (index !== pointIndex) return point;
      if (index === 0) return { x: 0, y: rawY };
      if (index === points.length - 1) return { x: 1, y: rawY };
      const minX = points[index - 1].x + 0.01;
      const maxX = points[index + 1].x - 0.01;
      return { x: Math.max(minX, Math.min(maxX, rawX)), y: rawY };
    });
    onChange({
      channels: {
        ...value.channels,
        [activeChannel]: nextPoints
      }
    });
  };
  const resetPoint = (pointIndex) => {
    const identityPoints = createIdentityCurve();
    const nextPoints = points.map((point, index) => (
      index === pointIndex ? { ...identityPoints[index] } : point
    ));
    onChange({
      channels: {
        ...value.channels,
        [activeChannel]: nextPoints
      }
    });
  };

  useEffect(() => {
    const handleMove = (event) => {
      if (!dragStateRef.current) return;
      updatePoint(dragStateRef.current.pointIndex, event.clientX, event.clientY);
    };
    const handleUp = () => {
      dragStateRef.current = null;
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  });

  const pathD = buildSmoothCurvePath(points);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-4 gap-2">
        {CURVE_CHANNELS.map(channel => (
          <button
            key={channel}
            type="button"
            onClick={() => setActiveChannel(channel)}
            className={`h-8 rounded-lg border text-[8px] font-black uppercase tracking-[0.16em] transition-all ${activeChannel === channel ? 'border-[#edd39a]/50 bg-[#edd39a]/15 text-[#edd39a]' : 'border-white/10 bg-white/5 text-white/45 hover:text-white/70'}`}
          >
            {channel === 'rgb' ? 'RGB' : channel.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0f0f0f]/45 p-3">
        <svg ref={svgRef} viewBox="0 0 100 100" className="block h-[220px] w-full touch-none select-none overflow-visible">
          {[25, 50, 75].map(valueLine => (
            <React.Fragment key={valueLine}>
              <line x1={valueLine} y1="0" x2={valueLine} y2="100" stroke="rgba(255,255,255,0.12)" strokeWidth="0.6" />
              <line x1="0" y1={valueLine} x2="100" y2={valueLine} stroke="rgba(255,255,255,0.12)" strokeWidth="0.6" />
            </React.Fragment>
          ))}
          <rect x="0.5" y="0.5" width="99" height="99" rx="1.5" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
          <path d="M 0 100 L 100 0" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.9" />
          <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" />
          {points.map((point, index) => (
            <circle
              key={`${activeChannel}-${index}`}
              cx={point.x * 100}
              cy={(1 - point.y) * 100}
              r="2.6"
              fill={strokeColor}
              stroke="rgba(15,15,15,0.85)"
              strokeWidth="1"
              onPointerDown={(event) => {
                dragStateRef.current = { pointIndex: index };
                updatePoint(index, event.clientX, event.clientY);
              }}
              onDoubleClick={(event) => {
                event.preventDefault();
                dragStateRef.current = null;
                resetPoint(index);
              }}
            />
          ))}
        </svg>
      </div>

      <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-[0.16em] text-white/35">
        <span>Shadows</span>
        <span>Highlights</span>
      </div>
    </div>
  );
};

const DepthModelControls = ({ settings, centerSettings, onChange, onCenterChange, onPreset }) => {
  const value = normalizeDepthModel(settings);
  const centerValue = normalizeCenterDepthModel(centerSettings);
  const updateHeight = (key, next) => onChange({ heights: { ...value.heights, [key]: next } });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-3">
        <div className="flex flex-col gap-1">
          <span className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em]">Depth Model</span>
          <span className="text-white/35 text-[9px] font-bold uppercase tracking-[0.12em]">{value.enabled ? DEPTH_MODEL_PRESETS[value.preset]?.name || 'Custom' : 'Disabled'}</span>
        </div>
        <MasteringToggle active={value.enabled} onClick={() => onChange({ enabled: !value.enabled })} label={value.enabled ? 'On' : 'Off'} />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-white/50 text-[9px] font-bold tracking-[0.2em] uppercase">Preset</span>
        <div className="relative h-11">
          <select value={value.preset} onChange={event => onPreset(Number(event.target.value))} className="absolute inset-0 h-full w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 text-[11px] font-bold text-[#edd39a] outline-none">
            {DEPTH_MODEL_PRESETS.map((preset, index) => <option key={preset.name} value={index}>{preset.name}</option>)}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">▼</div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
        <div className="mb-3 text-white/60 text-[9px] font-black uppercase tracking-[0.2em]">Light & Shadow</div>
        <div className="flex flex-col gap-2">
          <SakuraRange label="angle" value={value.shadowAngle} min={0} max={180} onChange={next => onChange({ shadowAngle: next })} />
          <SakuraRange label="height" value={value.lightHeight} min={25} max={95} onChange={next => onChange({ lightHeight: next })} />
          <SakuraRange label="scale" value={value.heightScale} min={40} max={160} onChange={next => onChange({ heightScale: next })} />
          <SakuraRange label="contact" value={value.contactStrength} min={0} max={90} onChange={next => onChange({ contactStrength: next })} />
          <SakuraRange label="cast" value={value.castStrength} min={0} max={90} onChange={next => onChange({ castStrength: next })} />
          <SakuraRange label="soft" value={value.softness} min={20} max={100} onChange={next => onChange({ softness: next })} />
          <SakuraRange label="opac" value={value.opacity} min={0} max={100} onChange={next => onChange({ opacity: next })} />
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
        <div className="mb-3 text-white/60 text-[9px] font-black uppercase tracking-[0.2em]">Object Heights</div>
        <div className="flex flex-col gap-2">
          <SakuraRange label="knobs" value={value.heights.smallKnobs} min={1} max={16} onChange={next => updateHeight('smallKnobs', next)} />
          <SakuraRange label="dial" value={value.heights.bigDial} min={1} max={16} onChange={next => updateHeight('bigDial', next)} />
          <SakuraRange label="mods" value={value.heights.modules} min={1} max={14} onChange={next => updateHeight('modules', next)} />
          <SakuraRange label="slabs" value={value.heights.slabs} min={1} max={10} onChange={next => updateHeight('slabs', next)} />
          <SakuraRange label="btns" value={value.heights.buttons} min={1} max={12} onChange={next => updateHeight('buttons', next)} />
        </div>
      </div>

      <div className={`rounded-2xl border p-3 transition-colors ${centerValue.enabled ? 'border-[#edd39a]/25 bg-[#edd39a]/[0.08]' : 'border-white/10 bg-white/[0.035]'}`}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <div className="text-white/60 text-[9px] font-black uppercase tracking-[0.2em]">Center Depth</div>
            <div className="mt-1 text-white/35 text-[8px] font-bold uppercase tracking-[0.12em]">Middle knob only</div>
          </div>
          <MasteringToggle active={centerValue.enabled} onClick={() => onCenterChange({ enabled: !centerValue.enabled })} label={centerValue.enabled ? 'On' : 'Off'} />
        </div>
        <div className={`flex flex-col gap-2 ${centerValue.enabled ? 'opacity-100' : 'opacity-45'}`}>
          <SakuraRange label="angle" value={centerValue.shadowAngle} min={0} max={180} onChange={next => onCenterChange({ shadowAngle: next })} />
          <SakuraRange label="height" value={centerValue.height} min={1} max={12} onChange={next => onCenterChange({ height: next })} />
          <SakuraRange label="dist" value={centerValue.distance} min={0} max={90} onChange={next => onCenterChange({ distance: next })} />
          <SakuraRange label="contact" value={centerValue.contactStrength} min={0} max={70} onChange={next => onCenterChange({ contactStrength: next })} />
          <SakuraRange label="cast" value={centerValue.castStrength} min={0} max={70} onChange={next => onCenterChange({ castStrength: next })} />
          <SakuraRange label="soft" value={centerValue.softness} min={20} max={100} onChange={next => onCenterChange({ softness: next })} />
          <SakuraRange label="opac" value={centerValue.opacity} min={0} max={100} onChange={next => onCenterChange({ opacity: next })} />
          <SakuraRange label="size" value={centerValue.size} min={40} max={120} onChange={next => onCenterChange({ size: next })} />
          <SakuraRange label="x" value={centerValue.x} min={-40} max={40} onChange={next => onCenterChange({ x: next })} />
          <SakuraRange label="y" value={centerValue.y} min={-40} max={40} onChange={next => onCenterChange({ y: next })} />
        </div>
      </div>
    </div>
  );
};

const GLOBAL_MASTERING_PRESETS = {
  clean: normalizeGlobalMastering(DEFAULT_GLOBAL_MASTERING),
  dimStudio: normalizeGlobalMastering({
    enabled: true,
    studioDim: { enabled: true, opacity: 26, x: 34, y: 26, size: 108, softness: 48, color: '#050403' },
    light: { enabled: true, intensity: 18, x: 18, y: 12, size: 64, warmth: 70, color: '#fff0c8' },
    vignette: { enabled: true, strength: 22, size: 64, softness: 52, color: '#080403' },
    grade: { enabled: true, warmth: 58, contrast: 54, saturation: 44, lift: 44, fade: 8, opacity: 15, tint: '#7f3d31' },
    shadowGlue: { enabled: true, opacity: 20, x: 50, y: 62, size: 74, blur: 38, color: '#100705' },
    grain: { enabled: true, opacity: 5, scale: 2, contrast: 20 }
  }),
  warmFilm: normalizeGlobalMastering({
    enabled: true,
    light: { enabled: true, intensity: 20, x: 22, y: 16, size: 78, warmth: 78, color: '#ffe4b7' },
    grade: { enabled: true, warmth: 68, contrast: 52, saturation: 48, lift: 48, fade: 10, opacity: 20, tint: '#a85a42' },
    vignette: { enabled: true, strength: 16, size: 72, softness: 56, color: '#100604' },
    bloom: { enabled: true, opacity: 8, size: 72, blur: 32, color: '#e66a53' },
    grain: { enabled: true, opacity: 7, scale: 3, contrast: 26 }
  }),
  darkConsole: normalizeGlobalMastering({
    enabled: true,
    studioDim: { enabled: true, opacity: 32, x: 48, y: 42, size: 116, softness: 42, color: '#030302' },
    edgeWash: { enabled: true, opacity: 18, angle: 220, color: '#170906' },
    vignette: { enabled: true, strength: 28, size: 62, softness: 42, color: '#040201' },
    grade: { enabled: true, warmth: 45, contrast: 58, saturation: 38, lift: 39, fade: 6, opacity: 18, tint: '#4b241d' },
    shadowGlue: { enabled: true, opacity: 28, x: 52, y: 60, size: 62, blur: 46, color: '#090302' }
  })
};

const GlobalMasteringControls = ({ settings, onRootChange, onSectionChange, onPreset, onReset }) => {
  const value = normalizeGlobalMastering(settings);
  const presetButton = (id, label) => (
    <button
      key={id}
      type="button"
      onClick={() => onPreset(id)}
      className="h-9 rounded-xl border border-white/10 bg-white/5 px-2 text-[8px] font-black uppercase tracking-[0.12em] text-white/50 transition-all hover:border-[#edd39a]/40 hover:text-[#edd39a]"
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-3">
        <div className="flex flex-col gap-1">
          <span className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em]">Master Bypass</span>
          <span className="text-white/35 text-[9px] font-bold uppercase tracking-[0.12em]">{value.enabled ? 'Processing visual stack' : 'Clean original view'}</span>
        </div>
        <MasteringToggle active={value.enabled} onClick={() => onRootChange({ enabled: !value.enabled })} label={value.enabled ? 'On' : 'Off'} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {presetButton('dimStudio', 'Dim Studio')}
        {presetButton('warmFilm', 'Warm Film')}
        {presetButton('darkConsole', 'Dark Console')}
        <button
          type="button"
          onClick={onReset}
          className="h-9 rounded-xl border border-white/10 bg-black/20 px-2 text-[8px] font-black uppercase tracking-[0.12em] text-white/40 transition-all hover:text-white/70"
        >
          Reset
        </button>
      </div>

      <MasteringModule title="Studio Dim" enabled={value.studioDim.enabled} onToggle={() => onSectionChange('studioDim', { enabled: !value.studioDim.enabled })}>
        <SakuraRange label="opac" value={value.studioDim.opacity} min={0} max={70} onChange={next => onSectionChange('studioDim', { opacity: next })} />
        <SakuraRange label="x" value={value.studioDim.x} min={0} max={100} onChange={next => onSectionChange('studioDim', { x: next })} />
        <SakuraRange label="y" value={value.studioDim.y} min={0} max={100} onChange={next => onSectionChange('studioDim', { y: next })} />
        <SakuraRange label="size" value={value.studioDim.size} min={40} max={180} onChange={next => onSectionChange('studioDim', { size: next })} />
        <SakuraRange label="soft" value={value.studioDim.softness} min={5} max={90} onChange={next => onSectionChange('studioDim', { softness: next })} />
        <MasteringColor label="Color" value={value.studioDim.color} onChange={next => onSectionChange('studioDim', { color: next })} />
      </MasteringModule>

      <MasteringModule title="Key Light" enabled={value.light.enabled} onToggle={() => onSectionChange('light', { enabled: !value.light.enabled })}>
        <SakuraRange label="int" value={value.light.intensity} min={0} max={70} onChange={next => onSectionChange('light', { intensity: next })} />
        <SakuraRange label="x" value={value.light.x} min={0} max={100} onChange={next => onSectionChange('light', { x: next })} />
        <SakuraRange label="y" value={value.light.y} min={0} max={100} onChange={next => onSectionChange('light', { y: next })} />
        <SakuraRange label="size" value={value.light.size} min={20} max={150} onChange={next => onSectionChange('light', { size: next })} />
        <SakuraRange label="warm" value={value.light.warmth} min={0} max={100} onChange={next => onSectionChange('light', { warmth: next })} />
        <MasteringColor label="Color" value={value.light.color} onChange={next => onSectionChange('light', { color: next })} />
      </MasteringModule>

      <MasteringModule title="Color Grade" enabled={value.grade.enabled} onToggle={() => onSectionChange('grade', { enabled: !value.grade.enabled })}>
        <SakuraRange label="opac" value={value.grade.opacity} min={0} max={60} onChange={next => onSectionChange('grade', { opacity: next })} />
        <SakuraRange label="warm" value={value.grade.warmth} min={0} max={100} onChange={next => onSectionChange('grade', { warmth: next })} />
        <SakuraRange label="cont" value={value.grade.contrast} min={0} max={100} onChange={next => onSectionChange('grade', { contrast: next })} />
        <SakuraRange label="sat" value={value.grade.saturation} min={0} max={100} onChange={next => onSectionChange('grade', { saturation: next })} />
        <SakuraRange label="lift" value={value.grade.lift} min={0} max={100} onChange={next => onSectionChange('grade', { lift: next })} />
        <SakuraRange label="fade" value={value.grade.fade} min={0} max={60} onChange={next => onSectionChange('grade', { fade: next })} />
        <MasteringColor label="Tint" value={value.grade.tint} onChange={next => onSectionChange('grade', { tint: next })} />
      </MasteringModule>

      <MasteringModule title="Curves" enabled={value.curves.enabled} onToggle={() => onSectionChange('curves', { enabled: !value.curves.enabled })}>
        <CurvesEditor curves={value.curves} onChange={next => onSectionChange('curves', next)} />
      </MasteringModule>

      <MasteringModule title="Vignette" enabled={value.vignette.enabled} onToggle={() => onSectionChange('vignette', { enabled: !value.vignette.enabled })}>
        <SakuraRange label="str" value={value.vignette.strength} min={0} max={80} onChange={next => onSectionChange('vignette', { strength: next })} />
        <SakuraRange label="size" value={value.vignette.size} min={20} max={95} onChange={next => onSectionChange('vignette', { size: next })} />
        <SakuraRange label="soft" value={value.vignette.softness} min={0} max={80} onChange={next => onSectionChange('vignette', { softness: next })} />
        <MasteringColor label="Color" value={value.vignette.color} onChange={next => onSectionChange('vignette', { color: next })} />
      </MasteringModule>

      <MasteringModule title="Shadow Glue" enabled={value.shadowGlue.enabled} onToggle={() => onSectionChange('shadowGlue', { enabled: !value.shadowGlue.enabled })}>
        <SakuraRange label="opac" value={value.shadowGlue.opacity} min={0} max={70} onChange={next => onSectionChange('shadowGlue', { opacity: next })} />
        <SakuraRange label="x" value={value.shadowGlue.x} min={0} max={100} onChange={next => onSectionChange('shadowGlue', { x: next })} />
        <SakuraRange label="y" value={value.shadowGlue.y} min={0} max={100} onChange={next => onSectionChange('shadowGlue', { y: next })} />
        <SakuraRange label="size" value={value.shadowGlue.size} min={20} max={130} onChange={next => onSectionChange('shadowGlue', { size: next })} />
        <SakuraRange label="blur" value={value.shadowGlue.blur} min={0} max={80} onChange={next => onSectionChange('shadowGlue', { blur: next })} />
        <MasteringColor label="Color" value={value.shadowGlue.color} onChange={next => onSectionChange('shadowGlue', { color: next })} />
      </MasteringModule>

      <MasteringModule title="Bloom Glow" enabled={value.bloom.enabled} onToggle={() => onSectionChange('bloom', { enabled: !value.bloom.enabled })}>
        <SakuraRange label="opac" value={value.bloom.opacity} min={0} max={50} onChange={next => onSectionChange('bloom', { opacity: next })} />
        <SakuraRange label="size" value={value.bloom.size} min={20} max={140} onChange={next => onSectionChange('bloom', { size: next })} />
        <SakuraRange label="blur" value={value.bloom.blur} min={0} max={90} onChange={next => onSectionChange('bloom', { blur: next })} />
        <MasteringColor label="Color" value={value.bloom.color} onChange={next => onSectionChange('bloom', { color: next })} />
      </MasteringModule>

      <MasteringModule title="Film Grain" enabled={value.grain.enabled} onToggle={() => onSectionChange('grain', { enabled: !value.grain.enabled })}>
        <SakuraRange label="opac" value={value.grain.opacity} min={0} max={35} onChange={next => onSectionChange('grain', { opacity: next })} />
        <SakuraRange label="scale" value={value.grain.scale} min={1} max={8} onChange={next => onSectionChange('grain', { scale: next })} />
        <SakuraRange label="crisp" value={value.grain.contrast} min={0} max={80} onChange={next => onSectionChange('grain', { contrast: next })} />
        <SakuraRange label="tone" value={value.grain.tone} min={0} max={100} onChange={next => onSectionChange('grain', { tone: next })} />
        <SakuraRange label="hold" value={value.grain.hold} min={0} max={100} onChange={next => onSectionChange('grain', { hold: next })} />
      </MasteringModule>

      <MasteringModule title="Edge Wash" enabled={value.edgeWash.enabled} onToggle={() => onSectionChange('edgeWash', { enabled: !value.edgeWash.enabled })}>
        <SakuraRange label="opac" value={value.edgeWash.opacity} min={0} max={55} onChange={next => onSectionChange('edgeWash', { opacity: next })} />
        <SakuraRange label="angle" value={value.edgeWash.angle} min={0} max={360} onChange={next => onSectionChange('edgeWash', { angle: next })} />
        <MasteringColor label="Color" value={value.edgeWash.color} onChange={next => onSectionChange('edgeWash', { color: next })} />
      </MasteringModule>
    </div>
  );
};

const GlobalCurvesFilterDefs = ({ settings }) => {
  const value = normalizeGlobalMastering(settings);
  const masterPoints = value.curves.channels.rgb;
  const redValues = composeCurveTables(masterPoints, value.curves.channels.r);
  const greenValues = composeCurveTables(masterPoints, value.curves.channels.g);
  const blueValues = composeCurveTables(masterPoints, value.curves.channels.b);

  return (
    <svg className="absolute h-0 w-0 pointer-events-none" aria-hidden="true" focusable="false">
      <defs>
        <filter id={CURVES_FILTER_ID} colorInterpolationFilters="sRGB">
          <feComponentTransfer>
            <feFuncR type="table" tableValues={redValues} />
            <feFuncG type="table" tableValues={greenValues} />
            <feFuncB type="table" tableValues={blueValues} />
            <feFuncA type="identity" />
          </feComponentTransfer>
        </filter>
      </defs>
    </svg>
  );
};

const GlobalMasteringOverlay = ({ settings, scene = false }) => {
  const value = normalizeGlobalMastering(settings);
  if (!value.enabled) return null;

  const { studioDim, light, vignette, grade, shadowGlue, bloom, grain, edgeWash } = value;
  const gradeContrast = 0.78 + (grade.contrast / 100) * 0.44;
  const gradeSaturation = 0.64 + (grade.saturation / 100) * 0.72;
  const gradeBrightness = 0.86 + (grade.lift / 100) * 0.28;
  const warmOpacity = grade.enabled ? Math.abs(grade.warmth - 50) / 150 : 0;
  const warmColor = grade.warmth >= 50 ? '#d88a55' : '#40546a';
  const grainSize = Math.max(42, 150 - grain.scale * 13);
  const grainTone = (grain.tone ?? 50) - 50;
  const grainBaseOpacity = (grain.opacity / 100) * (0.55 + grain.contrast / 150);
  const grainDarkOpacity = grainBaseOpacity * (1 + Math.max(-grainTone, 0) / 70);
  const grainLightOpacity = grainBaseOpacity * (0.86 + Math.max(grainTone, 0) / 85);
  const grainHoldContrast = 1 + (grain.opacity / 100) * ((grain.hold ?? 0) / 100) * 0.22;
  const grainDarkMask = textureDataUrl('<svg viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg"><filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="1.8" numOctaves="3" seed="21" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.33 0.33 0.33 0 0"/><feComponentTransfer><feFuncA type="table" tableValues="0 0.08 0.42 0.9"/></feComponentTransfer></filter><rect width="100%" height="100%" filter="url(#grain)"/></svg>');
  const grainLightMask = textureDataUrl('<svg viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg"><filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="1.8" numOctaves="3" seed="21" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.33 0.33 0.33 0 0"/><feComponentTransfer><feFuncA type="table" tableValues="0.9 0.42 0.08 0"/></feComponentTransfer></filter><rect width="100%" height="100%" filter="url(#grain)"/></svg>');
  const wrapperStyle = scene
    ? { inset: '-38px', borderRadius: '5.25rem' }
    : undefined;

  return (
    <div
      className={`absolute z-[80] pointer-events-none overflow-hidden ${scene ? '' : 'inset-0 rounded-[4rem]'}`}
      style={wrapperStyle}
    >
      {grade.enabled && (
        <div
          className="absolute inset-0"
          style={{
            backdropFilter: `contrast(${gradeContrast}) saturate(${gradeSaturation}) brightness(${gradeBrightness})`,
            WebkitBackdropFilter: `contrast(${gradeContrast}) saturate(${gradeSaturation}) brightness(${gradeBrightness})`
          }}
        />
      )}

      {studioDim.enabled && (
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at ${studioDim.x}% ${studioDim.y}%, transparent 0%, transparent ${Math.max(0, studioDim.softness)}%, ${hexToRgba(studioDim.color, studioDim.opacity / 100)} ${studioDim.size}%)`,
            mixBlendMode: 'multiply'
          }}
        />
      )}

      {light.enabled && (
        <div
          className="absolute inset-0"
          style={{
            opacity: 0.78 + light.warmth / 400,
            background: `radial-gradient(circle at ${light.x}% ${light.y}%, ${hexToRgba(light.color, light.intensity / 100)} 0%, ${hexToRgba(light.color, light.intensity / 190)} ${Math.max(8, light.size * 0.38)}%, transparent ${light.size}%)`,
            mixBlendMode: 'screen'
          }}
        />
      )}

      {grade.enabled && (
        <>
          <div
            className="absolute inset-0"
            style={{
              opacity: grade.opacity / 100,
              backgroundColor: grade.tint,
              mixBlendMode: 'soft-light'
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              opacity: warmOpacity,
              backgroundColor: warmColor,
              mixBlendMode: 'soft-light'
            }}
          />
          {grade.fade > 0 && (
            <div
              className="absolute inset-0"
              style={{
                opacity: grade.fade / 100,
                background: 'linear-gradient(180deg, rgba(246,222,190,0.28), rgba(34,18,12,0.38))',
                mixBlendMode: 'screen'
              }}
            />
          )}
        </>
      )}

      {shadowGlue.enabled && (
        <div
          className="absolute inset-0"
          style={{
            filter: `blur(${shadowGlue.blur}px)`,
            background: `radial-gradient(ellipse at ${shadowGlue.x}% ${shadowGlue.y}%, ${hexToRgba(shadowGlue.color, shadowGlue.opacity / 100)} 0%, ${hexToRgba(shadowGlue.color, shadowGlue.opacity / 180)} ${Math.max(6, shadowGlue.size * 0.5)}%, transparent ${shadowGlue.size}%)`,
            mixBlendMode: 'multiply'
          }}
        />
      )}

      {bloom.enabled && (
        <div
          className="absolute inset-0"
          style={{
            filter: `blur(${bloom.blur}px)`,
            background: `radial-gradient(circle at 50% 48%, ${hexToRgba(bloom.color, bloom.opacity / 100)} 0%, ${hexToRgba(bloom.color, bloom.opacity / 220)} ${Math.max(8, bloom.size * 0.4)}%, transparent ${bloom.size}%)`,
            mixBlendMode: 'screen'
          }}
        />
      )}

      {edgeWash.enabled && (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(${edgeWash.angle}deg, ${hexToRgba(edgeWash.color, edgeWash.opacity / 100)} 0%, transparent 46%, ${hexToRgba(edgeWash.color, edgeWash.opacity / 180)} 100%)`,
            mixBlendMode: 'multiply'
          }}
        />
      )}

      {vignette.enabled && (
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 50% 48%, transparent 0%, transparent ${vignette.size}%, ${hexToRgba(vignette.color, vignette.strength / 160)} ${Math.min(98, vignette.size + vignette.softness * 0.35)}%, ${hexToRgba(vignette.color, vignette.strength / 100)} 100%)`,
            mixBlendMode: 'multiply'
          }}
        />
      )}

      {grain.enabled && (
        <div
          className="absolute inset-0"
          style={{
            maskImage: CENTER_DIAL_GRAIN_EXCLUSION_MASK,
            WebkitMaskImage: CENTER_DIAL_GRAIN_EXCLUSION_MASK
          }}
        >
          {(grain.hold ?? 0) > 0 && (
            <div
              className="absolute inset-0"
              style={{
                backdropFilter: `contrast(${grainHoldContrast})`,
                WebkitBackdropFilter: `contrast(${grainHoldContrast})`
              }}
            />
          )}
          <div
            className="absolute inset-0"
            style={{
              opacity: grainDarkOpacity,
              backgroundColor: '#050302',
              maskImage: grainDarkMask,
              WebkitMaskImage: grainDarkMask,
              maskSize: `${grainSize}px ${grainSize}px`,
              WebkitMaskSize: `${grainSize}px ${grainSize}px`
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              opacity: grainLightOpacity,
              backgroundColor: '#f4ead6',
              maskImage: grainLightMask,
              WebkitMaskImage: grainLightMask,
              maskSize: `${grainSize}px ${grainSize}px`,
              WebkitMaskSize: `${grainSize}px ${grainSize}px`
            }}
          />
        </div>
      )}
    </div>
  );
};

const ShadowShape = ({ x, y, w, h, dx, dy, opacity, blur, rotation = 28, radius = '50%', color = '42,24,13' }) => (
  <div
    className="absolute pointer-events-none"
    style={{
      left: x - w / 2 + dx,
      top: y - h / 2 + dy,
      width: w,
      height: h,
      borderRadius: radius,
      opacity,
      filter: `blur(${blur}px)`,
      background: `radial-gradient(ellipse at 45% 42%, rgba(${color},0.72) 0%, rgba(${color},0.28) 42%, transparent 72%)`,
      transform: `rotate(${rotation}deg)`,
      mixBlendMode: 'multiply'
    }}
  />
);

const ObjectContactShadowLayer = ({ styleIndex, hardwarePositions, shadowAngle = 45 }) => {
  const style = OBJECT_CONTACT_SHADOW_STYLES[styleIndex] || OBJECT_CONTACT_SHADOW_STYLES[0];
  if (!style.opacity) return null;

  const io = hardwarePositions.io || CONTROL_SECTION_PRESETS.io;
  const rate = hardwarePositions.rate || CONTROL_SECTION_PRESETS.rate;
  const lfo = hardwarePositions.lfo || CONTROL_SECTION_PRESETS.lfo;
  const mode = hardwarePositions.mode || CONTROL_SECTION_PRESETS.mode;
  const mix = hardwarePositions.autoGain || CONTROL_SECTION_PRESETS.autoGain;
  const d = style.distance;
  const contactOpacity = 0.12 * style.opacity * style.contact;
  const castOpacity = 0.07 * style.opacity * style.cast;
  const softOpacity = 0.042 * style.opacity;
  const blur = style.blur;
  const angle = shadowAngle * Math.PI / 180;
  const castX = Math.cos(angle);
  const castY = Math.sin(angle);
  const castOffset = (amount) => ({
    dx: castX * amount * d,
    dy: castY * amount * d
  });

  const roundObject = (key, x, y, size, weight = 1) => (
    <React.Fragment key={key}>
      <ShadowShape x={x} y={y} w={size * 1.05} h={size * 0.82} {...castOffset(3)} opacity={contactOpacity * weight} blur={4.5 * blur} rotation={shadowAngle} />
      <ShadowShape x={x} y={y} w={size * 1.35} h={size * 0.72} {...castOffset(14)} opacity={castOpacity * weight} blur={9 * blur} rotation={shadowAngle} />
      <ShadowShape x={x} y={y} w={size * 1.9} h={size * 0.55} {...castOffset(27)} opacity={softOpacity * weight} blur={17 * blur} rotation={shadowAngle} />
    </React.Fragment>
  );

  const rectObject = (key, x, y, w, h, weight = 1, radius = '22px') => (
    <React.Fragment key={key}>
      <ShadowShape x={x} y={y} w={w * 1.02} h={h * 0.92} {...castOffset(3)} opacity={contactOpacity * weight} blur={5 * blur} rotation={shadowAngle} radius={radius} />
      <ShadowShape x={x} y={y} w={w * 1.18} h={h * 0.82} {...castOffset(13)} opacity={castOpacity * weight} blur={11 * blur} rotation={shadowAngle} radius={radius} />
    </React.Fragment>
  );

  const inputX = io.x - 61;
  const outputX = io.x + 61;

  return (
    <div className="absolute inset-0 z-[9] pointer-events-none">
      {roundObject('input', inputX, io.y, 68, 0.9)}
      {roundObject('output', outputX, io.y, 68, 0.9)}
      {roundObject('noise', RIGHT_KNOB_POSITIONS.noise.x, RIGHT_KNOB_POSITIONS.noise.y, 62, 0.8)}
      {roundObject('sweeten', RIGHT_KNOB_POSITIONS.sweeten.x, RIGHT_KNOB_POSITIONS.sweeten.y, 62, 0.8)}
      {roundObject('sat', RIGHT_KNOB_POSITIONS.sat.x, RIGHT_KNOB_POSITIONS.sat.y, 62, 0.86)}
      {roundObject('filter', RIGHT_KNOB_POSITIONS.filter.x, RIGHT_KNOB_POSITIONS.filter.y, 62, 0.86)}
      {roundObject('rate', rate.x, rate.y, 84, 0.75)}
      {roundObject('mix', mix.x, mix.y, 78, 0.8)}
      {roundObject('center', 425, 441, 305, 1)}
      {rectObject('display', 697, 585, 190, 58, 0.75, '26px')}
      {rectObject('flavor', mode.x, mode.y, 98, 240, 0.86, '44px')}
      {roundObject('lfo-button', lfo.x, lfo.y, 74, 0.72)}
    </div>
  );
};

const DepthModelShadowLayer = ({ settings, hardwarePositions }) => {
  const model = normalizeDepthModel(settings);
  if (!model.enabled) return null;

  const heightFactor = model.heightScale / 100;
  const distanceFactor = (105 - model.lightHeight) / 52;
  const layerOpacity = (model.opacity ?? 100) / 100;
  const contactOpacity = (model.contactStrength / 100) * layerOpacity;
  const castOpacity = (model.castStrength / 100) * layerOpacity;
  const softness = model.softness / 100;
  const io = hardwarePositions.io || CONTROL_SECTION_PRESETS.io;
  const rate = hardwarePositions.rate || CONTROL_SECTION_PRESETS.rate;
  const lfo = hardwarePositions.lfo || CONTROL_SECTION_PRESETS.lfo;
  const mode = hardwarePositions.mode || CONTROL_SECTION_PRESETS.mode;
  const mix = hardwarePositions.autoGain || CONTROL_SECTION_PRESETS.autoGain;
  const offsetPoint = (id, x, y) => ({
    x: x + (DEPTH_MODEL_OBJECT_OFFSETS[id]?.x || 0),
    y: y + (DEPTH_MODEL_OBJECT_OFFSETS[id]?.y || 0)
  });
  const rightKnobGrid = RIGHT_KNOB_POSITIONS;
  const objects = [
    { id: 'input', type: 'circle', ...offsetPoint('input', io.x, io.y), r: 34, h: model.heights.smallKnobs, w: 68, height: 68 },
    { id: 'output', type: 'circle', ...offsetPoint('output', io.x, io.y), r: 34, h: model.heights.smallKnobs, w: 68, height: 68 },
    { id: 'noise', type: 'circle', ...offsetPoint('noise', rightKnobGrid.noise.x, rightKnobGrid.noise.y), r: 31, h: model.heights.smallKnobs, w: 62, height: 62 },
    { id: 'sweeten', type: 'circle', ...offsetPoint('sweeten', rightKnobGrid.sweeten.x, rightKnobGrid.sweeten.y), r: 31, h: model.heights.smallKnobs, w: 62, height: 62 },
    { id: 'sat', type: 'circle', ...offsetPoint('sat', rightKnobGrid.sat.x, rightKnobGrid.sat.y), r: 31, h: model.heights.smallKnobs, w: 62, height: 62 },
    { id: 'filter', type: 'circle', ...offsetPoint('filter', rightKnobGrid.filter.x, rightKnobGrid.filter.y), r: 31, h: model.heights.smallKnobs, w: 62, height: 62 },
    { id: 'rate', type: 'circle', ...offsetPoint('rate', rate.x, rate.y), r: 42, h: model.heights.smallKnobs * 0.9, w: 84, height: 84 },
    { id: 'mix', type: 'circle', ...offsetPoint('mix', mix.x, mix.y), r: 40, h: model.heights.smallKnobs * 0.95, w: 80, height: 80 }
  ];

  const shadowFor = (object) => {
    const h = object.h * heightFactor;
    const base = object.type === 'circle'
      ? { rx: object.r, ry: object.r * 0.72 }
      : { rx: object.w / 2, ry: object.height / 2 };
    const edgeDistance = Math.min(base.rx, base.ry) * 0.72;
    const contactDistance = edgeDistance + Math.max(1.1, h * 0.14);
    const midDistance = edgeDistance + h * distanceFactor * 1.35;
    const castDistance = edgeDistance + h * distanceFactor * 3.05;
    const contactBlur = 2.6 + softness * 5.8;
    const midBlur = 5.5 + softness * 12 + h * 0.35;
    const castBlur = 10 + softness * 19 + h * 0.65;
    const clipX = edgeDistance * 0.18;
    const clipY = Math.max(base.ry * 2.9, object.height || object.r * 3);
    const clipW = Math.max(260, base.rx * 5);

    const shape = (suffix, distance, rxScale, ryScale, opacity, blur) => (
      <ellipse
        key={`${object.id}-${suffix}`}
        cx={distance}
        cy={0}
        rx={base.rx * rxScale}
        ry={base.ry * ryScale}
        fill={`rgba(40,23,14,${opacity})`}
        style={{ filter: `blur(${blur}px)` }}
      />
    );

    const rectShape = (suffix, distance, scale, opacity, blur) => (
      <rect
        key={`${object.id}-${suffix}`}
        x={distance - (object.w * scale) / 2}
        y={-(object.height * scale) / 2}
        width={object.w * scale}
        height={object.height * scale}
        rx={(object.radius || 24) * scale}
        fill={`rgba(40,23,14,${opacity})`}
        style={{ filter: `blur(${blur}px)` }}
      />
    );

    if (object.type === 'rect') {
      return (
        <g key={object.id} transform={`translate(${object.x} ${object.y}) rotate(${model.shadowAngle})`}>
          <clipPath id={`depth-model-cast-${object.id}`}>
            <rect x={clipX} y={-clipY / 2} width={clipW} height={clipY} />
          </clipPath>
          <g clipPath={`url(#depth-model-cast-${object.id})`}>
            {rectShape('contact', contactDistance, 1.01, 0.13 * contactOpacity, contactBlur)}
            {rectShape('mid', midDistance, 1.08, 0.07 * castOpacity, midBlur)}
            {rectShape('cast', castDistance, 1.16, 0.034 * castOpacity, castBlur)}
          </g>
        </g>
      );
    }

    return (
      <g key={object.id} transform={`translate(${object.x} ${object.y}) rotate(${model.shadowAngle})`}>
        <clipPath id={`depth-model-cast-${object.id}`}>
          <rect x={clipX} y={-clipY / 2} width={clipW} height={clipY} />
        </clipPath>
        <g clipPath={`url(#depth-model-cast-${object.id})`}>
          {shape('contact', contactDistance, 1.02, 0.82, 0.14 * contactOpacity, contactBlur)}
          {shape('mid', midDistance, 1.22, 0.72, 0.078 * castOpacity, midBlur)}
          {shape('cast', castDistance, 1.55, 0.56, 0.035 * castOpacity, castBlur)}
        </g>
      </g>
    );
  };

  return (
    <svg className="absolute inset-0 z-[9] pointer-events-none overflow-visible" viewBox="0 0 850 850" width="850" height="850" aria-hidden="true">
      <g style={{ mixBlendMode: 'multiply' }}>
        {objects.map(shadowFor)}
      </g>
    </svg>
  );
};

const CenterDepthShadowLayer = ({ settings, canvasSize = 850, centerX = 425, centerY = 441, className = 'absolute inset-0 z-[9] pointer-events-none overflow-visible' }) => {
  const model = normalizeCenterDepthModel(settings);
  if (!model.enabled) return null;

  const cx = centerX + model.x;
  const cy = centerY + model.y;
  const h = model.height;
  const contactDistance = 112 + Math.max(1, h * 0.5);
  const midDistance = 112 + model.distance * 0.48;
  const castDistance = 112 + model.distance;
  const sizeScale = model.size / 100;
  const contactBlur = 5 + model.softness * 0.08;
  const midBlur = 10 + model.softness * 0.16;
  const castBlur = 18 + model.softness * 0.28;
  const layerOpacity = (model.opacity ?? 100) / 100;
  const contactOpacity = (model.contactStrength / 100) * layerOpacity;
  const castOpacity = (model.castStrength / 100) * layerOpacity;
  const clipX = 40;
  const clipY = 360;

  const shape = (key, distance, rx, ry, opacity, blur) => (
    <ellipse
      key={key}
      cx={distance}
      cy={0}
      rx={rx * sizeScale}
      ry={ry * sizeScale}
      fill={`rgba(40,23,14,${opacity})`}
      style={{ filter: `blur(${blur}px)` }}
    />
  );

  return (
    <svg className={className} viewBox={`0 0 ${canvasSize} ${canvasSize}`} width={canvasSize} height={canvasSize} aria-hidden="true">
      <g style={{ mixBlendMode: 'multiply' }} transform={`translate(${cx} ${cy}) rotate(${model.shadowAngle})`}>
        <clipPath id="center-depth-model-cast">
          <rect x={clipX} y={-clipY / 2} width="470" height={clipY} />
        </clipPath>
        <g clipPath="url(#center-depth-model-cast)">
          {shape('center-contact', contactDistance, 124, 78, 0.11 * contactOpacity, contactBlur)}
          {shape('center-mid', midDistance, 146, 66, 0.07 * castOpacity, midBlur)}
          {shape('center-cast', castDistance, 178, 52, 0.032 * castOpacity, castBlur)}
        </g>
      </g>
    </svg>
  );
};

const ScrewHead = ({ styleIndex = 0, size: sizeOverride }) => {
  const style = SCREW_STYLES[styleIndex] || SCREW_STYLES[0];
  const size = sizeOverride || style.size;
  const scale = size / style.size;

  return (
    <div
      className="relative flex items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        opacity: style.opacity,
        backgroundColor: style.bg,
        border: `${Math.max(1, scale)}px solid ${style.border}`,
        boxShadow: style.shadow
      }}
    >
      <div
        className="rounded-full"
        style={{
          width: style.slotWidth,
          height: Math.max(1, style.slotHeight * scale),
          backgroundColor: style.slot,
          opacity: 0.9,
          transform: `rotate(${style.slotRotate}deg)`,
          boxShadow: '0 1px 0 rgba(255,255,255,0.15)'
        }}
      />
    </div>
  );
};

const CornerScrews = ({ enabled, styleIndex }) => {
  if (!enabled) return null;
  const corners = [
    { id: 'top-left', x: 38, y: 38 },
    { id: 'top-right', x: 812, y: 38 },
    { id: 'bottom-left', x: 38, y: 812 },
    { id: 'bottom-right', x: 812, y: 812 }
  ];
  return (
    <div className="absolute inset-0 pointer-events-none z-[39]">
      {corners.map(corner => (
        <div
          key={corner.id}
          className="absolute"
          style={{ left: corner.x, top: corner.y, transform: 'translate(-50%, -50%)' }}
        >
          <ScrewHead styleIndex={styleIndex} corner={corner.id} />
        </div>
      ))}
    </div>
  );
};

const SakuraControlGroup = ({ title, settings, onToggle, onUpdate }) => (
  <div className="w-full flex flex-col gap-2">
    <div className="flex items-center justify-between">
      <span className="text-white font-medium text-[13px] tracking-wide">{title}</span>
      <SakuraToggle active={settings.enabled} onClick={onToggle} label={settings.enabled ? 'on' : 'off'} />
    </div>
    <div className={`flex flex-col gap-1.5 transition-opacity duration-200 ${settings.enabled ? 'opacity-100' : 'opacity-45'}`}>
      <SakuraRange label="x" value={settings.x} min={0} max={1000} onChange={value => onUpdate({ x: value })} />
      <SakuraRange label="y" value={settings.y} min={0} max={850} onChange={value => onUpdate({ y: value })} />
      <SakuraRange label="size" value={settings.size} min={40} max={520} onChange={value => onUpdate({ size: value })} />
      <SakuraRange label="rot" value={settings.rotate} min={-180} max={180} onChange={value => onUpdate({ rotate: value })} />
    </div>
  </div>
);

const EditableDecorativeCircles = ({ circles, selectedId, setSelectedId, onUpdate, stageRef }) => {
  const circleEntries = Object.entries(circles);
  const getScale = () => {
    const rect = stageRef.current?.getBoundingClientRect();
    return rect ? rect.width / 850 : 1;
  };
  const getLocalPoint = (event) => {
    const rect = stageRef.current?.getBoundingClientRect();
    const scale = getScale();
    return {
      x: rect ? (event.clientX - rect.left) / scale : event.clientX,
      y: rect ? (event.clientY - rect.top) / scale : event.clientY
    };
  };
  const startCircleEdit = (event, id, mode) => {
    const circle = circles[id];
    if (!circle || circle.locked) return;
    event.preventDefault();
    event.stopPropagation();
    setSelectedId(id);
    const startClient = { x: event.clientX, y: event.clientY };
    const start = { ...circle };
    const handleMove = (moveEvent) => {
      const scale = getScale();
      if (mode === 'move') {
        onUpdate(id, {
          x: Math.round(start.x + (moveEvent.clientX - startClient.x) / scale),
          y: Math.round(start.y + (moveEvent.clientY - startClient.y) / scale)
        });
      }
      if (mode === 'resize') {
        const delta = ((moveEvent.clientX - startClient.x) + (moveEvent.clientY - startClient.y)) / scale;
        onUpdate(id, { size: Math.round(Math.max(24, Math.min(1200, start.size + delta))) });
      }
      if (mode === 'rotate') {
        const point = getLocalPoint(moveEvent);
        onUpdate(id, { rotate: Math.round(Math.atan2(point.y - start.y, point.x - start.x) * 180 / Math.PI + 90) });
      }
    };
    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  };

  return (
    <>
      {circleEntries.map(([id, circle]) => {
        if (!circle.enabled) return null;
        const selected = selectedId === id && !circle.locked;
        return (
          <div
            key={id}
            onPointerDown={event => startCircleEdit(event, id, 'move')}
            className={`absolute select-none ${circle.locked ? 'pointer-events-none' : 'cursor-move touch-none'}`}
            style={{
              left: circle.x - circle.size / 2,
              top: circle.y - circle.size / 2,
              width: circle.size,
              height: circle.size,
              zIndex: selected ? 38 : 'auto'
            }}
          >
            <div
              className={`absolute inset-0 ${id.startsWith('leaf') ? '' : 'rounded-full'} pointer-events-none`}
              style={{
                backgroundColor: id.startsWith('leaf') ? 'transparent' : circle.color,
                opacity: circle.opacity,
                mixBlendMode: 'multiply',
                transform: `rotate(${circle.rotate}deg)`,
                transformOrigin: 'center'
              }}
            >
              {id.startsWith('leaf') && (
                <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full overflow-visible" style={{ filter: 'drop-shadow(15px 15px 20px rgba(0,0,0,0.4))' }}>
                  <defs>
                    <clipPath id={`monstera-cuts-${id}`}>
                      <rect width="200" height="200" fill="white" />
                      <ellipse cx="20" cy="70" rx="35" ry="12" transform="rotate(25 20 70)" fill="black" />
                      <ellipse cx="10" cy="110" rx="40" ry="15" transform="rotate(10 10 110)" fill="black" />
                      <ellipse cx="30" cy="160" rx="30" ry="10" transform="rotate(-15 30 160)" fill="black" />
                      <ellipse cx="160" cy="50" rx="40" ry="15" transform="rotate(-30 160 50)" fill="black" />
                      <ellipse cx="180" cy="100" rx="45" ry="16" transform="rotate(-10 180 100)" fill="black" />
                      <ellipse cx="160" cy="150" rx="35" ry="12" transform="rotate(15 160 150)" fill="black" />
                      <circle cx="110" cy="40" r="8" fill="black" />
                      <ellipse cx="60" cy="80" rx="12" ry="6" transform="rotate(30 60 80)" fill="black" />
                      <ellipse cx="140" cy="90" rx="15" ry="7" transform="rotate(-20 140 90)" fill="black" />
                      <circle cx="120" cy="130" r="9" fill="black" />
                      <circle cx="70" cy="140" r="7" fill="black" />
                    </clipPath>
                  </defs>
                  <g transform="translate(0, 0) scale(1)">
                    <path 
                      d="M 100 10 C 170 10 190 70 180 130 C 170 190 120 190 100 190 C 80 190 30 190 20 130 C 10 70 30 10 100 10 Z" 
                      fill={circle.color} 
                      clipPath={`url(#monstera-cuts-${id})`} 
                    />
                  </g>
                </svg>
              )}
            </div>
            {selected && (
              <>
                <div className="absolute -inset-1 rounded-full border border-white/90 border-dashed pointer-events-none shadow-[0_0_12px_rgba(255,255,255,0.45)]" />
                <button
                  aria-label="Resize circle"
                  onPointerDown={event => startCircleEdit(event, id, 'resize')}
                  className="absolute -right-3 -bottom-3 h-6 w-6 rounded-full border-2 border-white bg-[#e66a53] shadow-lg cursor-nwse-resize"
                />
                <button
                  aria-label="Rotate circle"
                  onPointerDown={event => startCircleEdit(event, id, 'rotate')}
                  className="absolute left-1/2 -top-11 h-6 w-6 -translate-x-1/2 rounded-full border-2 border-white bg-[#d4af37] shadow-lg cursor-grab"
                />
                <div className="absolute left-1/2 -top-5 h-5 w-px -translate-x-1/2 bg-white/80 pointer-events-none" />
              </>
            )}
          </div>
        );
      })}
    </>
  );
};

const CircleControlGroup = ({ id, title, settings, selected, onSelect, onToggle, onLockToggle, onUpdate }) => (
  <div className={`w-full flex flex-col gap-3 p-3 rounded-2xl transition-all ${selected ? 'bg-white/10 ring-1 ring-white/20 shadow-lg' : 'bg-white/5'}`}>
    <div className="flex items-center justify-between gap-2">
      <button
        onClick={onSelect}
        className={`flex-1 rounded-full border-[2px] px-3 py-1.5 text-[10px] font-black tracking-widest transition-all uppercase ${selected ? 'bg-[#edd39a] border-[#edd39a] text-black' : 'border-white/20 text-white/70 hover:border-white/40'}`}
      >
        {title}
      </button>
      <SakuraToggle active={settings.enabled} onClick={onToggle} label={settings.enabled ? 'on' : 'off'} />
    </div>
    
    {selected && (
      <div className="flex flex-col gap-4 mt-2 pt-2 border-t border-white/5">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Movement</span>
          <button
            onClick={onLockToggle}
            className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border transition-all ${settings.locked ? 'bg-white/5 border-white/10 text-white/30' : 'bg-white/20 border-white/40 text-white'}`}
          >
            {settings.locked ? 'Locked' : 'Unlocked'}
          </button>
        </div>
        
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Color</span>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border border-white/20 shadow-inner" style={{ backgroundColor: settings.color }} />
              <input 
                type="color" 
                value={settings.color} 
                onChange={e => onUpdate({ color: e.target.value })}
                className="w-8 h-8 opacity-0 absolute cursor-pointer"
              />
              <span className="text-[10px] font-mono text-white/60 uppercase">{settings.color}</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[9px] font-bold text-white/40 uppercase tracking-widest">
              <span>Opacity</span>
              <span className="text-white/60">{(settings.opacity * 100).toFixed(0)}%</span>
            </div>
            <input 
              type="range" min="0" max="1" step="0.01" 
              value={settings.opacity} 
              onChange={e => onUpdate({ opacity: Number(e.target.value) })}
              className="w-full accent-[#edd39a]"
            />
          </div>
        </div>
      </div>
    )}
  </div>
);

const EditableBottomLeftShapes = ({ shapes, selectedId, setSelectedId, onUpdate, stageRef, showStems }) => {
  const getScale = () => {
    const rect = stageRef.current?.getBoundingClientRect();
    return rect ? rect.width / 850 : 1;
  };
  const getLocalPoint = (event) => {
    const rect = stageRef.current?.getBoundingClientRect();
    const scale = getScale();
    return {
      x: rect ? (event.clientX - rect.left) / scale : event.clientX,
      y: rect ? (event.clientY - rect.top) / scale : event.clientY
    };
  };
  const startShapeEdit = (event, id, mode) => {
    const shape = shapes[id];
    if (!shape || shape.locked) return;
    event.preventDefault();
    event.stopPropagation();
    setSelectedId(id);
    const startClient = { x: event.clientX, y: event.clientY };
    const start = { ...shape };
    const handleMove = (moveEvent) => {
      const scale = getScale();
      if (mode === 'move') {
        onUpdate(id, {
          x: Math.round(start.x + (moveEvent.clientX - startClient.x) / scale),
          y: Math.round(start.y + (moveEvent.clientY - startClient.y) / scale)
        });
      }
      if (mode === 'resize') {
        const delta = ((moveEvent.clientX - startClient.x) + (moveEvent.clientY - startClient.y)) / scale;
        onUpdate(id, { size: Math.round(Math.max(60, Math.min(460, start.size + delta))) });
      }
      if (mode === 'rotate') {
        const point = getLocalPoint(moveEvent);
        onUpdate(id, { rotate: Math.round(Math.atan2(point.y - start.y, point.x - start.x) * 180 / Math.PI + 90) });
      }
    };
    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  };
  const leafPath = 'M 100 10 C 170 10 190 70 180 130 C 170 190 120 190 100 190 C 80 190 30 190 20 130 C 10 70 30 10 100 10 Z';

  return (
    <>
      {Object.entries(shapes).map(([id, shape]) => {
        if (!shape.enabled) return null;
        const selected = selectedId === id && !shape.locked;
        const isLarge = shape.variant === 'large';
        const clipId = `monstera-cuts-${id}`;
        const groupTransform = isLarge
          ? 'translate(10, 10) rotate(15) scale(0.9)'
          : 'translate(-20, 80) rotate(-20) scale(0.6)';
        return (
          <div
            key={id}
            onPointerDown={event => startShapeEdit(event, id, 'move')}
            className={`absolute select-none ${shape.locked ? 'pointer-events-none' : 'cursor-move touch-none'}`}
            style={{
              left: shape.x - shape.size / 2,
              top: shape.y - shape.size / 2,
              width: shape.size,
              height: shape.size,
              transform: `rotate(${shape.rotate}deg)`,
              transformOrigin: 'center',
              zIndex: selected ? 38 : 1
            }}
          >
            <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full overflow-visible opacity-[0.9] mix-blend-multiply pointer-events-none" style={{ filter: 'drop-shadow(15px 15px 20px rgba(0,0,0,0.4))' }}>
              <defs>
                <clipPath id={clipId}>
                  <rect width="200" height="200" fill="white" />
                  <ellipse cx="20" cy="70" rx="35" ry="12" transform="rotate(25 20 70)" fill="black" />
                  <ellipse cx="10" cy="110" rx="40" ry="15" transform="rotate(10 10 110)" fill="black" />
                  <ellipse cx="30" cy="160" rx="30" ry="10" transform="rotate(-15 30 160)" fill="black" />
                  <ellipse cx="160" cy="50" rx="40" ry="15" transform="rotate(-30 160 50)" fill="black" />
                  <ellipse cx="180" cy="100" rx="45" ry="16" transform="rotate(-10 180 100)" fill="black" />
                  <ellipse cx="160" cy="150" rx="35" ry="12" transform="rotate(15 160 150)" fill="black" />
                  <circle cx="110" cy="40" r="8" fill="black" />
                  <ellipse cx="60" cy="80" rx="12" ry="6" transform="rotate(30 60 80)" fill="black" />
                  <ellipse cx="140" cy="90" rx="15" ry="7" transform="rotate(-20 140 90)" fill="black" />
                  <circle cx="120" cy="130" r="9" fill="black" />
                  <circle cx="70" cy="140" r="7" fill="black" />
                </clipPath>
              </defs>
              <g transform={groupTransform}>
                <path d={leafPath} fill={isLarge ? '#2c3e35' : '#1e2a24'} clipPath={`url(#${clipId})`} />
                {showStems && <path d="M 100 10 C 100 10 95 190 95 190" stroke={isLarge ? '#1e2a24' : '#111'} strokeWidth={isLarge ? 3 : 4} fill="none" />}
              </g>
            </svg>
            {selected && (
              <>
                <div className="absolute -inset-1 rounded-[2rem] border border-white/90 border-dashed pointer-events-none shadow-[0_0_12px_rgba(255,255,255,0.45)]" />
                <button aria-label="Resize shape" onPointerDown={event => startShapeEdit(event, id, 'resize')} className="absolute -right-3 -bottom-3 h-6 w-6 rounded-full border-2 border-white bg-[#e66a53] shadow-lg cursor-nwse-resize" />
                <button aria-label="Rotate shape" onPointerDown={event => startShapeEdit(event, id, 'rotate')} className="absolute left-1/2 -top-11 h-6 w-6 -translate-x-1/2 rounded-full border-2 border-white bg-[#d4af37] shadow-lg cursor-grab" />
                <div className="absolute left-1/2 -top-5 h-5 w-px -translate-x-1/2 bg-white/80 pointer-events-none" />
              </>
            )}
          </div>
        );
      })}
    </>
  );
};

const BottomShapeControlGroup = ({ title, settings, selected, onSelect, onToggle, onLockToggle }) => (
  <div className="w-full flex flex-col gap-2">
    <div className="flex items-center justify-between gap-2">
      <button
        onClick={onSelect}
        className={`flex-1 rounded-full border-[3px] px-3 py-1.5 text-[10px] font-medium tracking-wide transition-colors ${selected ? 'bg-white/20 border-white text-white' : 'border-white/70 text-white/85'}`}
      >
        {title}
      </button>
      <SakuraToggle active={settings.enabled} onClick={onToggle} label={settings.enabled ? 'on' : 'off'} />
    </div>
    <button
      onClick={onLockToggle}
      className={`w-full rounded-full border-[3px] px-3 py-1.5 text-[10px] font-medium tracking-wide transition-colors ${settings.locked ? 'border-white/70 text-white/85' : 'bg-white/20 border-white text-white'}`}
    >
      {settings.locked ? 'locked' : 'unlocked'}
    </button>
  </div>
);

// --- Botanical SVGs ---
const DetailedMonstera = ({ showStems = true }) => (
  <svg viewBox="0 0 200 200" className="absolute -bottom-10 -left-10 w-80 h-80 pointer-events-none opacity-[0.9] mix-blend-multiply z-0" style={{ filter: 'drop-shadow(15px 15px 20px rgba(0,0,0,0.4))' }}>
    <defs><clipPath id="monstera-cuts"><rect width="200" height="200" fill="white" /><ellipse cx="20" cy="70" rx="35" ry="12" transform="rotate(25 20 70)" fill="black" /><ellipse cx="10" cy="110" rx="40" ry="15" transform="rotate(10 10 110)" fill="black" /><ellipse cx="30" cy="160" rx="30" ry="10" transform="rotate(-15 30 160)" fill="black" /><ellipse cx="160" cy="50" rx="40" ry="15" transform="rotate(-30 160 50)" fill="black" /><ellipse cx="180" cy="100" rx="45" ry="16" transform="rotate(-10 180 100)" fill="black" /><ellipse cx="160" cy="150" rx="35" ry="12" transform="rotate(15 160 150)" fill="black" /><circle cx="110" cy="40" r="8" fill="black" /><ellipse cx="60" cy="80" rx="12" ry="6" transform="rotate(30 60 80)" fill="black" /><ellipse cx="140" cy="90" rx="15" ry="7" transform="rotate(-20 140 90)" fill="black" /><circle cx="120" cy="130" r="9" fill="black" /><circle cx="70" cy="140" r="7" fill="black" /></clipPath></defs>
    <g transform="translate(10, 10) rotate(15) scale(0.9)"><path d="M 100 10 C 170 10 190 70 180 130 C 170 190 120 190 100 190 C 80 190 30 190 20 130 C 10 70 30 10 100 10 Z" fill="#2c3e35" clipPath="url(#monstera-cuts)" />{showStems && <path d="M 100 10 C 100 10 95 190 95 190" stroke="#1e2a24" strokeWidth="3" fill="none" />}</g>
    <g transform="translate(-20, 80) rotate(-20) scale(0.6)"><path d="M 100 10 C 170 10 190 70 180 130 C 170 190 120 190 100 190 C 80 190 30 190 20 130 C 10 70 30 10 100 10 Z" fill="#1e2a24" clipPath="url(#monstera-cuts)" />{showStems && <path d="M 100 10 C 100 10 95 190 95 190" stroke="#111" strokeWidth="4" fill="none" />}</g>
  </svg>
);

const DetailedFernsRight = ({ showFerns = true }) => {
  if (!showFerns) return null;
  return (
  <svg viewBox="0 0 200 200" className="absolute -bottom-10 -right-10 w-80 h-80 pointer-events-none opacity-[0.9] mix-blend-multiply z-0" style={{ filter: 'drop-shadow(-10px 15px 20px rgba(0,0,0,0.4))' }}>
    <g transform="translate(60, 20) rotate(35) scale(0.8)">
      <line x1="100" y1="200" x2="100" y2="0" stroke="#2c3e35" strokeWidth="4" strokeLinecap="round" />
      {[...Array(20)].map((_, i) => { const y = 180 - (i * 9), s = 35 - (i * 1.5); return (<g key={`f1-${i}`}><path d={`M 100 ${y} C ${100-s*0.8} ${y-s*0.2} ${100-s} ${y-s*0.8} ${100-s*1.2} ${y-s} C ${100-s*0.5} ${y-s*0.3} 100 ${y-2} 100 ${y}`} fill="#2c3e35" /><path d={`M 100 ${y-4} C ${100+s*0.8} ${y-4-s*0.2} ${100+s} ${y-4-s*0.8} ${100+s*1.2} ${y-4-s} C ${100+s*0.5} ${y-4-s*0.3} 100 ${y-6} 100 ${y-4}`} fill="#1e2a24" /></g>); })}
    </g>
    <g transform="translate(130, 60) rotate(-15) scale(0.6)">
      <line x1="100" y1="200" x2="100" y2="0" stroke="#3a2323" strokeWidth="4" strokeLinecap="round" />
      {[...Array(18)].map((_, i) => { const y = 180 - (i * 10), s = 30 - (i * 1.5); return (<g key={`f2-${i}`}><path d={`M 100 ${y} C ${100-s*0.8} ${y-s*0.2} ${100-s} ${y-s*0.8} ${100-s*1.2} ${y-s} C ${100-s*0.5} ${y-s*0.3} 100 ${y-2} 100 ${y}`} fill="#4d2b2b" /><path d={`M 100 ${y-4} C ${100+s*0.8} ${y-4-s*0.2} ${100+s} ${y-4-s*0.8} ${100+s*1.2} ${y-4-s} C ${100+s*0.5} ${y-4-s*0.3} 100 ${y-6} 100 ${y-4}`} fill="#3a2323" /></g>); })}
    </g>
    <g transform="translate(40, 100)"><circle cx="50" cy="50" r="18" fill="#a63c3c" /><circle cx="65" cy="40" r="14" fill="#c44d4d" /><circle cx="40" cy="35" r="12" fill="#8a2e2e" /><circle cx="55" cy="55" r="8" fill="#e66a53" /><path d="M 50 68 Q 60 90 80 120" stroke="#a63c3c" strokeWidth="2" fill="none" /></g>
  </svg>
  );
};

const HardwareLED = ({ active, color = 'red', size = 8, label, pulse = false }) => {
  const colors = {
    red: { bg: '#ff4444', glow: '0 0 12px #ff4444' },
    green: { bg: '#44ff44', glow: '0 0 12px #44ff44' },
    amber: { bg: '#ffaa00', glow: '0 0 12px #ffaa00' },
    coral: { bg: '#e66a53', glow: '0 0 12px #e66a53' },
    gold: { bg: '#d4af37', glow: '0 0 12px #d4af37' }
  };
  const theme = colors[color] || colors.red;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative flex items-center justify-center" style={{ width: size + 4, height: size + 4 }}>
        <div className="absolute inset-0 rounded-full bg-black/40 shadow-inner" />
        <div 
          className={`rounded-full transition-all duration-200 ${pulse && active ? 'animate-pulse' : ''}`}
          style={{ 
            width: size, 
            height: size, 
            backgroundColor: active ? theme.bg : '#222',
            boxShadow: active ? theme.glow : 'inset 0 1px 1px rgba(0,0,0,0.5)',
            border: active ? 'none' : '1px solid rgba(255,255,255,0.05)'
          }}
        />
      </div>
      {label && <span className="text-[9px] font-bold tracking-[0.2em] text-[#8b7b65] uppercase">{label}</span>}
    </div>
  );
};


const AnalogCables = ({ position = 'left', parallel = true }) => {
  const leftCable1Splayed = "M 150,214 C 150,124 90,84 30,-20";
  const leftCable2Splayed = "M 235,214 C 235,124 295,84 355,-20";
  const rightCable1Splayed = "M 150,214 C 150,154 70,94 10,-20";
  const rightCable2Splayed = "M 235,214 C 235,104 320,134 380,-20";

  const leftCable1Parallel = "M 150,214 C 150,124 90,84 30,-20";
  const leftCable2Parallel = "M 235,214 C 235,124 175,84 115,-20";
  const rightCable1Parallel = "M 150,214 C 150,124 220,84 280,-20";
  const rightCable2Parallel = "M 235,214 C 235,104 290,64 350,-20";

  const path1 = position === 'left' ? (parallel ? leftCable1Parallel : leftCable1Splayed) : (parallel ? rightCable1Parallel : rightCable1Splayed);
  const path2 = position === 'left' ? (parallel ? leftCable2Parallel : leftCable2Splayed) : (parallel ? rightCable2Parallel : rightCable2Splayed);

  return (
    <div className={`absolute top-[-28px] ${position === 'left' ? 'left-[20%] -translate-x-1/2' : 'right-[20%] translate-x-1/2'} -translate-y-[85%] w-[45%] z-[-2] pointer-events-none`}>
      <svg viewBox="0 0 400 300" className="w-full h-auto" style={{ 
        filter: 'drop-shadow(15px 25px 20px rgba(0,0,0,0.6))',
        transform: position === 'right' ? 'scaleX(-1)' : 'none'
      }}>
        <defs>
          <linearGradient id="jackGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0a0a0a"/>
            <stop offset="15%" stopColor="#2a2a2a"/>
            <stop offset="30%" stopColor="#666"/>
            <stop offset="50%" stopColor="#1a1a1a"/>
            <stop offset="80%" stopColor="#0a0a0a"/>
            <stop offset="95%" stopColor="#333"/>
            <stop offset="100%" stopColor="#000"/>
          </linearGradient>
        </defs>

        {/* Cable 1 */}
        <g>
          <path d={path1} fill="none" stroke="#050505" strokeWidth="26" strokeLinecap="round" />
          <path d={path1} fill="none" stroke="#1c1c1c" strokeWidth="22" strokeLinecap="round" />
          <path d={path1} fill="none" stroke="#2a2a2a" strokeWidth="12" strokeLinecap="round" style={{ transform: 'translate(-1px, -1px)' }} />
          <path d={path1} fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.15" style={{ transform: 'translate(-3px, -3px)' }} />
        </g>
        
        {/* Jack 1 */}
        <rect x="134" y="204" width="32" height="100" fill="url(#jackGrad)" rx="4" />
        <rect x="130" y="256" width="40" height="30" fill="#111" rx="2" />
        <rect x="134" y="219" width="32" height="4" fill="#d1c5ab" opacity="0.9" />
        
        {/* Cable 2 */}
        <g>
          <path d={path2} fill="none" stroke="#050505" strokeWidth="26" strokeLinecap="round" />
          <path d={path2} fill="none" stroke="#1c1c1c" strokeWidth="22" strokeLinecap="round" />
          <path d={path2} fill="none" stroke="#2a2a2a" strokeWidth="12" strokeLinecap="round" style={{ transform: 'translate(-1px, -1px)' }} />
          <path d={path2} fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.15" style={{ transform: 'translate(-3px, -3px)' }} />
        </g>

        {/* Jack 2 */}
        <rect x="219" y="204" width="32" height="100" fill="url(#jackGrad)" rx="4" />
        <rect x="215" y="256" width="40" height="30" fill="#111" rx="2" />
        <rect x="219" y="219" width="32" height="4" fill="#e66a53" opacity="0.9" />
        
        {/* Ribs */}
        {[...Array(6)].map((_, i) => (
          <g key={`rib-${i}`}>
            <line x1="134" y1={239 + i*6} x2="166" y2={239 + i*6} stroke="#050505" strokeWidth="2" />
            <line x1="219" y1={239 + i*6} x2="251" y2={239 + i*6} stroke="#050505" strokeWidth="2" />
          </g>
        ))}
      </svg>
    </div>
  );
};

// --- UI Components ---
const KNOB_STYLES = [
  { name: 'Original (Levitating)', boxShadow: '12px 12px 20px rgba(0,0,0,0.45), 4px 4px 6px rgba(0,0,0,0.35), inset 1px 1px 2px rgba(255,255,255,0.3), inset -1px -1px 3px rgba(0,0,0,0.9)', backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.8) 100%), conic-gradient(from 180deg at 50% 50%, #0a0a0a 0deg, #252525 45deg, #0a0a0a 90deg, #252525 135deg, #0a0a0a 180deg, #252525 225deg, #0a0a0a 270deg, #252525 315deg, #0a0a0a 360deg)', backgroundColor: '#111' },
  { name: 'Dark Brushed Metal', boxShadow: '0px 12px 20px rgba(0,0,0,0.5), 0px 4px 8px rgba(0,0,0,0.6), inset 0px 1px 3px rgba(255,255,255,0.4), inset 0px -2px 5px rgba(0,0,0,0.9)', backgroundImage: 'conic-gradient(from 180deg at 50% 50%, #1a1a1a 0deg, #3a3a3a 45deg, #1a1a1a 90deg, #3a3a3a 135deg, #1a1a1a 180deg, #3a3a3a 225deg, #1a1a1a 270deg, #3a3a3a 315deg, #1a1a1a 360deg)', backgroundColor: '#111' },
  { name: 'Soft Matte Rubber', boxShadow: '0px 15px 30px rgba(0,0,0,0.35), 0px 5px 15px rgba(0,0,0,0.45), inset 0px 1px 1px rgba(255,255,255,0.05), inset 0px -2px 4px rgba(0,0,0,0.5)', backgroundImage: 'none', backgroundColor: '#1f1f1f' },
  {
    name: 'Graphite Anodized Grip',
    boxShadow: '10px 13px 18px rgba(0,0,0,0.48), 2px 4px 7px rgba(0,0,0,0.42), inset 1px 1px 2px rgba(255,255,255,0.16), inset -2px -3px 6px rgba(0,0,0,0.82)',
    backgroundImage: 'linear-gradient(145deg, rgba(255,255,255,0.12), transparent 42%, rgba(0,0,0,0.34)), conic-gradient(from 190deg at 50% 50%, #151718, #3a3d3f, #17191a, #303436, #151718)',
    backgroundColor: '#181a1b',
    edgeTexture: 'repeating-conic-gradient(from 0deg, rgba(220,230,230,0.14) 0deg 1deg, rgba(0,0,0,0.24) 1deg 3deg)',
    edgeOpacity: 0.48,
    edgeMask: 'radial-gradient(circle, transparent 0 68%, #000 70% 100%)',
    faceOverlay: 'radial-gradient(circle at 50% 50%, transparent 0 58%, rgba(255,255,255,0.08) 62%, rgba(0,0,0,0.34) 82%, transparent 88%)'
  },
  {
    name: 'Original Graphite Grip',
    boxShadow: '6px 12px 20px rgba(0,0,0,0.45), 3px 4px 6px rgba(0,0,0,0.35), inset 1px 1px 2px rgba(255,255,255,0.3), inset -1px -1px 3px rgba(0,0,0,0.9)',
    backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.8) 100%), conic-gradient(from 180deg at 50% 50%, #0a0a0a 0deg, #252525 45deg, #0a0a0a 90deg, #252525 135deg, #0a0a0a 180deg, #252525 225deg, #0a0a0a 270deg, #252525 315deg, #0a0a0a 360deg)',
    backgroundColor: '#111',
    edgeTexture: 'repeating-conic-gradient(from 0deg, rgba(220,230,230,0.14) 0deg 1deg, rgba(0,0,0,0.24) 1deg 3deg)',
    edgeOpacity: 0.48,
    edgeMask: 'radial-gradient(circle, transparent 0 68%, #000 70% 100%)',
    faceOverlay: 'radial-gradient(circle at 50% 50%, transparent 0 58%, rgba(255,255,255,0.08) 62%, rgba(0,0,0,0.34) 82%, transparent 88%)'
  },
  {
    name: 'Original Graphite Grip Cream Pointer',
    boxShadow: '6px 12px 20px rgba(0,0,0,0.45), 3px 4px 6px rgba(0,0,0,0.35), inset 1px 1px 2px rgba(255,255,255,0.3), inset -1px -1px 3px rgba(0,0,0,0.9)',
    backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.8) 100%), conic-gradient(from 180deg at 50% 50%, #0a0a0a 0deg, #252525 45deg, #0a0a0a 90deg, #252525 135deg, #0a0a0a 180deg, #252525 225deg, #0a0a0a 270deg, #252525 315deg, #0a0a0a 360deg)',
    backgroundColor: '#111',
    edgeTexture: 'repeating-conic-gradient(from 0deg, rgba(220,230,230,0.14) 0deg 1deg, rgba(0,0,0,0.24) 1deg 3deg)',
    edgeOpacity: 0.48,
    edgeMask: 'radial-gradient(circle, transparent 0 68%, #000 70% 100%)',
    faceOverlay: 'radial-gradient(circle at 50% 50%, transparent 0 58%, rgba(255,255,255,0.08) 62%, rgba(0,0,0,0.34) 82%, transparent 88%)',
    indicator: {
      background: 'linear-gradient(to bottom, #f3dcae, #c79f59)',
      boxShadow: '0 0 8px rgba(243,220,174,0.34), 0 2px 4px rgba(0,0,0,0.48), inset 0 1px 1px rgba(255,246,224,0.78)'
    }
  },
  {
    name: 'Original Graphite Grip Dark Shadow',
    boxShadow: '4px 12px 20px rgba(0,0,0,0.45), 2px 4px 8px rgba(0,0,0,0.54), inset 0px 1px 3px rgba(255,255,255,0.4), inset 0px -2px 5px rgba(0,0,0,0.9)',
    backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.8) 100%), conic-gradient(from 180deg at 50% 50%, #0a0a0a 0deg, #252525 45deg, #0a0a0a 90deg, #252525 135deg, #0a0a0a 180deg, #252525 225deg, #0a0a0a 270deg, #252525 315deg, #0a0a0a 360deg)',
    backgroundColor: '#111',
    edgeTexture: 'repeating-conic-gradient(from 0deg, rgba(220,230,230,0.14) 0deg 1deg, rgba(0,0,0,0.24) 1deg 3deg)',
    edgeOpacity: 0.48,
    edgeMask: 'radial-gradient(circle, transparent 0 68%, #000 70% 100%)',
    faceOverlay: 'radial-gradient(circle at 50% 50%, transparent 0 58%, rgba(255,255,255,0.08) 62%, rgba(0,0,0,0.34) 82%, transparent 88%)'
  },
  {
    name: 'Original Graphite Grip Cream Dark Shadow',
    boxShadow: '4px 12px 20px rgba(0,0,0,0.45), 2px 4px 8px rgba(0,0,0,0.54), inset 0px 1px 3px rgba(255,255,255,0.4), inset 0px -2px 5px rgba(0,0,0,0.9)',
    backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.8) 100%), conic-gradient(from 180deg at 50% 50%, #0a0a0a 0deg, #252525 45deg, #0a0a0a 90deg, #252525 135deg, #0a0a0a 180deg, #252525 225deg, #0a0a0a 270deg, #252525 315deg, #0a0a0a 360deg)',
    backgroundColor: '#111',
    edgeTexture: 'repeating-conic-gradient(from 0deg, rgba(220,230,230,0.14) 0deg 1deg, rgba(0,0,0,0.24) 1deg 3deg)',
    edgeOpacity: 0.48,
    edgeMask: 'radial-gradient(circle, transparent 0 68%, #000 70% 100%)',
    faceOverlay: 'radial-gradient(circle at 50% 50%, transparent 0 58%, rgba(255,255,255,0.08) 62%, rgba(0,0,0,0.34) 82%, transparent 88%)',
    indicator: {
      background: 'linear-gradient(to bottom, #f3dcae, #c79f59)',
      boxShadow: '0 0 8px rgba(243,220,174,0.34), 0 2px 4px rgba(0,0,0,0.48), inset 0 1px 1px rgba(255,246,224,0.78)'
    }
  },
  
];

const PRESERVED_SMALL_KNOB_STYLES = new Set([
  'Original (Levitating)',
  'Dark Brushed Metal',
  'Soft Matte Rubber',
  'Graphite Anodized Grip',
  'Original Graphite Grip',
  'Original Graphite Grip Cream Pointer',
  'Original Graphite Grip Dark Shadow',
  'Original Graphite Grip Cream Dark Shadow'
]);

const OBSIDIAN_STUDIO_POINTER = {
  background: 'linear-gradient(to bottom, #e9725d, #b84c39)',
  boxShadow: '0 0 5px rgba(230,106,83,0.22), 0 2px 4px rgba(0,0,0,0.48), inset 0 1px 1px rgba(255,196,181,0.36)'
};

const RATE_MATCH_MIX_BODY = KNOB_STYLES.find(style => style.name === 'Original Graphite Grip Cream Dark Shadow') || KNOB_STYLES[0];

const MIX_KNOB_STYLES = [
  {
    name: 'Obsidian Studio',
    backgroundColor: '#111',
    backgroundImage: 'radial-gradient(circle at 32% 28%, rgba(255,255,255,0.13), transparent 30%), radial-gradient(circle at 50% 58%, rgba(255,255,255,0.04), transparent 48%), conic-gradient(from 180deg at 50% 50%, #090909, #2a2b2c, #0b0b0b, #242526, #090909)',
    boxShadow: '8px 12px 18px rgba(0,0,0,0.44), 2px 4px 7px rgba(0,0,0,0.36), inset 1px 1px 2px rgba(255,255,255,0.22), inset -2px -3px 6px rgba(0,0,0,0.88)',
    faceOverlay: 'radial-gradient(circle at 50% 50%, transparent 0 58%, rgba(255,255,255,0.07) 63%, rgba(0,0,0,0.34) 84%, transparent 90%)',
    indicator: OBSIDIAN_STUDIO_POINTER
  },
  {
    ...RATE_MATCH_MIX_BODY,
    name: 'Rate Match Obsidian Pointer',
    indicator: OBSIDIAN_STUDIO_POINTER
  },
  {
    ...RATE_MATCH_MIX_BODY,
    name: 'Rate Match 1:1 Cream Pointer'
  },
  {
    name: 'Champagne Cap',
    backgroundColor: '#74684d',
    backgroundImage: 'radial-gradient(circle at 34% 30%, rgba(255,255,255,0.42), transparent 32%), radial-gradient(circle at 50% 50%, transparent 0 62%, rgba(255,240,196,0.14) 74%, rgba(35,30,22,0.44) 96%), conic-gradient(from 180deg, #74684d, #c2b58a, #75684c, #d0c093, #74684d, #b6a775, #6b6047, #c7b88b, #74684d)',
    boxShadow: '8px 11px 17px rgba(0,0,0,0.38), 2px 4px 7px rgba(0,0,0,0.28), inset 2px 2px 5px rgba(255,255,255,0.28), inset -3px -4px 7px rgba(0,0,0,0.42)',
    edgeTexture: 'repeating-conic-gradient(from 0deg, rgba(255,243,207,0.18) 0deg 0.8deg, rgba(65,52,34,0.22) 0.8deg 2.6deg)',
    edgeMask: 'radial-gradient(circle, transparent 0 68%, #000 70% 100%)',
    edgeOpacity: 0.38,
    edgeBlendMode: 'soft-light',
    indicator: { background: 'linear-gradient(to bottom, #f3dcae, #c79f59)', boxShadow: '0 0 7px rgba(243,220,174,0.24), 0 2px 4px rgba(0,0,0,0.44), inset 0 1px 1px rgba(255,246,224,0.64)' }
  },
  {
    name: 'Smoked Coral Glass',
    backgroundColor: '#2a1512',
    backgroundImage: 'radial-gradient(circle at 31% 28%, rgba(255,167,140,0.2), transparent 30%), radial-gradient(circle at 50% 50%, rgba(230,106,83,0.15), transparent 52%), conic-gradient(from 180deg, #160d0b, #4a211b, #1a0d0b, #6a2c23, #160d0b, #3c1a16, #120907, #52231c, #160d0b)',
    boxShadow: '8px 12px 18px rgba(60,18,12,0.38), 2px 4px 7px rgba(0,0,0,0.36), inset 1px 1px 3px rgba(255,190,170,0.18), inset -3px -4px 8px rgba(0,0,0,0.78)',
    faceOverlay: 'radial-gradient(circle at 50% 50%, transparent 0 56%, rgba(230,106,83,0.12) 64%, rgba(0,0,0,0.28) 86%, transparent 92%)',
    indicator: { background: 'linear-gradient(to bottom, #ffc0a4, #e36f55)', boxShadow: '0 0 8px rgba(230,106,83,0.34), 0 2px 4px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,218,204,0.52)' }
  },
  {
    name: 'Walnut Inlay',
    backgroundColor: '#2a170e',
    backgroundImage: 'radial-gradient(circle at 34% 28%, rgba(183,121,78,0.2), transparent 32%), repeating-conic-gradient(from 180deg, #2d190e 0deg 4deg, #634020 4deg 8deg, #25130a 8deg 11deg, #7a4d2a 11deg 16deg)',
    boxShadow: '9px 12px 18px rgba(0,0,0,0.42), 2px 4px 7px rgba(0,0,0,0.34), inset 1px 1px 2px rgba(208,144,92,0.17), inset -3px -4px 8px rgba(0,0,0,0.68)',
    faceOverlay: 'radial-gradient(circle at 50% 50%, transparent 0 58%, rgba(255,210,160,0.06) 63%, rgba(0,0,0,0.34) 85%, transparent 92%)',
    indicator: { background: 'linear-gradient(to bottom, #d6cdb6, #9d8463)', boxShadow: '0 0 5px rgba(214,205,182,0.2), 0 2px 4px rgba(0,0,0,0.48), inset 0 1px 1px rgba(255,246,224,0.44)' }
  },
  {
    name: 'Ivory Porcelain',
    backgroundColor: '#efe0c6',
    backgroundImage: 'radial-gradient(circle at 32% 28%, rgba(255,255,255,0.72), transparent 32%), radial-gradient(circle at 50% 50%, transparent 0 62%, rgba(118,88,50,0.12) 75%, rgba(60,42,25,0.22) 96%), conic-gradient(from 180deg, #d7c5a5, #fff3d8, #d2bf9e, #f3dfbd, #d7c5a5, #ead6b1, #cdb895, #f7e6c8, #d7c5a5)',
    boxShadow: '8px 11px 18px rgba(93,62,38,0.26), 2px 4px 7px rgba(0,0,0,0.2), inset 2px 2px 5px rgba(255,255,255,0.62), inset -3px -4px 8px rgba(91,61,34,0.3)',
    indicator: { background: 'linear-gradient(to bottom, #a44838, #6e2b24)', boxShadow: '0 0 4px rgba(164,72,56,0.24), 0 2px 4px rgba(0,0,0,0.38), inset 0 1px 1px rgba(255,190,174,0.36)' }
  },
  {
    name: 'Black Nickel',
    backgroundColor: '#151718',
    backgroundImage: 'linear-gradient(145deg, rgba(255,255,255,0.14), transparent 38%, rgba(0,0,0,0.34)), conic-gradient(from 200deg, #111314, #3a3c3d, #141617, #2b2d2f, #111314, #454748, #151718, #303335, #111314)',
    boxShadow: '7px 11px 17px rgba(0,0,0,0.46), 2px 4px 7px rgba(0,0,0,0.4), inset 1px 1px 2px rgba(255,255,255,0.2), inset -3px -4px 8px rgba(0,0,0,0.82)',
    edgeTexture: 'repeating-conic-gradient(from 0deg, rgba(230,235,235,0.12) 0deg 1deg, rgba(0,0,0,0.25) 1deg 3deg)',
    edgeMask: 'radial-gradient(circle, transparent 0 69%, #000 71% 100%)',
    edgeOpacity: 0.46,
    indicator: { background: 'linear-gradient(to bottom, #d6cdb6, #9c8a68)', boxShadow: '0 0 5px rgba(214,205,182,0.2), 0 2px 4px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,246,224,0.42)' }
  },
  {
    name: 'Muted Copper',
    backgroundColor: '#6b3422',
    backgroundImage: 'radial-gradient(circle at 33% 29%, rgba(255,197,148,0.28), transparent 32%), radial-gradient(circle at 50% 50%, transparent 0 60%, rgba(255,190,132,0.1) 72%, rgba(54,23,14,0.42) 96%), conic-gradient(from 180deg, #6b3422, #a9623d, #65301f, #bd7450, #6b3422, #9c5634, #5c2a1b, #b56c45, #6b3422)',
    boxShadow: '8px 12px 18px rgba(63,24,13,0.4), 2px 4px 7px rgba(0,0,0,0.3), inset 2px 2px 4px rgba(255,197,148,0.22), inset -3px -4px 8px rgba(45,18,10,0.58)',
    edgeTexture: 'repeating-conic-gradient(from 0deg, rgba(230,145,92,0.16) 0deg 0.8deg, rgba(44,18,10,0.24) 0.8deg 2.6deg)',
    edgeMask: 'radial-gradient(circle, transparent 0 68%, #000 70% 100%)',
    edgeOpacity: 0.42,
    indicator: { background: 'linear-gradient(to bottom, #f0ccb2, #d17261)', boxShadow: '0 0 6px rgba(209,114,97,0.22), 0 2px 4px rgba(0,0,0,0.46), inset 0 1px 1px rgba(255,220,204,0.45)' }
  },
  {
    name: 'Frosted Sage',
    backgroundColor: '#26342d',
    backgroundImage: 'radial-gradient(circle at 32% 28%, rgba(215,232,210,0.22), transparent 32%), radial-gradient(circle at 50% 50%, transparent 0 60%, rgba(215,232,210,0.08) 72%, rgba(9,18,13,0.42) 96%), conic-gradient(from 180deg, #202b25, #536d5e, #1f2a24, #6d8373, #202b25, #465f50, #17211b, #5b7464, #202b25)',
    boxShadow: '8px 12px 18px rgba(0,0,0,0.4), 2px 4px 7px rgba(0,0,0,0.3), inset 1px 1px 3px rgba(230,245,220,0.16), inset -3px -4px 8px rgba(0,0,0,0.62)',
    indicator: { background: 'linear-gradient(to bottom, #f0ccb2, #d17261)', boxShadow: '0 0 6px rgba(209,114,97,0.22), 0 2px 4px rgba(0,0,0,0.46), inset 0 1px 1px rgba(255,220,204,0.42)' }
  },
  {
    name: 'Piano Lacquer',
    backgroundColor: '#090909',
    backgroundImage: 'radial-gradient(circle at 30% 24%, rgba(255,255,255,0.2), transparent 28%), radial-gradient(circle at 50% 52%, rgba(255,255,255,0.04), transparent 48%), linear-gradient(145deg, #030303, #1a1a1a 45%, #050505)',
    boxShadow: '8px 12px 18px rgba(0,0,0,0.48), 2px 4px 7px rgba(0,0,0,0.38), inset 1px 1px 2px rgba(255,255,255,0.24), inset -2px -3px 7px rgba(0,0,0,0.9)',
    faceOverlay: 'linear-gradient(135deg, rgba(255,255,255,0.16), transparent 34%, rgba(0,0,0,0.2))',
    indicator: { background: 'linear-gradient(to bottom, #e9725d, #b84c39)', boxShadow: '0 0 5px rgba(230,106,83,0.2), 0 2px 4px rgba(0,0,0,0.52), inset 0 1px 1px rgba(255,196,181,0.34)' }
  },
  {
    name: 'Warm Gunmetal',
    backgroundColor: '#24211e',
    backgroundImage: 'radial-gradient(circle at 32% 28%, rgba(255,235,205,0.12), transparent 30%), conic-gradient(from 180deg, #171615, #3f3b35, #1a1816, #4a443d, #171615, #34312d, #12110f, #3e3933, #171615)',
    boxShadow: '8px 12px 18px rgba(0,0,0,0.42), 2px 4px 7px rgba(0,0,0,0.34), inset 1px 1px 3px rgba(255,232,205,0.12), inset -3px -4px 8px rgba(0,0,0,0.74)',
    edgeTexture: 'repeating-conic-gradient(from 0deg, rgba(255,232,205,0.1) 0deg 0.9deg, rgba(0,0,0,0.22) 0.9deg 3deg)',
    edgeMask: 'radial-gradient(circle, transparent 0 68%, #000 70% 100%)',
    edgeOpacity: 0.38,
    indicator: { background: 'linear-gradient(to bottom, #d6cdb6, #a68c67)', boxShadow: '0 0 5px rgba(214,205,182,0.18), 0 2px 4px rgba(0,0,0,0.48), inset 0 1px 1px rgba(255,246,224,0.38)' }
  }
];

const KNOB_READOUT_STYLES = [
  { name: 'Classic Digital', type: 'digital' },
  { name: 'Floating Glass', type: 'glass' },
  { name: 'Coral Glass', type: 'coral-glass' },
  { name: 'Obsidian Coral', type: 'obsidian-coral' },
  { name: 'Minimalist Coral', type: 'minimal-coral' },
  { name: 'Stealth Modern', type: 'stealth-modern' },
  { name: 'Hardware Label', type: 'hardware-label' },
  { name: 'Stealth Ghost', type: 'stealth-ghost' },
  { name: 'Stealth Coral', type: 'stealth-coral' },
  { name: 'Stealth Ivory', type: 'stealth-ivory' }
];

export const formatKnobValue = (label, value) => {
  const v = Math.max(0, Math.min(100, value));
  switch (label.toUpperCase()) {
    case 'INPUT':
    case 'OUTPUT':
      const db = ((v / 100) * 48) - 24;
      return `${db > 0 ? '+' : ''}${db.toFixed(1)} dB`;
    case 'FILTER':
      const x = v / 100;
      const freq = 100 * Math.pow(22000 / 100, x);
      return freq >= 1000 ? `${(freq / 1000).toFixed(1)}k Hz` : `${Math.round(freq)} Hz`;
    case 'RATE':
      const rate = 1000 + (v / 100) * 9000;
      return `${(rate / 1000).toFixed(1)}k Hz`;
    case 'PHASE ◐':
    case 'PHASE':
      const phase = (v / 100) * 180;
      return `${Math.round(phase)}°`;
    case 'SAT':
    case 'DEPTH ◍':
    case 'DEPTH':
    case 'NOISE':
    case 'SWEETEN':
    case 'DRIFT':
    case 'SPREAD':
    default:
      return `${Math.round(v)}%`;
  }
};

export const renderReadout = (type, val) => {
  const stableReadoutClass = 'min-w-[54px] text-center tabular-nums';
  switch (type) {
    case 'digital':
      return <div className={`${stableReadoutClass} text-[12px] font-mono text-red-500 drop-shadow-[0_0_4px_rgba(239,68,68,0.8)] bg-black/80 px-1.5 py-0.5 rounded border border-red-900/50 whitespace-nowrap`}>{val}</div>;
    case 'glass':
      return <div className={`${stableReadoutClass} text-[11px] text-black/80 backdrop-blur-md bg-white/10 px-2 py-0.5 rounded-full border border-white/20 shadow-lg whitespace-nowrap font-bold tracking-wider`}>{val}</div>;
    case 'coral-glass':
      return <div className={`${stableReadoutClass} text-[11px] text-[#e66a53] backdrop-blur-md bg-white/15 px-2 py-0.5 rounded-full border border-[#e66a53]/30 shadow-lg whitespace-nowrap font-bold tracking-wider`}>{val}</div>;
    case 'obsidian-coral':
      return <div className={`${stableReadoutClass} text-[11px] text-[#e66a53] backdrop-blur-lg bg-black/40 px-2.5 py-0.5 rounded-lg border border-white/10 shadow-xl whitespace-nowrap font-bold tracking-widest uppercase`}>{val}</div>;
    case 'minimal-coral':
      return <div className={`${stableReadoutClass} text-[12px] font-bold text-[#e66a53] drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] whitespace-nowrap tracking-widest`} style={{ fontFamily: "'Figtree', sans-serif" }}>{val}</div>;
    case 'stealth-modern':
      return <div className={`${stableReadoutClass} text-[11px] text-[#fff8ee]/90 backdrop-blur-md bg-black/60 px-2.5 py-0.5 rounded border border-white/10 shadow-xl whitespace-nowrap font-bold tracking-wider`}>{val}</div>;
    case 'rounded-stealth-ivory':
      return <div className={`${stableReadoutClass} text-[12px] text-[#edd39a] backdrop-blur-md bg-black/60 px-2.5 py-0.5 rounded-full border border-[#edd39a]/20 shadow-xl whitespace-nowrap font-bold tracking-[0.18em] uppercase`} style={{ fontFamily: "'Figtree', sans-serif" }}>{val}</div>;
    case 'hardware-label':
      return <div className={`${stableReadoutClass} text-[11px] font-black text-black bg-[#e66a53] px-2 py-0.5 rounded shadow-[0_2px_4px_rgba(0,0,0,0.3)] whitespace-nowrap uppercase tracking-widest`}>{val}</div>;
    case 'stealth-ghost':
      return <div className={`${stableReadoutClass} text-[12px] text-white backdrop-blur-md bg-black/60 px-2 py-0.5 rounded border border-white/10 shadow-xl whitespace-nowrap font-bold tracking-[0.18em] uppercase`} style={{ fontFamily: "'Figtree', sans-serif" }}>{val}</div>;
    case 'stealth-coral':
      return <div className={`${stableReadoutClass} text-[12px] text-[#e66a53] backdrop-blur-md bg-black/60 px-2 py-0.5 rounded border border-[#e66a53]/20 shadow-xl whitespace-nowrap font-bold tracking-[0.18em] uppercase`} style={{ fontFamily: "'Figtree', sans-serif" }}>{val}</div>;
    case 'stealth-ivory':
      return <div className={`${stableReadoutClass} text-[12px] text-[#edd39a] backdrop-blur-md bg-black/60 px-2 py-0.5 rounded border border-[#edd39a]/20 shadow-xl whitespace-nowrap font-bold tracking-[0.18em] uppercase`} style={{ fontFamily: "'Figtree', sans-serif" }}>{val}</div>;
    default:
      return null;
  }
};

const DISPLAY_ACCENT = '#e66a53';
const DRIFT_VISUAL_FIXED_RATE = 24.5;
const DISPLAY_FONT_STACK = "'Chakra Petch', 'DIN Condensed', 'Avenir Next Condensed', 'Helvetica Neue', Arial, sans-serif";

const DISPLAY_PARAMETER_CONFIG = {
  input: { name: 'INPUT', label: 'INPUT', anim: 'bars' },
  output: { name: 'OUTPUT', label: 'OUTPUT', anim: 'bars' },
  noise: { name: 'NOISE', label: 'NOISE', anim: 'static' },
  sweeten: { name: 'COLOR', label: 'COLOR', anim: 'sparkle' },
  sat: { name: 'SAT', label: 'SAT', anim: 'heat' },
  filter: { name: 'FILTER', label: 'FILTER', anim: 'curve' },
  drift: { name: 'DRIFT', label: 'DRIFT', anim: 'drift' },
  spread: { name: 'SPREAD', label: 'SPREAD', anim: 'width' },
  rate: { name: 'RATE', label: 'RATE', anim: 'rateWave' },
  depth: { name: 'DEPTH', label: 'DEPTH ◍', anim: 'pulse' },
  phase: { name: 'PHASE', label: 'PHASE ◐', anim: 'circle' },
  mix: { name: 'MIX', label: 'MIX', anim: 'mixBlend' }
};

const DEPTH_DISPLAY_ANIMATION_STYLES = [
  'Current Pulse',
  'Rising Columns',
  'Pressure Rings',
  'Liquid Chamber',
  'Tunnel Stack',
  'Breathing Lens',
  'Step Ladder',
  'Needle Sweep',
  'Shadow Well',
  'Wave Folding Shaper',
  'Torus Thickness Girth',
  'Feedback Echo Line',
  '3D Tesseract Projection',
  'Organic Pitch Drift Orbit',
  'Instability Tape Ribbons',
  'Harmonic Weaver Sway'
];

const PHASE_DISPLAY_ANIMATION_STYLES = [
  'Current Wave',
  'Lissajous Orbit',
  'Split Rails',
  'Phase Scope',
  'Crossing Waves',
  'Comet Arc',
  'Stereo Dots',
  'Vector Tilt',
  'Polarity Shutters',
  'Split Polarity Disc',
  'Phase Eclipse',
  'Mirror Half Pulse',
  'Polarity Orbit',
  'Clean Split Flip',
  'Waveform Morph',
  'Lissajous Vector Scope',
  '3D Isometric Coin'
];

const SPREAD_DISPLAY_ANIMATION_STYLES = [
  'Current Width',
  'Stereo Rails',
  'Twin Halos',
  'Expanding Brackets',
  'Panorama Glow',
  'Mirror Comets',
  'Width Ladder',
  'Elastic Band',
  'Split Lens',
  'Width Stereo Dots'
];

const NOISE_DISPLAY_ANIMATION_STYLES = [
  'Current Static',
  'Dust Field',
  'Tape Speckles',
  'Hash Lines',
  'Granular Cloud',
  'Crackle Dots',
  'Snow Bands',
  'Noise Gate',
  'Radio Mist'
];

const normalizeDepthDisplayAnimationStyle = (value) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return 0;
  return Math.max(0, Math.min(DEPTH_DISPLAY_ANIMATION_STYLES.length - 1, numericValue));
};

const normalizePhaseDisplayAnimationStyle = (value) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return 0;
  return Math.max(0, Math.min(PHASE_DISPLAY_ANIMATION_STYLES.length - 1, numericValue));
};

const normalizeSpreadDisplayAnimationStyle = (value) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return 0;
  return Math.max(0, Math.min(SPREAD_DISPLAY_ANIMATION_STYLES.length - 1, numericValue));
};

const normalizeNoiseDisplayAnimationStyle = (value) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return 0;
  return Math.max(0, Math.min(NOISE_DISPLAY_ANIMATION_STYLES.length - 1, numericValue));
};

const splitDisplayValue = (formatted) => {
  const text = String(formatted || '');
  const spaced = text.match(/^([+-]?\d+(?:\.\d+)?k?)\s*([^\d\s].*)?$/i);
  if (spaced) return { val: spaced[1], unit: spaced[2] || '' };
  return { val: text, unit: '' };
};

const createDisplayParameter = (id, value, options = {}) => {
  const config = DISPLAY_PARAMETER_CONFIG[id] || DISPLAY_PARAMETER_CONFIG.sat;
  const formatted = formatKnobValue(config.label, value);
  const split = splitDisplayValue(formatted);
  const valueDisplay = id === 'rate' && options.lfoSync
    ? { val: SYNC_DIVS[options.lfoSyncDiv] || SYNC_DIVS[0], unit: '' }
    : split;
  return {
    ...config,
    id,
    ...valueDisplay,
    level: Math.max(0.04, Math.min(1, (Number(value) || 0) / 100)),
    signalIn: Math.max(0.12, Math.min(1, (Number(options.input) || 0) / 100)),
    signalOut: Math.max(0.12, Math.min(1, (Number(options.output) || 0) / 100)),
    mode: options.mode,
    rate: options.rate,
    waveShape: options.waveShape,
    displayTime: options.displayTime,
    depthDisplayStyle: normalizeDepthDisplayAnimationStyle(options.depthDisplayStyle),
    phaseDisplayStyle: normalizePhaseDisplayAnimationStyle(options.phaseDisplayStyle),
    spreadDisplayStyle: normalizeSpreadDisplayAnimationStyle(options.spreadDisplayStyle),
    noiseDisplayStyle: normalizeNoiseDisplayAnimationStyle(options.noiseDisplayStyle),
    driftAnimation: options.driftAnimation,
    filterPole: normalizeFilterPole(options.filterPole)
  };
};

const getLfoWavePoints = (waveShape = 0, cycles = 2, amplitude = 6, yMid = 11, samples = 96) => {
  const points = [];
  for (let i = 0; i < samples; i++) {
    const x = (i / (samples - 1)) * 100;
    const phase = ((i / (samples - 1)) * cycles) % 1;
    let wave = Math.sin(phase * Math.PI * 2);
    if (waveShape === 1) {
      wave = 1 - 4 * Math.abs(phase - 0.5);
    } else if (waveShape === 2) {
      wave = phase < 0.5 ? -1 : 1;
    }
    points.push(`${x.toFixed(1)},${(yMid + wave * amplitude).toFixed(1)}`);
  }
  return points.join(' ');
};

const SideDisplayButtons = ({ onPrev, onNext }) => {
  const [prevSettleTick, setPrevSettleTick] = useState(0);
  const [nextSettleTick, setNextSettleTick] = useState(0);
  const buttonClass = 'relative flex h-[25px] w-[25px] items-center justify-center overflow-hidden rounded-full border border-[#151515] bg-[#181818] text-[#a4998e] outline-none transition-[border-color,color,filter,box-shadow] duration-200 ease-out hover:border-[#df6f5a]/55 hover:text-[#df6f5a] hover:shadow-[0_0_0_1px_rgba(223,111,90,0.26),2px_3px_5px_rgba(0,0,0,0.38),1px_2px_2px_rgba(0,0,0,0.2),inset_1px_1px_1px_rgba(255,255,255,0.07),inset_-1px_-1px_2px_rgba(0,0,0,0.2)] active:border-[#df6f5a]/75 active:brightness-[0.94]';
  const buttonStyle = {
    boxShadow: '2px 3px 5px rgba(0,0,0,0.38), 1px 2px 2px rgba(0,0,0,0.2), inset 1px 1px 1px rgba(255,255,255,0.12), inset -1px -1px 2px rgba(0,0,0,0.2)'
  };
  const faceClass = 'pointer-events-none absolute inset-[0.5px] rounded-full bg-[#262626]';
  const faceStyle = {
    boxShadow: 'inset 1px 1px 1px rgba(255,255,255,0.12), inset -1px -2px 3px rgba(0,0,0,0.26)'
  };
  const handlePrev = () => {
    setPrevSettleTick(tick => tick + 1);
    onPrev();
  };
  const handleNext = () => {
    setNextSettleTick(tick => tick + 1);
    onNext();
  };

  return (
    <>
      <button
        type="button"
        onClick={handlePrev}
        className={buttonClass}
        style={buttonStyle}
        aria-label="Previous option"
      >
        <span
          key={`option-prev-face-${prevSettleTick}`}
          className={`${prevSettleTick > 0 ? 'option-button-settle' : ''} ${faceClass}`}
          style={faceStyle}
        />
        <svg className="relative z-10 h-2.5 w-2.5 fill-current" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M10 14L4 8l6-6v12z" />
        </svg>
      </button>
      <button
        type="button"
        onClick={handleNext}
        className={buttonClass}
        style={buttonStyle}
        aria-label="Next option"
      >
        <span
          key={`option-next-face-${nextSettleTick}`}
          className={`${nextSettleTick > 0 ? 'option-button-settle' : ''} ${faceClass}`}
          style={faceStyle}
        />
        <svg className="relative z-10 h-2.5 w-2.5 fill-current" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M6 2l6 6-6 6V2z" />
        </svg>
      </button>
    </>
  );
};

const ArchivedSaturationMotionDisplay = ({ mode = 0, level = 0.5, power = true }) => {
  const activeMode = normalizeSaturationMode(mode);
  const tapeActive = activeMode === 0;
  const glowLevel = level * 0.28;
  const activeGlow = power ? 0.2 + glowLevel * 0.34 : 0.08;
  const inactiveOpacity = power ? 0.32 : 0.16;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex translate-x-[6px] translate-y-[2px] items-center justify-center overflow-hidden">
      <div
        className="absolute inset-x-[7px] bottom-[5px] h-[15px] rounded-full transition-all duration-300"
        style={{
          background: tapeActive
            ? `linear-gradient(90deg, rgba(230,106,83,${0.08 + glowLevel * 0.2}), rgba(255,178,112,${0.08 + glowLevel * 0.16}), rgba(230,106,83,${0.08 + glowLevel * 0.2}))`
            : `radial-gradient(ellipse at 50% 50%, rgba(255,178,112,${0.12 + glowLevel * 0.24}), rgba(230,106,83,${0.08 + glowLevel * 0.22}) 48%, transparent 78%)`,
          filter: `blur(${2 + glowLevel * 3}px)`,
          opacity: activeGlow
        }}
      />
      {tapeActive ? (
        <svg
          viewBox="0 0 200 100"
          className="relative h-[42px] w-[76px] -translate-x-[1px] translate-y-[2px]"
          aria-hidden="true"
          style={{
            filter: `drop-shadow(0.8px 0.8px 0 rgba(105,35,28,${0.34 + level * 0.14})) drop-shadow(0 0 ${1.6 + level * 1.6}px rgba(230,106,83,${0.16 + level * 0.18}))`,
            opacity: power ? 0.32 + level * 0.34 : 0.18
          }}
        >
          <path
            d="M45 75 C50 82 58 87 62 87 L74 81 L100 87 L122 81 L126 86 C130 86 140 82 155 75"
            fill="none"
            stroke="#e66a53"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            opacity={0.58 + level * 0.28}
          />
          {[
            { cx: 45, cy: 45, yOffset: -1.4 },
            { cx: 155, cy: 45, yOffset: -2 }
          ].map(({ cx, cy, yOffset }) => (
            <g key={cx} transform={`translate(0 ${yOffset})`}>
              <g
                className="hud-sat-reel"
                style={{
                  transformOrigin: `${cx}px ${cy}px`,
                  animationDuration: `${Math.max(2.3, 3.1 - level * 0.6)}s`
                }}
              >
                <circle cx={cx} cy={cy} r="32" fill="none" stroke="#e66a53" strokeWidth="4" />
                <circle cx={cx} cy={cy} r="12" fill="none" stroke="#e66a53" strokeWidth="3.2" opacity="0.7" />
                <circle cx={cx} cy={cy} r="3.5" fill="#e66a53" opacity="0.82" />
                {Array.from({ length: 3 }).map((_, i) => (
                  <line
                    key={`spoke-${cx}-${i}`}
                    x1={cx}
                    y1={cy - 12}
                    x2={cx}
                    y2={cy - 31}
                    stroke="#e66a53"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    transform={`rotate(${i * 120} ${cx} ${cy})`}
                  />
                ))}
                {Array.from({ length: 3 }).map((_, i) => (
                  <line
                    key={`notch-${cx}-${i}`}
                    x1={cx}
                    y1={cy - 12}
                    x2={cx}
                    y2={cy - 17}
                    stroke="#e66a53"
                    strokeWidth="4"
                    strokeLinecap="round"
                    opacity="0.62"
                    transform={`rotate(${i * 120 + 60} ${cx} ${cy})`}
                  />
                ))}
              </g>
            </g>
          ))}
          <g transform="translate(100, 70)" opacity={0.76 + level * 0.18}>
            <rect x="-8" y="8" width="16" height="12" rx="1.5" fill="none" stroke="#e66a53" strokeWidth="3" />
            <line x1="0" y1="8" x2="0" y2="16" stroke="#ffd0bc" strokeWidth="2.6" strokeLinecap="round" />
            <line x1="-2" y1="20" x2="2" y2="20" stroke="#e66a53" strokeWidth="2.8" strokeLinecap="round" />
            <line x1="0" y1="20" x2="0" y2="24" stroke="#e66a53" strokeWidth="2.8" strokeLinecap="round" />
            <line x1="-6" y1="-13" x2="-6" y2="1" stroke="#e66a53" strokeWidth="3" strokeLinecap="round" />
            <line x1="6" y1="-13" x2="6" y2="1" stroke="#e66a53" strokeWidth="3" strokeLinecap="round" />
            <rect x="-1.5" y="-9" width="3" height="3" fill="#ffd0bc" opacity="0.72" />
            <rect x="-1.5" y="-3" width="3" height="3" fill="#ffd0bc" opacity="0.72" />
          </g>
          <circle cx="60" cy="85" r="3" fill="none" stroke="#e66a53" strokeWidth="3" />
          <circle cx="76" cy="82" r="4" fill="none" stroke="#e66a53" strokeWidth="3" />
          <circle cx="76" cy="82" r="1.7" fill="#ffd0bc" opacity="0.82" />
          <circle cx="124" cy="82" r="4" fill="none" stroke="#e66a53" strokeWidth="3" />
          <line x1="121" y1="79" x2="127" y2="85" stroke="#ffd0bc" strokeWidth="2.8" strokeLinecap="round" opacity="0.76" />
          <circle cx="140" cy="80" r="2.5" fill="none" stroke="#e66a53" strokeWidth="3" />
        </svg>
      ) : (
        <svg
          viewBox="0 0 82 48"
          className="relative h-[44px] w-[78px] -translate-x-[1px] translate-y-[1px]"
          aria-hidden="true"
          style={{ opacity: power ? 0.38 + level * 0.3 : 0.18 }}
        >
          <defs>
            <linearGradient id="satTubeGlass" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f9efe5" stopOpacity={power ? 0.18 : 0.08} />
              <stop offset="52%" stopColor="#e66a53" stopOpacity={power ? 0.16 + level * 0.22 : 0.06} />
              <stop offset="100%" stopColor="#0f0c0b" stopOpacity="0.5" />
            </linearGradient>
          </defs>
          <g className="hud-sat-tube" style={{ animationDuration: `${Math.max(1.2, 3.3 - level * 1.7)}s` }}>
            <path d="M31 10 H51 C54 10 56 13 56 16 V30 C56 36 51 40 41 40 C31 40 26 36 26 30 V16 C26 13 28 10 31 10Z" fill="url(#satTubeGlass)" stroke="#e66a53" strokeWidth="1.55" opacity={0.38 + level * 0.42} />
            <path d="M35 37 C37 29 45 29 47 37" fill="none" stroke="#ffba83" strokeWidth="2.2" strokeLinecap="round" opacity={0.34 + level * 0.56} />
            <path d="M35 21 H47 M35 25 H47" stroke="#f1d0ba" strokeWidth="1.1" strokeLinecap="round" opacity={0.18 + level * 0.24} />
            <rect x="33" y="38" width="16" height="3" rx="1" fill="#171110" stroke="#e66a53" strokeWidth="1" opacity="0.72" />
            {[36, 41, 46].map((x) => <line key={x} x1={x} y1="40" x2={x} y2="43" stroke="#8f4538" strokeWidth="1.15" opacity="0.85" />)}
          </g>
        </svg>
      )}
      <div className="absolute left-0 right-0 top-[4px] h-[7px]">
        {['TAPE', 'DESK'].map((label, index) => {
          const active = activeMode === index;
          return (
            <span
              key={label}
              className="absolute text-[5.5px] font-black uppercase tracking-[0.16em] transition-all duration-200"
              style={{
                left: index === 0 ? '18px' : '54px',
                color: active && power ? '#ffd0bc' : `rgba(230,106,83,${inactiveOpacity})`,
                textShadow: active && power ? `0 0 ${3 + level * 4}px rgba(230,106,83,${0.35 + level * 0.35})` : 'none'
              }}
            >
              {label}
            </span>
          );
        })}
      </div>
    </div>
  );
};

const SaturationDisplayGraphic = ({ mode = 0, level = 0.5, power = true }) => {
  const activeMode = normalizeSaturationMode(mode);
  const glowLevel = level * 0.5;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-x-[8px] bottom-[7px] top-[16px] rounded-full transition-all duration-300"
        style={{
          background: `radial-gradient(ellipse at 50% 54%, rgba(255,208,188,${0.11 + glowLevel * 0.2}), rgba(230,106,83,${0.1 + glowLevel * 0.2}) 48%, transparent 78%)`,
          filter: `blur(${4 + glowLevel * 3}px)`,
          opacity: power ? 0.3 + glowLevel * 0.32 : 0.08
        }}
      />
      <div className="relative flex w-[70px] translate-x-[6px] items-center justify-between">
        <span
          className="absolute left-1/2 top-1/2 h-[14px] w-[2px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: power ? 'rgba(255,208,188,0.68)' : 'rgba(230,106,83,0.2)',
            boxShadow: power ? '0 0 3px rgba(230,106,83,0.42)' : 'none',
            transform: 'translate(calc(-50% - 1px), -50%)'
          }}
        />
        {['TAPE', 'DESK'].map((label, index) => {
          const active = activeMode === index;
          return (
            <span
              key={label}
              className="text-[9px] font-black uppercase tracking-[0.14em] transition-colors duration-200"
              style={{
                color: active && power ? 'rgba(255,241,232,0.88)' : `rgba(230,106,83,${power ? 0.3 : 0.16})`,
                textShadow: active && power ? `0 0 ${3 + glowLevel * 5}px rgba(230,106,83,${0.3 + glowLevel * 0.22})` : 'none',
                transform: index === 1 ? 'translateX(-1px)' : undefined
              }}
            >
              {label}
            </span>
          );
        })}
      </div>
    </div>
  );
};

const DisplayFeatureAnimation = ({ parameter }) => {
  const level = parameter.level ?? 0.5;
  const accent = DISPLAY_ACCENT;
  const speed = `${Math.max(0.85, 3.4 - level * 2.1)}s`;
  const time = parameter.displayTime ?? 0;

  switch (parameter.anim) {
    case 'bars':
      {
        const inputLevel = parameter.signalIn ?? level;
        const outputLevel = parameter.signalOut ?? level;
        const meterLevels = [inputLevel, outputLevel];
        return (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 px-2">
            {meterLevels.map((meterLevel, i) => (
            <div key={i} className="h-[3px] w-[76%] rounded-full bg-[#331812]">
              <div
                className="h-full rounded-full shadow-[0_0_4px_rgba(230,106,83,0.68)] transition-all duration-200"
                style={{ width: `${18 + meterLevel * 76}%`, backgroundColor: accent, opacity: i === 0 ? 0.88 : 0.62 }}
              />
            </div>
            ))}
          </div>
        );
      }
    case 'static':
      {
        const styleIndex = normalizeNoiseDisplayAnimationStyle(parameter.noiseDisplayStyle);
        const density = Math.max(2, 5 - level * 2);
        const dots = [
          [7, 8, 0.7, 0.28], [14, 20, 0.5, 0.22], [21, 11, 0.8, 0.34], [29, 26, 0.6, 0.25],
          [36, 7, 0.5, 0.2], [44, 18, 0.9, 0.36], [52, 9, 0.6, 0.26], [48, 28, 0.45, 0.2],
          [11, 29, 0.55, 0.24], [32, 16, 0.45, 0.19], [39, 25, 0.65, 0.28], [24, 4, 0.5, 0.22]
        ];
        switch (styleIndex) {
          case 1:
            return (
              <svg viewBox="0 0 58 34" className="h-full w-full p-1" style={{ color: accent }} aria-hidden="true">
                <g className="hud-static" opacity={0.24 + level * 0.56}>
                  {dots.map(([cx, cy, r, opacity], i) => (
                    <circle key={i} cx={cx} cy={cy} r={r + level * 0.45} fill="currentColor" opacity={opacity + level * 0.22} />
                  ))}
                  <path d="M4,18 H54" stroke="currentColor" strokeWidth="0.6" opacity={0.08 + level * 0.18} />
                </g>
              </svg>
            );
          case 2:
            return (
              <svg viewBox="0 0 58 34" className="h-full w-full p-1" style={{ color: accent }} aria-hidden="true">
                <g className="hud-static" opacity={0.22 + level * 0.58}>
                  {[9, 18, 31, 45, 52].map((x, i) => (
                    <line key={x} x1={x} y1={4 + (i % 2) * 3} x2={x + (i % 2 ? 1 : -1)} y2={28 - (i % 3)} stroke="currentColor" strokeWidth={0.35 + level * 0.55} opacity={0.18 + level * 0.24} />
                  ))}
                  {dots.slice(0, 8).map(([cx, cy, r, opacity], i) => (
                    <circle key={i} cx={cx} cy={cy} r={r} fill="#ffd0bc" opacity={opacity + level * 0.18} />
                  ))}
                </g>
              </svg>
            );
          case 3:
            return (
              <div className="relative flex h-full w-full items-center justify-center overflow-hidden p-2">
                <div
                  className="hud-static h-full w-full rounded-sm"
                  style={{
                    opacity: 0.12 + level * 0.54,
                    backgroundImage: `repeating-linear-gradient(135deg, ${accent} 0 1px, transparent 1px ${7 - level * 2}px)`,
                    boxShadow: `inset 0 0 ${4 + level * 8}px rgba(230,106,83,${0.08 + level * 0.18})`
                  }}
                />
              </div>
            );
          case 4:
            return (
              <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
                <div
                  className="hud-depth-soft absolute rounded-full"
                  style={{
                    width: `${36 + level * 38}px`,
                    height: `${15 + level * 13}px`,
                    background: `radial-gradient(ellipse, rgba(230,106,83,${0.2 + level * 0.42}), rgba(255,208,188,${0.08 + level * 0.18}) 44%, transparent 76%)`,
                    filter: `blur(${4 + level * 4}px)`,
                    opacity: 0.24 + level * 0.52
                  }}
                />
                <svg viewBox="0 0 58 34" className="absolute h-full w-full p-1" style={{ color: accent }} aria-hidden="true">
                  {dots.map(([cx, cy, r, opacity], i) => (
                    <circle key={i} cx={cx} cy={cy} r={r + level * 0.25} fill="currentColor" opacity={opacity + level * 0.18} />
                  ))}
                </svg>
              </div>
            );
          case 5:
            return (
              <svg viewBox="0 0 58 34" className="h-full w-full p-1" style={{ color: accent }} aria-hidden="true">
                <g className="hud-phase-soft">
                  {dots.map(([cx, cy, r, opacity], i) => (
                    <circle key={i} cx={cx} cy={cy} r={r + (i % 3) * 0.25 + level * 0.38} fill="none" stroke="currentColor" strokeWidth="0.7" opacity={opacity + level * 0.28} />
                  ))}
                  <path d="M6,22 L16,18 L25,22 L36,13 L52,16" fill="none" stroke="currentColor" strokeWidth="0.6" opacity={0.1 + level * 0.28} />
                </g>
              </svg>
            );
          case 6:
            return (
              <div className="relative flex h-full w-full flex-col justify-center gap-[3px] px-2">
                {[0, 1, 2, 3, 4].map(i => (
                  <div key={i} className="hud-static h-[2px] rounded-full bg-[#331812]/70" style={{ animationDelay: `${-i * 0.05}s` }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${22 + level * (58 + i * 4)}%`,
                        backgroundColor: accent,
                        opacity: 0.13 + level * (0.34 + i * 0.03)
                      }}
                    />
                  </div>
                ))}
              </div>
            );
          case 7:
            return (
              <div className="relative flex h-full w-full items-center justify-center overflow-hidden px-2">
                <div className="absolute h-[22px] w-[82%] rounded-md border border-[#331812]" />
                <div
                  className="hud-static h-[18px] rounded-sm"
                  style={{
                    width: `${12 + level * 68}%`,
                    backgroundImage: `radial-gradient(${accent} 0.8px, transparent 0.8px)`,
                    backgroundSize: `${4 - level}px ${4 - level}px`,
                    opacity: 0.18 + level * 0.5
                  }}
                />
                <span className="absolute left-[15%] h-[20px] w-px bg-current opacity-25" style={{ color: accent }} />
                <span className="absolute right-[15%] h-[20px] w-px bg-current opacity-25" style={{ color: accent }} />
              </div>
            );
          case 8:
            return (
              <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="hud-depth-soft absolute rounded-full"
                    style={{
                      width: `${26 + level * 30 + i * 12}px`,
                      height: `${8 + level * 8 + i * 4}px`,
                      background: `radial-gradient(ellipse, rgba(230,106,83,${0.16 + level * 0.26}), transparent 72%)`,
                      transform: `translate(${(i - 1) * 13}px, ${(i % 2 ? -1 : 1) * (2 + level * 3)}px)`,
                      filter: `blur(${3 + i * 1.5}px)`,
                      opacity: 0.18 + level * 0.3,
                      animationDelay: `${-i * 0.45}s`
                    }}
                  />
                ))}
                <svg viewBox="0 0 58 34" className="absolute h-full w-full p-1" style={{ color: accent }} aria-hidden="true">
                  {dots.slice(0, 9).map(([cx, cy, r, opacity], i) => (
                    <circle key={i} cx={cx} cy={cy} r={r} fill="currentColor" opacity={opacity + level * 0.16} />
                  ))}
                </svg>
              </div>
            );
          default:
            return (
              <div className="flex h-full w-full items-center justify-center p-2">
                <div
                  className="h-full w-full rounded-sm"
                  style={{
                    opacity: 0.16 + level * 0.56,
                    backgroundImage: `radial-gradient(${accent} 1px, transparent 1px)`,
                    backgroundSize: `${density}px ${density}px`
                  }}
                />
              </div>
            );
        }
      }
    case 'sparkle':
      return (
        <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
          <div
            className="hud-sweeten-bloom absolute rounded-full"
            style={{
              width: `${30 + level * 42}px`,
              height: `${16 + level * 18}px`,
              background: `radial-gradient(ellipse at 50% 50%, rgba(255,208,188,${0.16 + level * 0.26}) 0%, rgba(230,106,83,${0.14 + level * 0.28}) 42%, transparent 78%)`,
              filter: `blur(${4 + level * 3}px) saturate(${1.05 + level * 0.45})`,
              opacity: 0.3 + level * 0.46
            }}
          />
          <div
            className="hud-sweeten-bloom absolute rounded-full"
            style={{
              width: `${12 + level * 18}px`,
              height: `${12 + level * 18}px`,
              background: `radial-gradient(circle, rgba(255,224,198,${0.18 + level * 0.3}) 0%, rgba(230,106,83,${0.12 + level * 0.24}) 52%, transparent 82%)`,
              filter: `blur(${2 + level * 2}px)`,
              opacity: 0.24 + level * 0.36,
              animationDelay: '-0.7s'
            }}
          />
        </div>
      );
    case 'heat':
      return (
        <div className="relative flex h-full w-full items-center justify-center overflow-hidden px-3">
          <div
            className="absolute bottom-0 left-1/2 h-full w-[88%] -translate-x-1/2 blur-[6px] transition-all duration-300"
            style={{
              opacity: 0.12 + level * 0.58,
              background: `radial-gradient(ellipse at 50% ${82 - level * 24}%, rgba(230,106,83,${0.32 + level * 0.44}) 0%, rgba(255,177,108,${0.12 + level * 0.24}) 34%, transparent 72%)`,
              transform: `translateX(-50%) scaleY(${0.58 + level * 0.7})`
            }}
          />
          <div
            className="absolute h-[34px] w-[70px] rounded-full transition-all duration-300"
            style={{
              opacity: 0.12 + level * 0.4,
              background: `radial-gradient(ellipse at center, rgba(255,180,110,${0.12 + level * 0.24}), rgba(230,106,83,${0.16 + level * 0.36}) 42%, transparent 72%)`,
              filter: `blur(${7 + level * 5}px) saturate(${1 + level * 0.7})`,
              transform: `scale(${0.72 + level * 0.42})`
            }}
          />
        </div>
      );
    case 'curve':
      {
        const filterPole = normalizeFilterPole(parameter.filterPole);
        const isSteep = filterPole === 24;
        const cutoffX = 7 + level * 36;
        const passY = 18.4;
        const falloffRun = isSteep ? 13.5 : 17;
        const endX = Math.min(55, cutoffX + falloffRun);
        const endY = 36.2;
        const bottomY = 37;
        const leftBleedX = -12;
        const curvePath = `M${leftBleedX},${passY} H${cutoffX.toFixed(1)} C${(cutoffX + falloffRun * 0.36).toFixed(1)},${passY} ${(endX - falloffRun * 0.18).toFixed(1)},${(endY - 4.9).toFixed(1)} ${endX.toFixed(1)},${endY}`;
        const responseFillPath = `${curvePath} L${endX.toFixed(1)},${bottomY} H${leftBleedX} Z`;
        const markerPath = `M${cutoffX.toFixed(1)},${passY} V${bottomY}`;
        const poleText = (pole, x) => {
          const selected = filterPole === pole;
          return (
            <text
              key={pole}
              x={x}
              y="11.4"
              textAnchor="middle"
              fill={selected ? '#fff1e8' : 'currentColor'}
              opacity={selected ? 0.9 : 0.34}
              style={{
                fontSize: 7.8,
                fontWeight: 700,
                letterSpacing: '0.08em',
                filter: selected ? 'drop-shadow(0 0 3px rgba(230,106,83,0.58))' : 'none',
                transition: 'opacity 180ms ease-out, filter 180ms ease-out'
              }}
            >
              {pole}
            </text>
          );
        };
        return (
          <div className="relative h-full w-full">
            <svg viewBox="0 0 58 14" className="absolute left-0 top-0 h-[24px] w-full" style={{ color: accent }}>
              {poleText(12, 21.5)}
              <line x1="30.4" y1="4.7" x2="30.4" y2="12.8" stroke="currentColor" strokeWidth="0.55" opacity="0.32" />
              {poleText(24, 39.5)}
            </svg>
            <div className="absolute inset-y-0 left-0 right-[-16px] overflow-hidden rounded-full">
              <svg viewBox="-12 0 82 39" className="h-full w-full overflow-visible" style={{ color: accent }}>
                <defs>
                  <linearGradient id="filter-response-fill" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.133" />
                    <stop offset="62%" stopColor="currentColor" stopOpacity="0.086" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="filter-response-fade" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="white" stopOpacity="0.171" />
                    <stop offset="100%" stopColor="white" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d={responseFillPath}
                  fill="url(#filter-response-fill)"
                  opacity="0.78"
                  style={{ transition: 'd 280ms cubic-bezier(0.22, 1, 0.36, 1)' }}
                />
                <path
                  d={`M${leftBleedX},${passY + 2} H${Math.max(4, cutoffX - 1).toFixed(1)} V${bottomY} H${leftBleedX} Z`}
                  fill="url(#filter-response-fade)"
                  opacity="0.17"
                  style={{ transition: 'd 280ms cubic-bezier(0.22, 1, 0.36, 1)' }}
                />
                <path
                  d={curvePath}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="drop-shadow-[0_0_3px_rgba(230,106,83,0.64)]"
                  style={{ transition: 'd 280ms cubic-bezier(0.22, 1, 0.36, 1)' }}
                />
                <path d={markerPath} fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.34" style={{ transition: 'd 280ms cubic-bezier(0.22, 1, 0.36, 1)' }} />
              </svg>
            </div>
          </div>
        );
      }
    case 'rateWave':
      {
        const cycles = 1 + Math.round(level * 5);
        const amplitude = 10.5 + level * 3.4;
        const points = getLfoWavePoints(parameter.waveShape, cycles, amplitude);
        return (
          <div className="absolute inset-y-0 left-[9px] right-[10px] overflow-hidden">
            <div className="absolute left-0 flex h-full w-[200%] items-center hud-slide-left" style={{ animationDuration: `${Math.max(0.5, 3.2 - level * 2.2)}s` }}>
            {[0, 1].map(i => (
              <svg key={i} viewBox="0 0 100 22" className="h-[42px] w-1/2 shrink-0 fill-none" style={{ color: accent }}>
                <polyline points={points} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.86" />
              </svg>
            ))}
            </div>
          </div>
        );
      }
    case 'drift':
      {
        const driftFilterId = 'hudDriftFlutter';
        const intensity = Math.max(0.08, level);
        const modeFreqMult = (parameter.mode === 'calm' || parameter.mode === 0) ? 2.8 : ((parameter.mode === 'vintage' || parameter.mode === 1) ? 1.8 : 1.0);
        const modeIntenseMult = (parameter.mode === 'calm' || parameter.mode === 0) ? 0.5 : ((parameter.mode === 'vintage' || parameter.mode === 1) ? 0.75 : 1.0);
        const flutterCycle = Math.max(1.02, (1.6 - intensity * 0.18 - (Number(parameter.rate) || 0) / 285) * modeFreqMult);
        const flutterFrequency = `${(0.018 + intensity * 0.01).toFixed(3)} ${(0.082 + intensity * 0.03).toFixed(3)}`;
        const flutterRestScale = 0.18 + intensity * 0.42;
        const flutterBurstScale = (2.8 + intensity * 6.2) * modeIntenseMult;
        const flutterBlur = 0.04 + intensity * 0.08;
        const flutterBegin = `-${(((Date.now() - FLUTTER_ANIMATION_EPOCH) / 1000) % flutterCycle).toFixed(3)}s`;
        const centerPath = `M4,17 C13,${15 - level * 4} 18,${21 + level * 4} 28,17 S44,${11 + level * 5} 54,17`;
        return (
          <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
            <svg viewBox="0 0 58 34" className="absolute h-full w-full" style={{ color: accent }}>
              <defs>
                <filter id={driftFilterId} x="-45%" y="-75%" width="190%" height="250%" colorInterpolationFilters="sRGB">
                  <feTurbulence type="fractalNoise" baseFrequency={flutterFrequency} numOctaves="2" seed="17" result="hudDriftNoise">
                    <animate attributeName="seed" values="17;17;52;23;23" keyTimes="0;0.66;0.75;0.88;1" dur={`${flutterCycle}s`} begin={flutterBegin} repeatCount="indefinite" />
                  </feTurbulence>
                  <feGaussianBlur in="hudDriftNoise" stdDeviation={flutterBlur} result="softHudDriftNoise" />
                  <feDisplacementMap in="SourceGraphic" in2="softHudDriftNoise" scale={flutterRestScale} xChannelSelector="R" yChannelSelector="G">
                    <animate
                      attributeName="scale"
                      values={`${flutterRestScale};${flutterRestScale};${flutterBurstScale};${flutterRestScale};${flutterRestScale}`}
                      keyTimes="0;0.66;0.75;0.88;1"
                      dur={`${flutterCycle}s`}
                      begin={flutterBegin}
                      repeatCount="indefinite"
                    />
                  </feDisplacementMap>
                </filter>
              </defs>
              <g filter={`url(#${driftFilterId})`} style={{ opacity: 0.72 + level * 0.22 }}>
                <path d={centerPath} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.78" />
                <path d={centerPath} fill="none" stroke="#ffd0bc" strokeWidth="0.42" strokeLinecap="round" opacity={0.14 + level * 0.16} />
              </g>
            </svg>
          </div>
        );
      }
    case 'curve-old':
      return (
        <svg viewBox="0 0 58 34" className="h-full w-full p-1" style={{ color: accent }}>
          <path d="M2,27 C16,27 18,8 30,8 C41,8 42,25 56,25" fill="none" stroke="#331812" strokeWidth="2" strokeLinecap="round" />
          <path d="M2,27 C16,27 18,8 30,8 C41,8 42,25 56,25" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeDasharray="90" strokeDashoffset={78 - level * 68} className="transition-all duration-200 drop-shadow-[0_0_3px_rgba(230,106,83,0.85)]" />
        </svg>
      );
    case 'wave':
      return (
        <div className="absolute left-0 flex h-full w-[200%] items-center hud-slide-left" style={{ animationDuration: speed }}>
          <svg viewBox="0 0 100 22" className="h-7 w-full fill-none" style={{ color: accent }}>
            <path d={`M0,11 Q12.5,${11 - level * 9} 25,11 T50,11 T75,11 T100,11`} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      );
    case 'width':
      {
        const styleIndex = normalizeSpreadDisplayAnimationStyle(parameter.spreadDisplayStyle);
        const railWidth = 18 + level * 66;
        const bracketWidth = railWidth;
        const split = 9 + level * 18;
        switch (styleIndex) {
          case 1:
            return (
              <div className="relative flex h-full w-full items-center justify-center px-2">
                {[-1, 1].map((side, i) => (
                  <div
                    key={side}
                    className="hud-phase-soft absolute h-[3px] rounded-full"
                    style={{
                      width: `${18 + level * 28}%`,
                      backgroundColor: accent,
                      opacity: 0.36 + level * 0.42,
                      transform: `translate(${side * split}px, ${i ? 5 : -5}px)`
                    }}
                  />
                ))}
                <div className="absolute h-px rounded-full bg-[#331812]" style={{ width: `${railWidth}%` }} />
              </div>
            );
          case 2:
            return (
              <svg viewBox="0 0 58 34" className="h-full w-full p-1" style={{ color: accent }} aria-hidden="true">
                <g className="hud-phase-soft">
                  <circle cx={29 - split * 0.72} cy="17" r={4 + level * 5} fill="none" stroke="currentColor" strokeWidth="1.1" opacity={0.28 + level * 0.42} />
                  <circle cx={29 + split * 0.72} cy="17" r={4 + level * 5} fill="none" stroke="currentColor" strokeWidth="1.1" opacity={0.28 + level * 0.42} />
                  <line x1={29 - split * 0.72} y1="17" x2={29 + split * 0.72} y2="17" stroke="currentColor" strokeWidth="0.8" opacity={0.16 + level * 0.24} />
                </g>
              </svg>
            );
          case 3:
            return (
              <svg viewBox="0 0 58 34" className="h-full w-full p-1" style={{ color: accent }} aria-hidden="true">
                <g className="hud-depth-soft" fill="none" stroke="currentColor" strokeLinecap="round">
                  <path d={`M${24 - split * 0.82},9 H${17 - split * 0.52} V25 H${24 - split * 0.82}`} strokeWidth="1.5" opacity={0.38 + level * 0.42} />
                  <path d={`M${34 + split * 0.82},9 H${41 + split * 0.52} V25 H${34 + split * 0.82}`} strokeWidth="1.5" opacity={0.38 + level * 0.42} />
                  <line x1="22" y1="17" x2="36" y2="17" strokeWidth="0.7" opacity="0.2" />
                </g>
              </svg>
            );
          case 4:
            return (
              <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
                <div
                  className="hud-depth-soft absolute rounded-full"
                  style={{
                    width: `${22 + level * 62}px`,
                    height: `${10 + level * 16}px`,
                    background: `radial-gradient(ellipse, rgba(230,106,83,${0.18 + level * 0.4}) 0%, rgba(255,208,188,${0.1 + level * 0.18}) 42%, transparent 76%)`,
                    filter: `blur(${3 + level * 4}px)`,
                    opacity: 0.28 + level * 0.48
                  }}
                />
                <div className="absolute h-px rounded-full" style={{ width: `${railWidth}%`, backgroundColor: accent, opacity: 0.42 + level * 0.28 }} />
              </div>
            );
          case 5:
            return (
              <svg viewBox="0 0 58 34" className="h-full w-full p-1" style={{ color: accent }} aria-hidden="true">
                <g className="hud-phase-soft" fill="none" stroke="currentColor" strokeLinecap="round">
                  <path d={`M29,17 C${25 - split * 0.4},${13 - level * 4} ${19 - split * 0.55},${12 + level * 2} ${11 - split * 0.35},17`} strokeWidth="1.4" opacity={0.48 + level * 0.34} />
                  <path d={`M29,17 C${33 + split * 0.4},${21 + level * 4} ${39 + split * 0.55},${22 - level * 2} ${47 + split * 0.35},17`} strokeWidth="1.4" opacity={0.48 + level * 0.34} />
                  <circle cx={11 - split * 0.35} cy="17" r="1.7" fill="currentColor" opacity={0.42 + level * 0.38} />
                  <circle cx={47 + split * 0.35} cy="17" r="1.7" fill="currentColor" opacity={0.42 + level * 0.38} />
                </g>
              </svg>
            );
          case 6:
            return (
              <div className="relative flex h-full w-full items-center justify-center gap-[3px] px-2">
                {Array.from({ length: 11 }).map((_, i) => {
                  const distance = Math.abs(i - 5);
                  const active = distance <= Math.ceil(level * 5);
                  return (
                    <span
                      key={i}
                      className="hud-depth-soft w-[3px] rounded-full"
                      style={{
                        height: `${8 + (5 - distance) * 2}px`,
                        backgroundColor: accent,
                        opacity: active ? 0.26 + level * 0.52 : 0.08
                      }}
                    />
                  );
                })}
              </div>
            );
          case 7:
            return (
              <svg viewBox="0 0 58 34" className="h-full w-full p-1" style={{ color: accent }} aria-hidden="true">
                <path d={`M${8 + (1 - level) * 8},17 C18,${10 - level * 4} 24,${24 + level * 4} 29,17 S40,${10 - level * 4} ${50 - (1 - level) * 8},17`} fill="none" stroke="#331812" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
                <path className="hud-phase-soft" d={`M${8 + (1 - level) * 8},17 C18,${10 - level * 4} 24,${24 + level * 4} 29,17 S40,${10 - level * 4} ${50 - (1 - level) * 8},17`} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity={0.48 + level * 0.34} />
              </svg>
            );
          case 8:
            return (
              <svg viewBox="0 0 58 34" className="h-full w-full p-1" style={{ color: accent }} aria-hidden="true">
                <g className="hud-depth-soft">
                  <ellipse cx={29 - split * 0.58} cy="17" rx={5 + level * 7} ry={9 + level * 3} fill="currentColor" opacity={0.08 + level * 0.18} />
                  <ellipse cx={29 + split * 0.58} cy="17" rx={5 + level * 7} ry={9 + level * 3} fill="currentColor" opacity={0.08 + level * 0.18} />
                  <ellipse cx={29 - split * 0.58} cy="17" rx={5 + level * 7} ry={9 + level * 3} fill="none" stroke="currentColor" strokeWidth="1" opacity={0.28 + level * 0.34} />
                  <ellipse cx={29 + split * 0.58} cy="17" rx={5 + level * 7} ry={9 + level * 3} fill="none" stroke="currentColor" strokeWidth="1" opacity={0.28 + level * 0.34} />
                </g>
              </svg>
            );
          case 9:
            return (
              <div className="relative flex h-full w-full items-center justify-center">
                <div className="absolute h-px rounded-full" style={{ width: `${railWidth}%`, backgroundColor: accent, opacity: 0.62 }} />
                <div className="absolute flex items-center justify-between" style={{ width: `${bracketWidth}%` }}>
                  <span className="h-3 w-[3px] rounded-sm" style={{ backgroundColor: accent, opacity: 0.86 }} />
                  <span className="h-3 w-[3px] rounded-sm" style={{ backgroundColor: accent, opacity: 0.86 }} />
                </div>
                {[0, 1].map(i => (
                  <div
                    key={i}
                    className="hud-phase-soft absolute h-2.5 w-2.5 rounded-full"
                    style={{
                      transform: `translate(${(i === 0 ? -1 : 1) * (7 + level * 15)}px, ${i === 0 ? -5 : 5}px)`,
                      backgroundColor: i === 0 ? accent : '#ffd0bc',
                      opacity: i === 0 ? 0.72 : 0.5,
                      boxShadow: '0 0 6px rgba(230,106,83,0.55)',
                      animationDelay: i === 0 ? '0s' : '-0.65s'
                    }}
                  />
                ))}
                <div className="relative h-1.5 w-1.5 rounded-full shadow-[0_0_7px_rgba(230,106,83,0.9)]" style={{ backgroundColor: accent }} />
              </div>
            );
          default:
            return (
              <div className="relative flex h-full w-full items-center justify-center">
                <div className="absolute h-px rounded-full" style={{ width: `${railWidth}%`, backgroundColor: accent, opacity: 0.7 }} />
                <div className="absolute flex items-center justify-between" style={{ width: `${bracketWidth}%` }}>
                  <span className="h-3 w-[3px] rounded-sm" style={{ backgroundColor: accent }} />
                  <span className="h-3 w-[3px] rounded-sm" style={{ backgroundColor: accent }} />
                </div>
                <div className="relative h-1.5 w-1.5 rounded-full shadow-[0_0_7px_rgba(230,106,83,0.9)]" style={{ backgroundColor: accent }} />
              </div>
            );
        }
      }
    case 'mixBlend':
      {
        const wet = Math.max(0, Math.min(1, level));
        const dry = 1 - wet;
        const activity = wet;
        const dryPresence = 0.07 + wet * 0.12;
        const wetPresence = Math.pow(wet, 1.25);
        const dryDotOpacity = 0.03 + activity * 0.065;
        const wetDotOpacity = 0.04 + wetPresence * 0.3;
        return (
          <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
            <svg viewBox="0 0 58 34" className="absolute h-full w-full" aria-hidden="true">
              <defs>
                <radialGradient id="hudMixDry" cx="34%" cy="44%" r="63%">
                  <stop offset="0%" stopColor="#f2d7ad" stopOpacity={dryPresence} />
                  <stop offset="52%" stopColor="#c79266" stopOpacity={dryPresence * 0.58} />
                  <stop offset="100%" stopColor="#c79266" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="hudMixWet" cx="64%" cy="48%" r="64%">
                  <stop offset="0%" stopColor="#ffb49d" stopOpacity={0.055 + wetPresence * 0.52} />
                  <stop offset="50%" stopColor={accent} stopOpacity={0.03 + wetPresence * 0.38} />
                  <stop offset="100%" stopColor={accent} stopOpacity="0" />
                </radialGradient>
                <filter id="hudMixSoft" x="-25%" y="-70%" width="150%" height="240%">
                  <feGaussianBlur stdDeviation={0.7 + wet * 1.25} />
                </filter>
              </defs>
              <g filter="url(#hudMixSoft)" className="hud-mix-float">
                <ellipse
                  cx={20 + wet * 1.5}
                  cy="17"
                  rx={5 + wet * 10}
                  ry={3 + wet * 7}
                  fill="url(#hudMixDry)"
                  opacity={0.22 + wet * 0.28}
                />
                <ellipse
                  cx={30 + wet * 5}
                  cy="17"
                  rx={5 + wet * 16}
                  ry={3 + wet * 11.4}
                  fill="url(#hudMixWet)"
                  opacity={0.16 + wetPresence * 0.78}
                />
              </g>
              <g className="hud-mix-dots" opacity={0.1 + wet * 0.9}>
                {Array.from({ length: 9 }, (_, i) => (
                  <circle
                    key={`dry-${i}`}
                    cx={13 + i * 2.15}
                    cy={13 + (i % 3) * 3.2}
                    r={0.45 + wet * 0.55}
                    fill="#f2d7ad"
                    opacity={dryDotOpacity}
                  />
                ))}
                {Array.from({ length: 9 }, (_, i) => (
                  <circle
                    key={`wet-${i}`}
                    cx={29 + i * 2.7}
                    cy={13 + ((i + 1) % 3) * 3.2}
                    r={0.35 + wet * 1.1}
                    fill={accent}
                    opacity={wetDotOpacity}
                  />
                ))}
              </g>
            </svg>
          </div>
        );
      }
    case 'lfo':
      return (
        <svg viewBox="0 0 56 34" className="h-full w-full fill-none p-1" style={{ color: accent }}>
          <polyline points="2,24 15,10 28,24 41,10 54,24" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" opacity="0.74" />
          <circle cx={10 + level * 36} cy={17 + Math.sin(level * Math.PI * 4) * 8} r="2" fill={accent} className="hud-pulse" />
        </svg>
      );
    case 'pulse':
      {
        const styleIndex = normalizeDepthDisplayAnimationStyle(parameter.depthDisplayStyle);
        if (styleIndex === 1) {
          return (
            <div className="flex h-full w-full items-end justify-center gap-[3px] px-3 pb-2">
              {Array.from({ length: 7 }, (_, i) => {
                const barLevel = Math.max(0.12, Math.min(1, level * (0.62 + i * 0.07)));
                return (
                  <div key={i} className="relative h-[28px] w-[4px] overflow-hidden rounded-full bg-[#2b1712]">
                    <div
                      className="hud-depth-soft absolute bottom-0 left-0 w-full rounded-full"
                      style={{
                        height: `${20 + barLevel * 76}%`,
                        background: i % 2 ? '#f0c894' : accent,
                        boxShadow: '0 0 5px rgba(230,106,83,0.58)',
                        animationDelay: `${-i * 0.13}s`
                      }}
                    />
                  </div>
                );
              })}
            </div>
          );
        }
        if (styleIndex === 2) {
          return (
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="hud-depth-ring absolute rounded-full border"
                  style={{
                    width: 12 + level * 22 + i * 10,
                    height: 12 + level * 22 + i * 10,
                    borderColor: i === 0 ? '#ffd0bc' : accent,
                    opacity: 0.36 - i * 0.08,
                    animationDelay: `${-i * 0.42}s`
                  }}
                />
              ))}
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: accent, boxShadow: '0 0 7px rgba(230,106,83,0.8)' }} />
            </div>
          );
        }
        if (styleIndex === 3) {
          return (
            <div className="relative flex h-full w-full items-center justify-center">
              <div className="relative h-[24px] w-[44px] overflow-hidden rounded-[10px] border border-[#3a211a] bg-[#1d1210]">
                <div
                  className="hud-depth-liquid absolute bottom-0 left-0 w-full"
                  style={{
                    height: `${12 + level * 82}%`,
                    background: 'linear-gradient(180deg, rgba(255,208,188,0.42), rgba(230,106,83,0.66))',
                    boxShadow: '0 -2px 8px rgba(230,106,83,0.34)'
                  }}
                />
                <svg viewBox="0 0 44 12" className="absolute left-0 top-[4px] h-3 w-full" style={{ color: '#ffd0bc', opacity: 0.58 }}>
                  <path className="hud-phase-soft" d={`M0,6 C8,${4 - level * 2} 13,${8 + level * 2} 22,6 S36,${4 - level * 2} 44,6`} fill="none" stroke="currentColor" strokeWidth="1.2" />
                </svg>
              </div>
            </div>
          );
        }
        if (styleIndex === 4) {
          return (
            <svg viewBox="0 0 58 34" className="h-full w-full" style={{ color: accent }}>
              {[0, 1, 2, 3].map(i => (
                <rect
                  key={i}
                  x={7 + i * 5}
                  y={5 + i * 3}
                  width={44 - i * 10}
                  height={24 - i * 6}
                  rx={10 - i * 1.4}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.1"
                  opacity={0.12 + level * (0.12 + i * 0.07)}
                  className="hud-depth-soft"
                  style={{ animationDelay: `${-i * 0.22}s` }}
                />
              ))}
              <path d="M12,17 H46" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity={0.34 + level * 0.34} />
            </svg>
          );
        }
        if (styleIndex === 5) {
          return (
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
              <div
                className="hud-depth-soft absolute rounded-full"
                style={{
                  width: 22 + level * 34,
                  height: 12 + level * 18,
                  background: `radial-gradient(ellipse, rgba(255,216,184,${0.12 + level * 0.26}), rgba(230,106,83,${0.16 + level * 0.38}) 48%, transparent 75%)`,
                  filter: `blur(${2 + level * 3}px)`
                }}
              />
              <div className="h-[3px] w-[46px] rounded-full bg-[#2b1712]">
                <div className="h-full rounded-full" style={{ width: `${16 + level * 78}%`, backgroundColor: accent, boxShadow: '0 0 5px rgba(230,106,83,0.65)' }} />
              </div>
            </div>
          );
        }
        if (styleIndex === 6) {
          return (
            <div className="grid h-full w-full grid-cols-5 items-center gap-[3px] px-3">
              {Array.from({ length: 10 }, (_, i) => {
                const active = i / 9 <= level;
                return (
                  <div
                    key={i}
                    className="h-[5px] rounded-sm transition-all duration-200"
                    style={{
                      backgroundColor: active ? accent : '#2b1712',
                      opacity: active ? 0.42 + level * 0.42 : 0.55,
                      boxShadow: active ? '0 0 4px rgba(230,106,83,0.56)' : 'none'
                    }}
                  />
                );
              })}
            </div>
          );
        }
        if (styleIndex === 7) {
          const angle = -122 + level * 244;
          return (
            <svg viewBox="0 0 58 34" className="h-full w-full" style={{ color: accent }}>
              <path d="M12,25 A18,18 0 0 1 46,25" fill="none" stroke="#2b1712" strokeWidth="3" strokeLinecap="round" />
              <path d="M12,25 A18,18 0 0 1 46,25" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity={0.24 + level * 0.54} />
              <g transform={`translate(29 25) rotate(${angle})`}>
                <line x1="0" y1="0" x2="0" y2="-15" stroke="#ffd0bc" strokeWidth="1.6" strokeLinecap="round" />
                <circle cx="0" cy="0" r="2.2" fill="currentColor" opacity="0.74" />
              </g>
            </svg>
          );
        }
        if (styleIndex === 8) {
          return (
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
              <div
                className="absolute rounded-full"
                style={{
                  width: 44 + level * 20,
                  height: 20 + level * 10,
                  background: 'radial-gradient(ellipse, rgba(0,0,0,0.48), rgba(0,0,0,0.12) 58%, transparent 80%)',
                  filter: 'blur(3px)'
                }}
              />
              <div
                className="hud-depth-soft absolute rounded-full"
                style={{
                  width: 12 + level * 30,
                  height: 6 + level * 12,
                  background: `radial-gradient(ellipse, rgba(255,208,188,${0.18 + level * 0.28}), rgba(230,106,83,${0.16 + level * 0.32}) 48%, transparent 74%)`,
                  filter: 'blur(2px)'
                }}
              />
            </div>
          );
        }
        if (styleIndex === 9) {
          const points = [];
          for (let x = 6; x <= 52; x += 1) {
            const normX = (x - 6) / 46;
            const baseWave = Math.sin(normX * Math.PI * 2 + time * 1.3);
            const foldedWave = Math.sin(normX * Math.PI * 6 + time * 2.4) * Math.cos(normX * Math.PI * 2 - time * 0.8);
            const y = 17 + (baseWave * (1 - level) + foldedWave * level) * 10.5;
            points.push(`${x},${y.toFixed(2)}`);
          }
          return (
            <svg viewBox="0 0 58 34" className="h-full w-full" style={{ color: accent }} aria-hidden="true">
              <circle cx="29" cy="17" r="12.4" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.18" />
              <path
                d={`M ${points.join(' L ')}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.56 + level * 0.3}
                className="hud-phase-soft"
              />
            </svg>
          );
        }
        if (styleIndex === 10) {
          const pulse = 0.5 + 0.5 * Math.sin(time * 2.4);
          const animatedLevel = Math.max(0, Math.min(1, level * 0.82 + pulse * level * 0.18));
          return (
            <svg viewBox="0 0 58 34" className="h-full w-full" style={{ color: accent }} aria-hidden="true">
              <circle cx="29" cy="17" r="9.8" fill="none" stroke="#2b1712" strokeWidth={1.4 + animatedLevel * 6.2} opacity="0.8" />
              <circle
                cx="29"
                cy="17"
                r="9.8"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.1 + animatedLevel * 5}
                opacity={0.38 + animatedLevel * 0.42}
                className="hud-depth-soft"
              />
              <circle cx="29" cy="17" r={2.4 + animatedLevel * 1.8} fill="currentColor" opacity={0.16 + animatedLevel * 0.28} />
            </svg>
          );
        }
        if (styleIndex === 11) {
          return (
            <svg viewBox="0 0 100 100" className="h-full w-full" style={{ color: accent }} aria-hidden="true">
              <circle cx="50" cy="50" r="12" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.84" />
              <circle cx="50" cy="50" r="24" fill="none" stroke="currentColor" strokeWidth="2.5" opacity={Math.max(0, (level - 0.2) * 1.2)} />
              <circle cx="50" cy="50" r="36" fill="none" stroke="currentColor" strokeWidth="1.5" opacity={Math.max(0, (level - 0.5) * 2)} />
            </svg>
          );
        }
        if (styleIndex === 12) {
          const vertices = [
            [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
            [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
          ];
          const rotY = level * Math.PI * 0.6 + time * (0.45 + level * 0.9);
          const rotX = level * Math.PI * 0.3 + time * (0.22 + level * 0.45);
          const project = (scale) => vertices.map(([x, y, z]) => {
            const x1 = x * Math.cos(rotY) - z * Math.sin(rotY);
            const z1 = x * Math.sin(rotY) + z * Math.cos(rotY);
            const y2 = y * Math.cos(rotX) - z1 * Math.sin(rotX);
            return [29 + x1 * scale, 17 + y2 * scale];
          });
          const outer = project(7.6 + level * 3.2);
          const inner = project(3.8 + level * 1.9);
          const cubePath = (pts) => (
            <>
              <path d={`M ${pts[0][0]},${pts[0][1]} L ${pts[1][0]},${pts[1][1]} L ${pts[2][0]},${pts[2][1]} L ${pts[3][0]},${pts[3][1]} Z`} />
              <path d={`M ${pts[4][0]},${pts[4][1]} L ${pts[5][0]},${pts[5][1]} L ${pts[6][0]},${pts[6][1]} L ${pts[7][0]},${pts[7][1]} Z`} />
              {[0, 1, 2, 3].map(i => <line key={i} x1={pts[i][0]} y1={pts[i][1]} x2={pts[i + 4][0]} y2={pts[i + 4][1]} />)}
            </>
          );
          return (
            <svg viewBox="0 0 58 34" className="h-full w-full" style={{ color: accent }} aria-hidden="true">
              <g className="hud-phase-soft" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" opacity={0.5 + level * 0.3}>
                {cubePath(outer)}
              </g>
              <g fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" opacity={0.18 + level * 0.18}>
                {cubePath(inner)}
                {[0, 1, 2, 3, 4, 5, 6, 7].map(i => <line key={i} x1={outer[i][0]} y1={outer[i][1]} x2={inner[i][0]} y2={inner[i][1]} strokeDasharray="1.5 1.5" />)}
              </g>
            </svg>
          );
        }
        if (styleIndex === 13) {
          const points = [];
          const numPoints = 76;
          for (let i = 0; i <= numPoints; i++) {
            const angle = (i / numPoints) * Math.PI * 2;
            const drift = Math.sin(angle * 5 + time * 4) * 4.2 * level;
            const flutter = Math.cos(angle * 11 - time * 9) * 1.15 * level;
            const radius = 9.8 + drift + flutter;
            points.push(`${(29 + radius * Math.cos(angle)).toFixed(2)},${(17 + radius * Math.sin(angle)).toFixed(2)}`);
          }
          const particleRadius = 9.8 + Math.sin(time * 5) * 4.2 * level;
          return (
            <svg viewBox="0 0 58 34" className="h-full w-full" style={{ color: accent }} aria-hidden="true">
              <circle cx="29" cy="17" r="9.8" fill="none" stroke="currentColor" strokeWidth="0.7" strokeDasharray="2 2" opacity="0.18" />
              <path d={`M ${points.join(' L ')}`} fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" opacity={0.54 + level * 0.32} className="hud-phase-soft" />
              <circle cx={29 + particleRadius * Math.cos(time * 1.5)} cy={17 + particleRadius * Math.sin(time * 1.5)} r="1.5" fill="currentColor" opacity="0.82" />
            </svg>
          );
        }
        if (styleIndex === 14) {
          const upper = [];
          const lower = [];
          for (let x = 7; x <= 51; x += 2) {
            const normX = (x - 7) / 44;
            const sag = Math.sin(normX * Math.PI * 2 + time * 4) * 5.2 * level;
            const microFlutter = Math.sin(normX * Math.PI * 10 - time * 12) * 0.9 * level;
            upper.push(`${x},${(12 + sag + microFlutter).toFixed(2)}`);
            lower.push(`${x},${(22 + sag + microFlutter).toFixed(2)}`);
          }
          return (
            <svg viewBox="0 0 58 34" className="h-full w-full" style={{ color: accent }} aria-hidden="true">
              <line x1="7" y1="12" x2="51" y2="12" stroke="currentColor" strokeWidth="0.7" strokeDasharray="2 2" opacity="0.18" />
              <line x1="7" y1="22" x2="51" y2="22" stroke="currentColor" strokeWidth="0.7" strokeDasharray="2 2" opacity="0.18" />
              <path d={`M ${upper.join(' L ')}`} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" opacity={0.48 + level * 0.32} className="hud-depth-soft" />
              <path d={`M ${lower.join(' L ')}`} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" opacity={0.4 + level * 0.3} className="hud-phase-soft" />
            </svg>
          );
        }
        if (styleIndex === 15) {
          const paths = Array.from({ length: 5 }, (_, i) => {
            const startX = 17 + i * 6;
            const points = [];
            for (let y = 6; y <= 28; y += 2) {
              const normY = (y - 6) / 22;
              const sway = Math.sin(normY * Math.PI + time * 5 + i * 0.5) * 5.8 * level;
              points.push(`${(startX + sway).toFixed(2)},${y}`);
            }
            return `M ${points.join(' L ')}`;
          });
          return (
            <svg viewBox="0 0 58 34" className="h-full w-full" style={{ color: accent }} aria-hidden="true">
              <line x1="13" y1="6" x2="45" y2="6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity="0.28" />
              <line x1="13" y1="28" x2="45" y2="28" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity="0.28" />
              {paths.map((d, i) => (
                <path key={i} d={d} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" opacity={0.72 - i * 0.07} className={i % 2 ? 'hud-depth-soft' : 'hud-phase-soft'} />
              ))}
            </svg>
          );
        }
        return (
          <div className="relative flex h-full w-full items-center justify-center">
            <div
              className="absolute rounded-full"
              style={{
                width: 14 + level * 16,
                height: 14 + level * 16,
                background: `radial-gradient(circle, rgba(230,106,83,${0.03 + level * 0.08}) 0%, rgba(230,106,83,${0.02 + level * 0.05}) 42%, rgba(230,106,83,0) 72%)`,
                filter: `blur(${1.2 + level * 1.8}px)`,
                opacity: 0.45 + level * 0.25
              }}
            />
            <div className="absolute h-[3px] w-[82%] overflow-hidden rounded-full bg-[#2b1712]">
              <div
                className="hud-depth-soft h-full rounded-full"
                style={{
                  width: `${level * 100}%`,
                  backgroundColor: accent,
                  boxShadow: '0 0 5px rgba(230,106,83,0.62)'
                }}
              />
            </div>
            <div
              className="absolute rounded-full border"
              style={{
                width: 14 + level * 16,
                height: 14 + level * 16,
                borderColor: accent,
                opacity: 0.18 + level * 0.36
              }}
            />
          </div>
        );
      }
    case 'circle':
      {
        const styleIndex = normalizePhaseDisplayAnimationStyle(parameter.phaseDisplayStyle);
        if (styleIndex === 1) {
          const dotX = 29 + Math.cos(level * Math.PI * 2) * 18;
          const dotY = 17 + Math.sin(level * Math.PI * 4) * 9;
          return (
            <svg viewBox="0 0 58 34" className="h-full w-full" style={{ color: accent }}>
              <ellipse cx="29" cy="17" rx="21" ry="10" fill="none" stroke="#2b1712" strokeWidth="1.5" opacity="0.9" />
              <ellipse cx="29" cy="17" rx="21" ry="10" fill="none" stroke="currentColor" strokeWidth="1.1" opacity="0.34" className="hud-phase-soft" />
              <circle cx={dotX} cy={dotY} r="2" fill="#ffd0bc" opacity="0.9" />
              <circle cx={58 - dotX} cy={34 - dotY} r="1.4" fill="currentColor" opacity="0.45" />
            </svg>
          );
        }
        if (styleIndex === 2) {
          return (
            <svg viewBox="0 0 58 34" className="h-full w-full" style={{ color: accent }}>
              <path d="M8,12 H50 M8,22 H50" stroke="#2b1712" strokeWidth="2" strokeLinecap="round" />
              <path d="M8,12 H50" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.55" />
              <path d="M50,22 H8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.38" />
              <circle cx={8 + level * 42} cy="12" r="1.9" fill="#ffd0bc" />
              <circle cx={50 - level * 42} cy="22" r="1.9" fill="currentColor" opacity="0.74" />
            </svg>
          );
        }
        if (styleIndex === 3) {
          const angle = level * 180;
          return (
            <svg viewBox="0 0 58 34" className="h-full w-full" style={{ color: accent }}>
              <circle cx="29" cy="17" r="12" fill="none" stroke="#2b1712" strokeWidth="2" />
              <circle cx="29" cy="17" r="12" fill="none" stroke="currentColor" strokeWidth="1.1" opacity="0.34" />
              <g transform={`translate(29 17) rotate(${angle})`}>
                <line x1="-12" y1="0" x2="12" y2="0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="hud-phase-soft" />
                <circle cx="12" cy="0" r="1.8" fill="#ffd0bc" />
              </g>
            </svg>
          );
        }
        if (styleIndex === 4) {
          return (
            <svg viewBox="0 0 58 34" className="h-full w-full p-1" style={{ color: accent }}>
              <path d={`M4,13 C14,${6 + level * 8} 24,${20 - level * 8} 34,13 S50,${6 + level * 8} 56,13`} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.72" className="hud-phase-soft" />
              <path d={`M4,21 C14,${28 - level * 8} 24,${14 + level * 8} 34,21 S50,${28 - level * 8} 56,21`} fill="none" stroke="#ffd0bc" strokeWidth="1.1" strokeLinecap="round" opacity="0.46" className="hud-depth-soft" />
            </svg>
          );
        }
        if (styleIndex === 5) {
          const dash = 12 + level * 46;
          return (
            <svg viewBox="0 0 58 34" className="h-full w-full" style={{ color: accent }}>
              <path d="M13,24 A18,18 0 1 1 45,24" fill="none" stroke="#2b1712" strokeWidth="2.4" strokeLinecap="round" />
              <path d="M13,24 A18,18 0 1 1 45,24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeDasharray={`${dash} 80`} opacity="0.74" className="hud-phase-soft" />
              <circle cx={13 + level * 32} cy={24 - Math.sin(level * Math.PI) * 18} r="1.8" fill="#ffd0bc" />
            </svg>
          );
        }
        if (styleIndex === 6) {
          return (
            <div className="relative flex h-full w-full items-center justify-center">
              <div className="absolute h-px w-[72%] rounded-full bg-[#2b1712]" />
              {[0, 1].map(i => (
                <div
                  key={i}
                  className="hud-phase-soft absolute h-3 w-3 rounded-full"
                  style={{
                    transform: `translateX(${(i === 0 ? -1 : 1) * (7 + level * 15)}px)`,
                    backgroundColor: i === 0 ? accent : '#ffd0bc',
                    opacity: i === 0 ? 0.72 : 0.48,
                    boxShadow: '0 0 6px rgba(230,106,83,0.55)',
                    animationDelay: i === 0 ? '0s' : '-0.65s'
                  }}
                />
              ))}
            </div>
          );
        }
        if (styleIndex === 7) {
          const angle = -34 + level * 68;
          return (
            <svg viewBox="0 0 58 34" className="h-full w-full" style={{ color: accent }}>
              <line x1="9" y1="17" x2="49" y2="17" stroke="#2b1712" strokeWidth="2" strokeLinecap="round" />
              <g transform={`translate(29 17) rotate(${angle})`}>
                <line x1="-20" y1="0" x2="20" y2="0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.78" className="hud-phase-soft" />
                <circle cx="0" cy="0" r="2" fill="#ffd0bc" />
              </g>
            </svg>
          );
        }
        if (styleIndex === 8) {
          return (
            <div className="flex h-full w-full items-center justify-center gap-[3px] px-3">
              {Array.from({ length: 8 }, (_, i) => {
                const center = 3.5;
                const distance = Math.abs(i - center) / center;
                const active = distance <= level || i % 2 === 0;
                return (
                  <div
                    key={i}
                    className="hud-phase-soft h-[24px] w-[3px] rounded-full"
                    style={{
                      backgroundColor: active ? (i < 4 ? accent : '#ffd0bc') : '#2b1712',
                      opacity: active ? 0.28 + level * 0.45 : 0.38,
                      transform: `scaleY(${0.42 + (1 - distance * 0.38) * (0.32 + level * 0.34)})`,
                      animationDelay: `${-i * 0.08}s`
                    }}
                  />
                );
              })}
            </div>
          );
        }
        if (styleIndex === 9) {
          const splitOffset = (level - 0.5) * 7;
          return (
            <svg viewBox="0 0 58 34" className="h-full w-full" style={{ color: accent }} aria-hidden="true">
              <defs>
                <clipPath id="phaseSplitDiscLeft">
                  <rect x="16" y="5" width="13" height="24" />
                </clipPath>
                <clipPath id="phaseSplitDiscRight">
                  <rect x="29" y="5" width="13" height="24" />
                </clipPath>
              </defs>
              <circle cx="29" cy="17" r="11.5" fill="#2b1712" opacity="0.92" />
              <circle cx={29 - splitOffset} cy="17" r="10.5" fill="#ffd0bc" opacity={0.34 + level * 0.34} clipPath="url(#phaseSplitDiscLeft)" className="hud-phase-soft" />
              <circle cx={29 + splitOffset} cy="17" r="10.5" fill="currentColor" opacity={0.26 + level * 0.42} clipPath="url(#phaseSplitDiscRight)" className="hud-depth-soft" />
              <line x1="29" y1="6.2" x2="29" y2="27.8" stroke="#f4d9b6" strokeWidth="1.1" strokeLinecap="round" opacity="0.64" />
              <circle cx="29" cy="17" r="11.5" fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.32" />
            </svg>
          );
        }
        if (styleIndex === 10) {
          const eclipseX = 22 + level * 14;
          return (
            <svg viewBox="0 0 58 34" className="h-full w-full" style={{ color: accent }} aria-hidden="true">
              <circle cx="29" cy="17" r="11.4" fill="currentColor" opacity={0.12 + level * 0.28} className="hud-phase-soft" />
              <circle cx="29" cy="17" r="11.4" fill="none" stroke="#2b1712" strokeWidth="2" opacity="0.86" />
              <circle cx={eclipseX} cy="17" r="11.2" fill="#ffd0bc" opacity={0.22 + level * 0.38} className="hud-depth-soft" />
              <path d="M29,6 V28" stroke="#2b1712" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
              <path d="M29,7 V27" stroke="currentColor" strokeWidth="0.6" strokeLinecap="round" opacity="0.5" />
            </svg>
          );
        }
        if (styleIndex === 11) {
          const leftScale = 0.72 + (1 - level) * 0.44;
          const rightScale = 0.72 + level * 0.44;
          return (
            <div className="relative flex h-full w-full items-center justify-center">
              <div className="absolute h-px w-[68%] rounded-full bg-[#2b1712]" />
              <svg viewBox="0 0 58 34" className="absolute h-full w-full" style={{ color: accent }} aria-hidden="true">
                <path
                  className="hud-depth-soft"
                  d="M29,7 A10,10 0 0 0 29,27 Z"
                  fill="#ffd0bc"
                  opacity={0.22 + level * 0.32}
                  transform={`translate(${(level - 0.5) * -5} 0) scale(${leftScale} 1)`}
                  style={{ transformOrigin: '29px 17px' }}
                />
                <path
                  className="hud-phase-soft"
                  d="M29,7 A10,10 0 0 1 29,27 Z"
                  fill="currentColor"
                  opacity={0.24 + level * 0.36}
                  transform={`translate(${(level - 0.5) * 5} 0) scale(${rightScale} 1)`}
                  style={{ transformOrigin: '29px 17px' }}
                />
                <circle cx="29" cy="17" r="10.5" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.34" />
                <line x1="29" y1="7.6" x2="29" y2="26.4" stroke="#f4d9b6" strokeWidth="0.9" strokeLinecap="round" opacity="0.62" />
              </svg>
            </div>
          );
        }
        if (styleIndex === 12) {
          const angle = -90 + level * 180;
          return (
            <svg viewBox="0 0 58 34" className="h-full w-full" style={{ color: accent }} aria-hidden="true">
              <circle cx="29" cy="17" r="10.8" fill="#2b1712" opacity="0.86" />
              <path d="M29,6.2 A10.8,10.8 0 0 0 29,27.8 Z" fill="#ffd0bc" opacity={0.3 + level * 0.28} />
              <path d="M29,6.2 A10.8,10.8 0 0 1 29,27.8 Z" fill="currentColor" opacity={0.22 + level * 0.36} />
              <circle cx="29" cy="17" r="12.8" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 4" opacity="0.24" />
              <g className="hud-phase-soft" transform={`translate(29 17) rotate(${angle})`}>
                <circle cx="0" cy="-12.8" r="1.8" fill="#ffd0bc" opacity="0.92" />
                <circle cx="0" cy="12.8" r="1.4" fill="currentColor" opacity="0.64" />
              </g>
              <line x1="29" y1="6.6" x2="29" y2="27.4" stroke="#f4d9b6" strokeWidth="0.8" strokeLinecap="round" opacity="0.56" />
            </svg>
          );
        }
        if (styleIndex === 13) {
          const phaseAngle = level * 180;
          return (
            <svg viewBox="0 0 58 34" className="h-full w-full" style={{ color: accent }} aria-hidden="true">
              <g
                className="hud-phase-soft"
                transform={`rotate(${phaseAngle} 29 17)`}
                style={{ transition: 'transform 75ms ease-out' }}
              >
                <circle cx="29" cy="17" r="11.5" fill="none" stroke="currentColor" strokeWidth="1.3" opacity="0.78" />
                <path d="M29,5.5 A11.5,11.5 0 0 0 29,28.5 Z" fill="currentColor" opacity={0.48 + level * 0.26} />
                <line x1="29" y1="5.5" x2="29" y2="28.5" stroke="#121113" strokeWidth="1.3" strokeLinecap="round" opacity="0.9" />
              </g>
            </svg>
          );
        }
        if (styleIndex === 14) {
          const rad = level * Math.PI;
          const points = [];
          const waveformClipId = 'phaseWaveformMorphClip';
          const centerX = 29;
          const centerY = 17;
          const radius = 12.5;
          for (let x = 17; x <= 41; x += 1) {
            const t = (x - 17) / 24;
            const angleOffset = t * Math.PI * 2 * 1.5;
            const y = centerY + Math.sin(angleOffset - rad) * 4.9;
            points.push(`${x},${y.toFixed(2)}`);
          }
          return (
            <svg viewBox="0 0 58 34" className="h-full w-full" style={{ color: accent }} aria-hidden="true">
              <defs>
                <clipPath id={waveformClipId}>
                  <circle cx={centerX} cy={centerY} r={radius} />
                </clipPath>
              </defs>
              <circle cx={centerX} cy={centerY} r={radius} fill="#121113" opacity="0.94" />
              <path
                d={`M ${points.join(' L ')}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.45"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.78 + level * 0.12}
                className="hud-phase-soft"
                clipPath={`url(#${waveformClipId})`}
              />
              <circle cx={centerX} cy={centerY} r={radius} fill="none" stroke="#2b1712" strokeWidth="1.35" opacity="0.9" />
              <circle cx={centerX} cy={centerY} r={radius} fill="none" stroke="currentColor" strokeWidth="0.95" opacity="0.44" />
            </svg>
          );
        }
        if (styleIndex === 15) {
          const rad = level * Math.PI;
          const points = [];
          const radius = 9.8;
          for (let i = 0; i <= 72; i++) {
            const t = (i / 72) * Math.PI * 2;
            const x = 29 + radius * Math.sin(t);
            const y = 17 - radius * Math.sin(t + rad);
            points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
          }
          return (
            <svg viewBox="0 0 58 34" className="h-full w-full" style={{ color: accent }} aria-hidden="true">
              <circle cx="29" cy="17" r="12.2" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.25" />
              <path
                d={`M ${points.join(' L ')}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.56 + level * 0.28}
                className="hud-phase-soft"
              />
            </svg>
          );
        }
        if (styleIndex === 16) {
          const phaseAngle = level * 180;
          const squash = Math.max(0.16, Math.abs(Math.cos((phaseAngle * Math.PI) / 180)));
          return (
            <div className="relative flex h-full w-full items-center justify-center" style={{ perspective: 320 }}>
              <div
                className="relative h-[32px] w-[32px] rounded-full"
                style={{
                  transform: `rotateY(${phaseAngle}deg) scaleX(${0.28 + squash * 0.72})`,
                  transformStyle: 'preserve-3d',
                  transition: 'transform 75ms ease-out',
                  filter: 'drop-shadow(0 0 5px rgba(230,106,83,0.34))'
                }}
              >
                <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" style={{ color: accent }} aria-hidden="true">
                  <circle cx="50" cy="50" r="44" fill="#121113" stroke="currentColor" strokeWidth="4" opacity="0.95" />
                  <path d="M50,6 A44,44 0 0 0 50,94 Z" fill="currentColor" opacity={0.5 + level * 0.24} />
                  <line x1="50" y1="6" x2="50" y2="94" stroke="currentColor" strokeWidth="4" opacity="0.9" />
                </svg>
              </div>
            </div>
          );
        }
        return (
          <div className="flex h-full w-full items-center justify-center">
            <svg viewBox="0 0 58 34" className="h-full w-full p-1" style={{ color: accent }}>
              {(() => {
                const startX = 4;
                const endX = 54;
                const spanX = endX - startX;
                const dotX = startX + level * spanX;
                const t = (dotX - startX) / spanX;
                const p0 = { x: startX, y: 17 };
                const p1 = { x: 13.25, y: 17 - level * 16.6 };
                const p2 = { x: 31.75, y: 17 + level * 16.6 };
                const p3 = { x: endX, y: 17 };
                const oneMinusT = 1 - t;
                const dotY = (oneMinusT ** 3) * p0.y
                  + 3 * (oneMinusT ** 2) * t * p1.y
                  + 3 * oneMinusT * (t ** 2) * p2.y
                  + (t ** 3) * p3.y;
                return (
                  <>
              <path d={`M${startX},17 H${endX}`} stroke="#2b1712" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
              <path d={`M${startX},17 C12.75,${17 - level * 16.6} 32.25,${17 + level * 16.6} ${endX},17`} fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" opacity="0.82" className="hud-phase-soft" />
              <circle cx={dotX} cy={dotY} r="2.4" fill="currentColor" opacity="0.82" />
                  </>
                );
              })()}
            </svg>
          </div>
        );
      }
    default:
      return null;
  }
};

const ParameterDataDisplay = ({ parameter, power = true, saturationMode = 0, onSaturationModeChange, filterPole = 12, onFilterPoleChange }) => {
  const level = parameter.level ?? 0.5;
  const inWidth = `${Math.round((parameter.signalIn ?? level) * 82 + 10)}%`;
  const outWidth = `${Math.round((parameter.signalOut ?? level) * 82 + 10)}%`;
  const isSaturationDisplay = parameter.id === 'sat';
  const isFilterDisplay = parameter.id === 'filter';
  const activeSaturationMode = normalizeSaturationMode(saturationMode);
  const displayAnimationParameter = isSaturationDisplay
    ? { ...parameter, level: level * 0.44 }
    : isFilterDisplay
      ? { ...parameter, filterPole: normalizeFilterPole(filterPole) }
      : parameter;
  const selectDisplayOption = (optionIndex) => {
    if (isSaturationDisplay) {
      onSaturationModeChange?.(normalizeSaturationMode(optionIndex));
      return;
    }
    if (isFilterDisplay) {
      onFilterPoleChange?.(optionIndex === 0 ? 12 : 24);
    }
  };

  return (
    <div
      className={`relative p-[4px] rounded-full border transition-opacity duration-300 ${power ? 'opacity-95' : 'opacity-50'}`}
      style={{
        background: '#1b1917',
        borderColor: 'rgba(70,67,62,0.34)',
        boxShadow: '2px 4px 6px rgba(19,15,13,0.24), inset 0 1px 0 rgba(255,255,245,0.055), inset 0 -1px 2px rgba(0,0,0,0.36)'
      }}
    >
      <div
        className="relative flex h-[60px] w-[178px] overflow-hidden rounded-full"
        style={{
          background: 'linear-gradient(180deg, #191817 0%, #121110 100%)',
          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.56), inset 0 0 0 1px rgba(255,235,210,0.04)',
          fontFamily: DISPLAY_FONT_STACK,
          fontVariantNumeric: 'tabular-nums'
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 z-20 rounded-full"
          style={{
            background: 'radial-gradient(ellipse at 30% 78%, rgba(230,106,83,0.12), transparent 54%), radial-gradient(ellipse at 82% 18%, rgba(220,205,185,0.06), transparent 46%)',
            mixBlendMode: 'screen',
            opacity: 0.82
          }}
        />
        <div
          className="pointer-events-none absolute inset-x-5 top-[5px] z-30 h-[18%] rounded-full"
          style={{
            background: 'linear-gradient(180deg, rgba(235,230,220,0.03), transparent)',
            opacity: 0.5
          }}
        />
        <div className="pointer-events-none absolute inset-0 z-20 rounded-full shadow-[inset_0_0_12px_rgba(0,0,0,0.24)]" />
        <div className={`hud-screen-soft relative flex h-full w-[50%] items-center overflow-hidden pl-2`}>
          <DisplayFeatureAnimation parameter={displayAnimationParameter} />
          {isSaturationDisplay && (
            <SaturationDisplayGraphic mode={activeSaturationMode} level={level} power={power} />
          )}
        </div>
        <div className="hud-screen-soft relative z-10 flex h-full w-[50%] translate-x-[-3px] translate-y-[-1px] flex-col justify-center px-4">
          <div className="mb-0.5 text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: 'rgba(230,106,83,0.86)', textShadow: '0 0 4px rgba(230,106,83,0.35)' }}>{parameter.name}</div>
          <div className="translate-y-[-1px]">
            <div className="mb-1 flex items-baseline leading-none tracking-wider" style={{ color: '#f0ece1', textShadow: '0 0 3px rgba(230,106,83,0.32)' }}>
              <span className={parameter.val.length > 5 ? 'text-[10px]' : 'text-[14px]'} style={{ color: '#f0ece1' }}>{parameter.val}</span>
              {parameter.unit && <span className={`ml-1 ${parameter.unit === '%' || parameter.unit === 'Hz' ? 'text-[11px]' : 'text-[8px]'}`} style={{ color: 'rgba(230,106,83,0.78)' }}>{parameter.unit}</span>}
            </div>
            <div className="flex flex-col gap-[1.5px]">
              <div className="flex items-center gap-1">
                <span className="w-[11px] text-[5px] font-semibold leading-none" style={{ color: 'rgba(230,106,83,0.6)' }}>IN</span>
                <div className="h-[1.5px] flex-1 overflow-hidden rounded-full bg-[#2b1712]">
                  <div className="h-full rounded-full bg-[#e66a53] shadow-[0_0_3px_rgba(230,106,83,0.72)] transition-all duration-200" style={{ width: inWidth }} />
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-[11px] text-[5px] font-semibold leading-none" style={{ color: 'rgba(230,106,83,0.6)' }}>OUT</span>
                <div className="h-[1.5px] flex-1 overflow-hidden rounded-full bg-[#2b1712]">
                  <div className="h-full rounded-full bg-[#e66a53] shadow-[0_0_3px_rgba(230,106,83,0.64)] transition-all duration-200" style={{ width: outWidth }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="pointer-events-auto absolute left-1/2 top-[calc(100%+7px)] flex -translate-x-1/2 items-center gap-2">
        <SideDisplayButtons onPrev={() => selectDisplayOption(0)} onNext={() => selectDisplayOption(1)} />
        <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#fff8eb]">
          OPTIONS
        </span>
      </div>
    </div>
  );
};

const MatteKnob = ({ label, displayLabel, value, onChange, onDoubleClick, min = 0, max = 100, size = 60, color = 'charcoal', labelColorOverride, labelSizeClass = 'text-[10px]', labelTrackingClass = 'tracking-[0.2em]', shadingStyle, labelOffsetY = 0, readoutOffsetY = 0, labelTextShadow = PANEL_TEXT_DEPTH_SHADOW, steadyReadout = false, indicatorActive = true, forceSnappy = false, onDraggingChange, onDisplayFocus, readoutStyleIndex = 0, outerRingEnabled = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const startVal = useRef(0);
  const handlePointerDown = (e) => { e.preventDefault(); onDisplayFocus?.(); setIsDragging(true); onDraggingChange?.(true); startY.current = e.clientY; startVal.current = value; e.target.setPointerCapture(e.pointerId); };
  const handlePointerMove = (e) => { if (!isDragging) return; e.preventDefault(); const d = startY.current - e.clientY; onChange(Math.max(min, Math.min(max, startVal.current + (d * 0.8) * ((max - min) / 100)))); };
  const handlePointerUp = (e) => { setIsDragging(false); onDraggingChange?.(false); e.target.releasePointerCapture(e.pointerId); };
  const rotation = ((value - min) / (max - min) * 270) - 135;
  const isCoral = color === 'coral';
  const formattedVal = formatKnobValue(label, value);
  const readoutStyle = KNOB_READOUT_STYLES[readoutStyleIndex] || KNOB_READOUT_STYLES[0];
  const hasPronouncedGrip = false;
  const ridgeCount = shadingStyle?.ridgeCount || 92;
  const ridgeWidth = Math.max(1, size * 0.017);
  const ridgeHeight = Math.max(3, size * 0.06);
  const ridgeRadius = size * 0.505;
  const baseBoxShadow = isCoral
    ? '10px 10px 18px rgba(180,60,40,0.4), 4px 4px 6px rgba(180,60,40,0.3), inset 2px 2px 5px rgba(255,255,255,0.4), inset -2px -2px 5px rgba(0,0,0,0.3)'
    : (shadingStyle?.boxShadow || '12px 12px 20px rgba(0,0,0,0.45), 4px 4px 6px rgba(0,0,0,0.35), inset 1px 1px 2px rgba(255,255,255,0.3), inset -1px -1px 3px rgba(0,0,0,0.9)');
  const ringBoxShadow = outerRingEnabled
    ? `0 0 0 ${Math.max(1, size * 0.018)}px rgba(18,16,14,0.76), 0 -1px 0 ${Math.max(1.5, size * 0.029)}px rgba(235,210,170,0.075), `
    : '';

  return (
    <div className="flex flex-col items-center justify-center group select-none relative z-10" onDoubleClick={onDoubleClick}>
      <div className="relative overflow-visible rounded-full cursor-ns-resize touch-none" style={{ width: size, height: size, backgroundColor: isCoral ? '#e66a53' : (shadingStyle?.backgroundColor || '#111'), boxShadow: `${ringBoxShadow}${baseBoxShadow}`, backgroundImage: isCoral ? 'none' : (shadingStyle?.backgroundImage || 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.8) 100%), conic-gradient(from 180deg at 50% 50%, #0a0a0a 0deg, #252525 45deg, #0a0a0a 90deg, #252525 135deg, #0a0a0a 180deg, #252525 225deg, #0a0a0a 270deg, #252525 315deg, #0a0a0a 360deg)'), backgroundBlendMode: isCoral ? undefined : shadingStyle?.backgroundBlendMode }}
        onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp}>
        {hasPronouncedGrip && (
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 50% 18%, rgba(255,255,255,0.055), transparent 34%), radial-gradient(circle at 50% 82%, rgba(0,0,0,0.22), transparent 58%)'
            }}
          />
        )}
        {shadingStyle?.edgeTexture && !isCoral && !hasPronouncedGrip && (
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: shadingStyle.edgeTexture,
              opacity: shadingStyle.edgeOpacity ?? 0.35,
              WebkitMask: shadingStyle.edgeMask,
              mask: shadingStyle.edgeMask,
              mixBlendMode: shadingStyle.edgeBlendMode || 'screen'
            }}
          />
        )}
        {shadingStyle?.faceOverlay && !isCoral && (
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: shadingStyle.faceOverlay,
              opacity: shadingStyle.faceOverlayOpacity ?? 1,
              mixBlendMode: shadingStyle.faceOverlayBlendMode || 'normal'
            }}
          />
        )}
        <div className={`absolute inset-0 ${ (isDragging || forceSnappy) ? 'transition-transform duration-[45ms] ease-out' : 'transition-transform duration-300'}`} style={{ transform: `rotate(${rotation}deg)` }}>
          {hasPronouncedGrip && (
            <>
              <div
                className="absolute inset-[-1px] rounded-full pointer-events-none"
                style={{
                  background: 'repeating-conic-gradient(from 0deg, rgba(255,255,255,0.18) 0deg 0.65deg, rgba(0,0,0,0.72) 0.65deg 2deg, rgba(255,255,255,0.07) 2deg 3.9deg)',
                  opacity: shadingStyle?.ridgeOpacity ?? 0.62,
                  WebkitMask: 'radial-gradient(circle, transparent 0 88%, #000 91% 100%)',
                  mask: 'radial-gradient(circle, transparent 0 88%, #000 91% 100%)',
                  mixBlendMode: 'normal'
                }}
              />
              {Array.from({ length: ridgeCount }).map((_, i) => {
                const angle = i * (360 / ridgeCount);
                const isLit = i % 6 === 0;
                return (
                  <span
                    key={`ridge-${i}`}
                    className="absolute left-1/2 top-1/2 pointer-events-none"
                    style={{
                      width: ridgeWidth,
                      height: ridgeHeight,
                      transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${ridgeRadius}px)`,
                      transformOrigin: '50% 100%',
                      borderRadius: '1px 1px 0 0',
                      clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
                      background: isLit
                        ? 'linear-gradient(90deg, rgba(0,0,0,0.7), rgba(255,255,255,0.18) 48%, rgba(0,0,0,0.78))'
                        : 'linear-gradient(90deg, rgba(0,0,0,0.82), rgba(255,255,255,0.07) 50%, rgba(0,0,0,0.86))',
                      boxShadow: '0 0 1px rgba(0,0,0,0.62)',
                      opacity: shadingStyle?.ridgeOpacity ?? 0.7
                    }}
                  />
                );
              })}
              <div className="absolute inset-0 rounded-full pointer-events-none" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.045), inset 0 0 0 3px rgba(0,0,0,0.28)' }} />
            </>
          )}
          <div
            className="absolute top-[10%] left-1/2 -translate-x-1/2 rounded-full transition-all duration-300"
            style={{
              width: size * 0.06,
              height: size * 0.25,
              background: indicatorActive
                ? isCoral ? '#fff' : (shadingStyle?.indicator?.background || 'linear-gradient(to bottom, #d4af37, #8a6a1c)')
                : 'linear-gradient(to bottom, #57534c, #272522)',
              boxShadow: indicatorActive
                ? isCoral ? '0 1px 2px rgba(0,0,0,0.5)' : (shadingStyle?.indicator?.boxShadow || '0 0 8px rgba(212,175,55,0.44), 0 2px 4px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.8)')
                : '0 1px 2px rgba(0,0,0,0.55), inset 0 1px 1px rgba(255,255,255,0.08)',
              opacity: indicatorActive ? 1 : 0.55
            }}
          />
        </div>
      </div>
      <div
        className={`mt-4 ${labelSizeClass} font-black ${labelTrackingClass} uppercase relative ${labelColorOverride || (isCoral ? 'text-[#fff]' : 'text-[#726c5e]')}`}
        style={{
          transform: labelOffsetY ? `translateY(${labelOffsetY}px)` : undefined,
          textShadow: labelTextShadow
        }}
      >
        {displayLabel ? (
          <>
            <span className="invisible">{label}</span>
            <span className="absolute inset-0 flex items-center justify-center">{displayLabel}</span>
          </>
        ) : label}
        <div
          className={`absolute top-full left-1/2 mt-1 pointer-events-none ${steadyReadout ? '' : 'transition-opacity duration-300'} ${isDragging ? 'opacity-100' : 'opacity-0'} z-50`}
          style={{
            transform: `translate3d(-50%, ${readoutOffsetY}px, 0)`,
            backfaceVisibility: 'hidden',
            contain: 'layout paint',
            willChange: 'opacity',
            textShadow: 'none'
          }}
        >
          {renderReadout(readoutStyle.type, formattedVal)}
        </div>
      </div>
    </div>
  );
};

const IO_LINK_STYLE_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'fiber', label: 'Fiber Optic Bridge' },
  { value: 'fiberCoral', label: 'Fiber Optic Bridge Coral' },
  { value: 'fiberCoralGreyRing', label: 'Fiber Optic Coral Grey Ring' },
  { value: 'fiberCoralCenter', label: 'Fiber Optic Coral Center' },
  { value: 'magnetic', label: 'Magnetic Clasp' },
  { value: 'chain', label: 'The Chain Link' },
  { value: 'nixie', label: 'Nixie Filament' },
  { value: 'toggle', label: 'Micro Toggle' },
  { value: 'toggleCopper', label: 'Micro Toggle Copper' },
  { value: 'togglePowerCopper', label: 'Micro Toggle Power Copper' },
  { value: 'pulse', label: 'Node Pulse' },
  { value: 'pulseCoral', label: 'Node Pulse Coral' }
];

const MetalGradient = ({ className = '' }) => (
  <span className={`bg-gradient-to-b from-[#444] via-[#222] to-[#111] ${className}`} />
);

const IO_LINK_CORAL = '#d85f50';
const IO_LINK_CORAL_LIGHT = '#f0aa99';

const FiberOpticLink = ({ active, onToggle, accent = '#df6f5a', accentLight = '#ff9c8a' }) => (
  <button onClick={onToggle} className="relative flex h-10 w-16 items-center justify-center outline-none group" aria-pressed={active} aria-label="Toggle I/O link">
    <span className="relative h-[3px] w-full overflow-hidden rounded-full border-b border-[#333] bg-[#111] shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]">
      <span
        className={`absolute inset-0 origin-left transition-all duration-500 ${active ? 'scale-x-100' : 'scale-x-0'}`}
        style={{
          backgroundColor: accent,
          boxShadow: active ? `0 0 10px ${accent}` : undefined
        }}
      />
    </span>
    <span
      className={`absolute h-3 w-3 rounded-full border-[1.5px] transition-all duration-300 ${active ? '' : 'border-[#444] bg-[#1a1a1a] shadow-[0_2px_4px_rgba(0,0,0,0.5)] group-hover:border-[#666]'}`}
      style={active ? { backgroundColor: accent, borderColor: accentLight, boxShadow: `0 0 10px ${accent}` } : undefined}
    />
  </button>
);

const FiberOpticCoralLink = (props) => (
  <FiberOpticLink {...props} accent={IO_LINK_CORAL} accentLight={IO_LINK_CORAL_LIGHT} />
);

const FiberOpticCoralGreyRingLink = ({ active, onToggle }) => (
  <button onClick={onToggle} className="relative flex h-10 w-16 items-center justify-center outline-none group" aria-pressed={active} aria-label="Toggle I/O link">
    <span className="relative h-[3px] w-full overflow-hidden rounded-full border-b border-[#333] bg-[#111] shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]">
      <span
        className={`absolute left-1/2 top-0 h-full -translate-x-1/2 transition-all duration-500 ease-out ${active ? 'w-full opacity-100' : 'w-0 opacity-0'}`}
        style={{ backgroundColor: IO_LINK_CORAL, boxShadow: active ? `0 0 9px ${IO_LINK_CORAL}` : undefined }}
      />
    </span>
    <span
      className={`absolute flex h-3 w-3 items-center justify-center rounded-full border-[1.5px] transition-all duration-300 ${active ? 'border-[#444] bg-[#1a1a1a]' : 'border-[#444] bg-[#1a1a1a] shadow-[0_2px_4px_rgba(0,0,0,0.5)] group-hover:border-[#666]'}`}
      style={active ? { boxShadow: `0 0 9px ${IO_LINK_CORAL}` } : undefined}
    >
      <span
        className={`h-[9px] w-[9px] rounded-full transition-all duration-300 ${active ? '' : 'bg-transparent'}`}
        style={active ? { backgroundColor: IO_LINK_CORAL, boxShadow: `0 0 7px ${IO_LINK_CORAL}` } : undefined}
      />
    </span>
  </button>
);

const FiberOpticCoralCenterLink = ({ active, onToggle }) => (
  <button onClick={onToggle} className="relative flex h-10 w-16 items-center justify-center outline-none group" aria-pressed={active} aria-label="Toggle I/O link">
    <span className="relative h-[3px] w-full overflow-hidden rounded-full border-b border-[#333] bg-[#111] shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]">
      <span
        className={`absolute left-1/2 top-0 h-full -translate-x-1/2 transition-all duration-500 ease-out ${active ? 'w-full opacity-100' : 'w-0 opacity-0'}`}
        style={{ backgroundColor: IO_LINK_CORAL, boxShadow: active ? `0 0 9px ${IO_LINK_CORAL}` : undefined }}
      />
    </span>
    <span
      className={`absolute h-3 w-3 rounded-full border-[1.5px] transition-all duration-300 ${active ? '' : 'border-[#444] bg-[#1a1a1a] shadow-[0_2px_4px_rgba(0,0,0,0.5)] group-hover:border-[#666]'}`}
      style={active ? { backgroundColor: IO_LINK_CORAL, borderColor: IO_LINK_CORAL_LIGHT, boxShadow: `0 0 9px ${IO_LINK_CORAL}` } : undefined}
    />
  </button>
);

const MagneticClaspLink = ({ active, onToggle }) => (
  <button onClick={onToggle} className="relative flex h-10 w-16 items-center justify-center outline-none" aria-pressed={active} aria-label="Toggle I/O link">
    <span className="relative flex h-1 w-full items-center rounded-full bg-[#111] shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]">
      <span className={`absolute flex h-4 w-4 items-center justify-end rounded-sm border border-[#555] bg-gradient-to-b from-[#444] via-[#222] to-[#111] pr-0.5 shadow-[0_2px_5px_rgba(0,0,0,0.8)] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${active ? 'left-[16px]' : 'left-0'}`}>
        <span className={`h-2 w-[2px] rounded-full transition-colors duration-300 ${active ? 'bg-[#df6f5a] shadow-[0_0_4px_#df6f5a]' : 'bg-[#111]'}`} />
      </span>
      <span className={`absolute flex h-4 w-4 items-center justify-start rounded-sm border border-[#555] bg-gradient-to-b from-[#444] via-[#222] to-[#111] pl-0.5 shadow-[0_2px_5px_rgba(0,0,0,0.8)] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${active ? 'right-[16px]' : 'right-0'}`}>
        <span className={`h-2 w-[2px] rounded-full transition-colors duration-300 ${active ? 'bg-[#df6f5a] shadow-[0_0_4px_#df6f5a]' : 'bg-[#111]'}`} />
      </span>
    </span>
  </button>
);

const ChainLinkControl = ({ active, onToggle }) => (
  <button onClick={onToggle} className="relative flex h-10 w-16 items-center justify-center outline-none" aria-pressed={active} aria-label="Toggle I/O link">
    <span className="absolute inset-0 flex items-center justify-center">
      <span className={`h-4 w-5 rounded-l-full border-[2px] border-r-0 border-[#888] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${active ? 'translate-x-[2px] border-[#df6f5a] drop-shadow-[0_0_3px_rgba(223,111,90,0.5)]' : '-translate-x-[4px]'}`} />
      <span className={`h-4 w-5 rounded-r-full border-[2px] border-l-0 border-[#888] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${active ? '-translate-x-[2px] border-[#df6f5a] drop-shadow-[0_0_3px_rgba(223,111,90,0.5)]' : 'translate-x-[4px]'}`} />
    </span>
  </button>
);

const NixieBridgeLink = ({ active, onToggle }) => (
  <button onClick={onToggle} className="group relative flex h-6 w-16 items-center overflow-hidden rounded-md border border-[#222] bg-[#050505] shadow-[inset_0_2px_10px_rgba(0,0,0,1)] outline-none" aria-pressed={active} aria-label="Toggle I/O link">
    <span className="pointer-events-none absolute inset-0 rounded-md bg-gradient-to-b from-[#ffffff10] to-transparent" />
    <MetalGradient className="absolute left-0 h-full w-1.5" />
    <MetalGradient className="absolute right-0 h-full w-1.5" />
    <span className="flex w-full justify-center">
      <svg width="40" height="10" viewBox="0 0 40 10" className="overflow-visible">
        <path d="M 0 5 Q 10 0, 20 5 T 40 5" fill="none" stroke={active ? "#ff5500" : "#222"} strokeWidth="1.5" className={`transition-colors duration-300 ${active ? 'anim-nixie' : ''}`} />
      </svg>
    </span>
  </button>
);

const MicroToggleLink = ({ active, onToggle, handleClassName = 'bg-gradient-to-b from-[#625d57] via-[#34312e] to-[#1e1c1a]' }) => (
  <button onClick={onToggle} className="relative flex h-10 w-6 items-center justify-center rounded-sm border border-[#43403b] bg-[#262421] shadow-[inset_0_2px_4px_rgba(0,0,0,0.7),0_1px_1px_rgba(255,255,255,0.045)] outline-none" aria-pressed={active} aria-label="Toggle I/O link">
    <span className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#11100f] shadow-[inset_0_2px_4px_rgba(0,0,0,0.86)]" />
    <span className={`absolute h-5 w-2.5 rounded-full border border-[#1e1c1a] transition-all duration-200 ease-in-out ${handleClassName} ${active ? 'top-1 shadow-[0_4px_2px_rgba(0,0,0,0.44)]' : 'bottom-1 shadow-[0_-4px_2px_rgba(0,0,0,0.44)]'}`} />
    <span className={`absolute -right-3 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full transition-colors duration-200 ${active ? 'bg-[#df6f5a] shadow-[0_0_4px_rgba(223,111,90,0.8)]' : 'bg-[#3a3632]'}`} />
  </button>
);

const MicroToggleCopperLink = (props) => (
  <MicroToggleLink
    {...props}
    handleClassName="bg-gradient-to-b from-[#d58a5b] via-[#9b5234] to-[#4a2418] shadow-[inset_0_1px_1px_rgba(255,225,190,0.38),inset_0_-2px_3px_rgba(45,18,10,0.78)]"
  />
);

const MicroTogglePowerCopperLink = (props) => (
  <MicroToggleLink
    {...props}
    handleClassName="bg-gradient-to-b from-[#f0b080] via-[#d56b4e] to-[#873421] shadow-[inset_0_1px_2px_rgba(255,235,205,0.58),inset_0_-2px_3px_rgba(79,24,12,0.72),0_0_4px_rgba(230,106,83,0.18)]"
  />
);

const NodePulseLink = ({ active, onToggle, accent = '#df6f5a' }) => (
  <button onClick={onToggle} className="relative flex h-10 w-16 items-center justify-center outline-none" aria-pressed={active} aria-label="Toggle I/O link">
    <span
      className={`absolute h-0.5 transition-all duration-500 ease-out ${active ? 'w-full opacity-50' : 'w-0 opacity-0'}`}
      style={{ backgroundColor: accent, boxShadow: active ? `0 0 8px ${accent}` : undefined }}
    />
    <span
      className={`relative flex h-4 w-4 items-center justify-center rounded-full border-2 transition-all duration-300 ${active ? 'bg-[#1a1a1a]' : 'border-[#444] bg-[#2a2a2a] hover:border-[#666]'}`}
      style={active ? { borderColor: accent } : undefined}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${active ? '' : 'bg-transparent'}`}
        style={active ? { backgroundColor: accent, boxShadow: `0 0 5px ${accent}` } : undefined}
      />
    </span>
  </button>
);

const NodePulseCoralLink = (props) => (
  <NodePulseLink {...props} accent="#e66a53" />
);

const IO_LINK_COMPONENTS = {
  fiber: FiberOpticLink,
  fiberCoral: FiberOpticCoralLink,
  fiberCoralGreyRing: FiberOpticCoralGreyRingLink,
  fiberCoralCenter: FiberOpticCoralCenterLink,
  magnetic: MagneticClaspLink,
  chain: ChainLinkControl,
  nixie: NixieBridgeLink,
  toggle: MicroToggleLink,
  toggleCopper: MicroToggleCopperLink,
  togglePowerCopper: MicroTogglePowerCopperLink,
  pulse: NodePulseLink,
  pulseCoral: NodePulseCoralLink
};

const IOLinkButton = ({ styleKey, active, onToggle }) => {
  if (styleKey === 'none') {
    return <div className="h-10 w-16" aria-hidden="true" />;
  }
  const LinkComponent = IO_LINK_COMPONENTS[styleKey] || FiberOpticLink;
  return (
    <div className="flex h-10 w-16 items-center justify-center">
      <LinkComponent active={active} onToggle={onToggle} />
    </div>
  );
};

const MiniBottomKnob = ({ label, value, onChange, accent = '#d4af37', labelColor = '#d3ba8c', face = '#202020', readoutStyleIndex = 0 }) => {
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const startVal = useRef(0);
  const rotation = (value / 100 * 270) - 135;
  const handlePointerDown = (event) => {
    event.preventDefault();
    setIsDragging(true);
    startY.current = event.clientY;
    startVal.current = value;
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const handlePointerMove = (event) => {
    if (!isDragging) return;
    event.preventDefault();
    onChange(Math.max(0, Math.min(100, startVal.current + (startY.current - event.clientY) * 0.8)));
  };
  const handlePointerUp = (event) => {
    setIsDragging(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return (
    <div className="flex w-[78px] flex-col items-center gap-1.5 select-none">
      <button
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onDoubleClick={() => onChange(label.startsWith('Depth') ? 63 : 75)}
        className="relative h-11 w-11 rounded-full border border-black/60 active:scale-95 transition-transform"
        style={{
          background: `radial-gradient(circle at 34% 28%, rgba(255,255,255,0.2), transparent 28%), ${face}`,
          boxShadow: '8px 9px 13px rgba(0,0,0,0.42), inset 1px 1px 2px rgba(255,255,255,0.16), inset -2px -2px 5px rgba(0,0,0,0.72)'
        }}
      >
        <span className={`absolute inset-0 ${isDragging ? 'transition-transform duration-[45ms] ease-out' : 'transition-transform duration-300'}`} style={{ transform: `rotate(${rotation}deg)` }}>
          <span
            className="absolute left-1/2 top-[6px] h-[13px] w-[4px] -translate-x-1/2 rounded-full"
            style={{ background: accent, boxShadow: `0 0 8px ${accent}` }}
          />
        </span>
        <span className="absolute inset-[15px] rounded-full bg-black/35 shadow-inner" />
      </button>
      <span className="text-[9px] font-black uppercase leading-[8px] tracking-[0.18em] relative" style={{ color: labelColor }}>
        {label === 'Phase ◐' ? <>Phase <span className="ml-[2px] text-[10px] leading-none">◐</span></> : label === 'Depth ◍' ? <>Depth <span className="relative -top-[1px] ml-[2px] text-[12px] leading-none">◍</span></> : label}
        <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-1 pointer-events-none transition-opacity duration-300 ${isDragging ? 'opacity-100' : 'opacity-0'} z-50`}>
          {renderReadout((KNOB_READOUT_STYLES[readoutStyleIndex] || KNOB_READOUT_STYLES[0]).type, formatKnobValue(label, value))}
        </div>
      </span>
    </div>
  );
};

const BottomSectionEngine = ({ depth, setDepth, stereoPhase, setStereoPhase, styleIndex, lfoActive = true, readoutStyleIndex = 0, screwStyle = 5 }) => {
  const [floatingReadout, setFloatingReadout] = useState(null);
  const readoutType = (KNOB_READOUT_STYLES[readoutStyleIndex] || KNOB_READOUT_STYLES[0]).type;

  const HiddenRange = ({ value, onChange, onDragStart, onDragEnd }) => {
    return (
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={event => onChange(Number(event.target.value))}
        onPointerDown={() => onDragStart?.()}
        onPointerUp={() => onDragEnd?.()}
        onPointerCancel={() => onDragEnd?.()}
        onBlur={() => onDragEnd?.()}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        style={{ WebkitAppearance: 'none' }}
      />
    );
  };

  const DragSurface = ({ onChange, onDragStart, onDragMove, onDragEnd }) => {
    const surfaceRef = useRef(null);
    const updateFromPointer = (clientX, clientY, rect) => {
      if (!rect) return;
      const next = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)) * 100;
      onChange(next);
      onDragMove?.(next, clientX, clientY, rect);
    };
    return (
      <div
        ref={surfaceRef}
        className="absolute inset-0 cursor-pointer touch-none"
        onPointerDown={event => {
          event.preventDefault();
          onDragStart?.(event.clientX, event.clientY);
          const rect = surfaceRef.current?.getBoundingClientRect();
          updateFromPointer(event.clientX, event.clientY, rect);
          const handleMove = (moveEvent) => {
            moveEvent.preventDefault();
            updateFromPointer(moveEvent.clientX, moveEvent.clientY, rect);
          };
          const handleUp = () => {
            window.removeEventListener('pointermove', handleMove);
            window.removeEventListener('pointerup', handleUp);
            window.removeEventListener('pointercancel', handleUp);
            onDragEnd?.();
          };
          window.addEventListener('pointermove', handleMove);
          window.addEventListener('pointerup', handleUp);
          window.addEventListener('pointercancel', handleUp);
        }}
      />
    );
  };

  const ScrewDots = ({ color = '#090807' }) => (
    <>
      <span className="absolute left-3 top-3 h-2 w-2 rounded-full border border-white/10" style={{ backgroundColor: color, boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.9)' }} />
      <span className="absolute right-3 top-3 h-2 w-2 rounded-full border border-white/10" style={{ backgroundColor: color, boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.9)' }} />
    </>
  );

  const HardwareRail = ({
    label,
    value,
    onChange,
    accent = '#d4af37',
    labelColor = '#bcb29a',
    track = '#121212',
    fill = accent,
    width = 86,
    height = 9,
    thumb = 'round',
    ticks = false,
    slotShadow = 'inset 0 2px 4px rgba(0,0,0,0.82), 0 1px 0 rgba(255,255,255,0.08)'
  }) => {
    const [isDragging, setIsDragging] = useState(false);
    const pct = `${value}%`;
    return (
      <div className="flex min-w-[92px] flex-col items-center gap-2 select-none relative">
        <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-1 pointer-events-none transition-opacity duration-300 z-50 ${isDragging ? 'opacity-100' : 'opacity-0'}`}>
          {renderReadout((KNOB_READOUT_STYLES[readoutStyleIndex] || KNOB_READOUT_STYLES[0]).type, formatKnobValue(label, value))}
        </div>
        <div className="relative" style={{ width, height: 28 }}>
          {ticks && (
            <div className="absolute left-1 right-1 top-0 flex justify-between">
              {[0, 1, 2, 3, 4].map(i => <span key={i} className="h-1.5 w-px bg-white/18" />)}
            </div>
          )}
          <div
            className="absolute left-0 right-0 top-1/2 -translate-y-1/2 overflow-hidden rounded-full border border-black/60"
            style={{ height, background: track, boxShadow: slotShadow }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: pct,
                background: `linear-gradient(90deg, ${fill}, ${accent})`,
                boxShadow: `0 0 10px ${accent}55`
              }}
            />
          </div>
          <div
            className={`absolute top-1/2 -translate-y-1/2 ${thumb === 'tab' ? 'h-[20px] w-[12px] rounded-[4px]' : thumb === 'blade' ? 'h-[18px] w-[8px] rounded-sm' : 'h-[22px] w-[22px] rounded-full'} border border-black/60`}
            style={{
              left: pct,
              transform: 'translate(-50%, -50%)',
              background: thumb === 'blade'
                ? `linear-gradient(180deg, #f3df9d, ${accent} 48%, #8a6a1c)`
                : `radial-gradient(circle at 32% 26%, rgba(255,255,255,0.55), transparent 28%), linear-gradient(145deg, ${accent}, #8a6a1c)`,
              boxShadow: '3px 5px 8px rgba(0,0,0,0.46), inset 1px 1px 2px rgba(255,255,255,0.55), inset -1px -1px 2px rgba(0,0,0,0.38)'
            }}
          />
          <HiddenRange value={value} onChange={onChange} onDragStart={() => setIsDragging(true)} onDragEnd={() => setIsDragging(false)} />
        </div>
        <span className="text-[9px] font-black uppercase leading-[8px] tracking-[0.22em]" style={{ color: labelColor }}>
          {label === 'Phase ◐' ? <>Phase <span className="ml-[2px] text-[10px] leading-none">◐</span></> : label === 'Depth ◍' ? <>Depth <span className="relative -top-[1px] ml-[2px] text-[12px] leading-none">◍</span></> : label}
        </span>
      </div>
    );
  };

  const MeterSlider = ({ label, value, onChange, accent, labelColor, meterBg = '#17140f' }) => {
    const [isDragging, setIsDragging] = useState(false);
    return (
      <div className="flex min-w-[94px] flex-col items-center gap-1.5 select-none relative">
        <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-1 pointer-events-none transition-opacity duration-300 z-50 ${isDragging ? 'opacity-100' : 'opacity-0'}`}>
          {renderReadout((KNOB_READOUT_STYLES[readoutStyleIndex] || KNOB_READOUT_STYLES[0]).type, formatKnobValue(label, value))}
        </div>
        <div className="relative h-8 w-[92px] rounded-[8px] border border-black/60" style={{ background: meterBg, boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.75), 0 1px 0 rgba(255,255,255,0.08)' }}>
          <div className="absolute inset-x-2 top-2 flex justify-between">
            {[0, 1, 2, 3, 4, 5].map(i => <span key={i} className="h-2 w-px bg-[#d8c28a]/45" />)}
          </div>
          <div className="absolute bottom-2 left-2 right-2 h-[5px] overflow-hidden rounded-full bg-black/65">
            <div className="h-full rounded-full" style={{ width: `${value}%`, background: accent, boxShadow: `0 0 8px ${accent}` }} />
          </div>
          <DragSurface onChange={onChange} onDragStart={() => setIsDragging(true)} onDragEnd={() => setIsDragging(false)} />
        </div>
        <span className="text-[9px] font-black uppercase leading-[8px] tracking-[0.2em]" style={{ color: labelColor }}>
          {label === 'Phase ◐' ? <>Phase <span className="ml-[2px] text-[10px] leading-none">◐</span></> : label === 'Depth ◍' ? <>Depth <span className="relative -top-[1px] ml-[2px] text-[12px] leading-none">◍</span></> : label}
        </span>
      </div>
    );
  };

  const KnobPair = ({ shell, accentA = '#d4af37', accentB = '#e66a53', labelColor = '#d3ba8c', face = '#202020', className = '', children }) => (
    <div className={`absolute bottom-[10.5%] left-[50%] z-10 flex -translate-x-1/2 items-center gap-5 px-5 py-3 ${className}`} style={shell}>
      {children}
      <MiniBottomKnob label="Depth ◍" value={depth} onChange={setDepth} accent={accentA} face={face} labelColor={labelColor} readoutStyleIndex={readoutStyleIndex} />
      <MiniBottomKnob label="Phase ◐" value={stereoPhase} onChange={setStereoPhase} accent={accentB} face={face} labelColor={labelColor} readoutStyleIndex={readoutStyleIndex} />
    </div>
  );

  const IlluminatedRubberFader = ({ label, value, onChange, active = true }) => {
    const faderRef = useRef(null);
    const thumbLeft = `calc(8px + ${value} * (100% - 16px) / 100)`;
    const updateFloatingReadout = (nextValue = value) => {
      const rect = faderRef.current?.getBoundingClientRect();
      if (!rect) return;
      setFloatingReadout({
        left: rect.left + rect.width / 2,
        top: rect.bottom + 16,
        label,
        scale: rect.width / (faderRef.current?.offsetWidth || rect.width || 1)
      });
    };
    return (
    <div ref={faderRef} className="relative z-10 flex w-[88px] flex-col gap-1">
	      <div className="flex h-2 items-center pl-[8px] pr-0 text-[10px] font-black uppercase leading-[8px] tracking-[0.18em] text-[#aaa39a] drop-shadow-md relative">
          {label === 'Phase ◐' ? <>Phase <span className="ml-[2px] text-[11px] leading-none">◐</span></> : label === 'Depth ◍' ? <>Depth <span className="relative -top-[1px] ml-[2px] text-[13px] leading-none">◍</span></> : label}
        </div>
      <div className="relative h-8">
        <div className="absolute left-2 right-2 top-1/2 h-2 -translate-y-1/2 rounded-full border-b border-[#333] bg-[#141414] shadow-[inset_0_3px_5px_rgba(0,0,0,0.8)]" />
        <div
          className="absolute left-2 top-1/2 h-2 -translate-y-1/2 rounded-full bg-[#1a1714]/40"
          style={{ width: `calc(${value} * (100% - 16px) / 100)` }}
        />
        <div
          className="absolute top-1/2 h-7 w-5 -translate-x-1/2 -translate-y-1/2 rounded-md border border-black bg-[#262626] shadow-[0_4px_6px_rgba(0,0,0,0.8),inset_1px_1px_1px_rgba(255,255,255,0.09)] group"
          style={{ left: thumbLeft }}
        >
          <div
            className="absolute left-1/2 top-1/2 h-3 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300"
            style={{
              background: active ? '#df6f5a' : '#4a4642',
              boxShadow: active
                ? '0 0 6px rgba(223,111,90,0.9), inset 0 1px 1px rgba(255,255,255,0.3)'
                : 'inset 0 1px 1px rgba(255,255,255,0.06), 0 1px 2px rgba(0,0,0,0.7)',
              opacity: active ? 1 : 0.58
            }}
          />
        </div>
        <div className="absolute left-[1px] right-[1px] top-[-7px] bottom-[-7px]">
          <DragSurface
            onChange={onChange}
            onDragStart={() => {
              updateFloatingReadout(value);
            }}
            onDragMove={(nextValue) => updateFloatingReadout(nextValue)}
            onDragEnd={() => setFloatingReadout(null)}
          />
        </div>
      </div>
    </div>
  );
  };

  const FloatingReadoutPortal = () => (
    floatingReadout && typeof document !== 'undefined'
      ? createPortal(
        <div
          className="pointer-events-none fixed z-[9999] font-sans"
          style={{
            left: floatingReadout.left,
            top: floatingReadout.top,
            transform: `translateX(-50%) scale(${floatingReadout.scale || 1})`,
            transformOrigin: 'top center'
          }}
        >
          {renderReadout(
            readoutType,
            formatKnobValue(floatingReadout.label, floatingReadout.label.startsWith('Depth') ? depth : stereoPhase)
          )}
        </div>,
        document.body
      )
      : null
  );

  switch (styleIndex) {
    case 0:
      return (
        <>
          <FloatingReadoutPortal />
          <div className="absolute bottom-[12%] left-[50%] z-10 -translate-x-1/2 translate-y-[2px]">
            <div className="mb-1.5 translate-y-[-2px] text-center text-[10px] font-bold uppercase tracking-[0.32em] text-[#fff8eb]" style={{ textShadow: PANEL_TEXT_DEPTH_SHADOW }}>LFO INTENSITY</div>
            <div className="relative flex w-[248px] justify-center gap-4 overflow-visible rounded-full border border-[#181818] bg-[#212121] px-5 py-3 shadow-[0_8px_14px_rgba(0,0,0,0.232),0_2px_4px_rgba(0,0,0,0.192),inset_0_1px_2px_rgba(255,255,255,0.062),inset_0_-1px_2px_rgba(0,0,0,0.242)]">
              <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-80 scale-75">
                <ScrewHead styleIndex={screwStyle} size={12} />
              </div>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-80 scale-75">
                <ScrewHead styleIndex={screwStyle} size={12} />
              </div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-b from-[#ffffff08] to-transparent pointer-events-none" />
              <div className="absolute inset-0 rounded-full opacity-30 mix-blend-overlay pointer-events-none" style={{ backgroundImage: RUBBER_MATTE_NOISE }} />
              <IlluminatedRubberFader label="Depth ◍" value={depth} onChange={setDepth} active={lfoActive} />
              <IlluminatedRubberFader label="Phase ◐" value={stereoPhase} onChange={setStereoPhase} active={lfoActive} />
            </div>
          </div>
        </>
      );
    case 1:
      return (
        <div className="absolute bottom-[11.6%] left-[50%] z-10 flex -translate-x-1/2 gap-4 rounded-[1.1rem] border border-black/80 bg-[#181818] px-4 py-3 shadow-[10px_14px_20px_rgba(0,0,0,0.36),inset_0_0_0_1px_rgba(255,255,255,0.06)]">
          <ScrewDots />
          <HardwareRail label="Depth ◍" value={depth} onChange={setDepth} width={82} accent="#edd39a" labelColor="#cfc0a0" track="#060606" thumb="tab" ticks />
          <HardwareRail label="Phase ◐" value={stereoPhase} onChange={setStereoPhase} width={82} accent="#e66a53" labelColor="#cfc0a0" track="#060606" thumb="tab" ticks />
        </div>
      );
    case 2:
      return (
        <div className="absolute bottom-[11.8%] left-[50%] z-10 flex -translate-x-1/2 gap-5 rounded-[1.8rem] border border-white/15 bg-black/38 px-4 py-3 shadow-[9px_13px_21px_rgba(0,0,0,0.25),inset_0_1px_2px_rgba(255,255,255,0.16)] backdrop-blur-md">
          <HardwareRail label="Depth ◍" value={depth} onChange={setDepth} width={88} height={7} accent="#edd39a" labelColor="#f0dca8" track="rgba(0,0,0,0.62)" />
          <HardwareRail label="Phase ◐" value={stereoPhase} onChange={setStereoPhase} width={88} height={7} accent="#e66a53" labelColor="#f0dca8" track="rgba(0,0,0,0.62)" />
        </div>
      );
    case 3:
      return (
        <div className="absolute bottom-[12%] left-[50%] z-10 flex -translate-x-1/2 gap-5 rounded-[0.8rem] border border-[#050403] bg-[#211d18] px-4 py-3 shadow-[8px_12px_18px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,230,180,0.08)]">
          <HardwareRail label="Depth ◍" value={depth} onChange={setDepth} width={88} height={11} accent="#d4af37" fill="#6c5418" labelColor="#d3ba8c" track="#080705" thumb="blade" ticks />
          <HardwareRail label="Phase ◐" value={stereoPhase} onChange={setStereoPhase} width={88} height={11} accent="#d4af37" fill="#6c5418" labelColor="#d3ba8c" track="#080705" thumb="blade" ticks />
        </div>
      );
    case 4:
      return (
        <KnobPair
          className="rounded-[1.45rem] border border-black/80"
          shell={{
            background: 'linear-gradient(145deg, #171615, #25221d)',
            boxShadow: '10px 14px 20px rgba(0,0,0,0.36), inset 0 1px 2px rgba(255,255,255,0.08), inset 0 -2px 5px rgba(0,0,0,0.55)'
          }}
        />
      );
    case 5:
      return (
        <div className="absolute bottom-[11.8%] left-[50%] z-10 flex -translate-x-1/2 items-center gap-4 rounded-[0.85rem] border border-black/75 bg-[#201f1c] px-4 py-2.5 shadow-[9px_12px_18px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.1)]">
          <span className="h-11 w-[3px] rounded-full bg-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.4)]" />
          <MeterSlider label="Depth ◍" value={depth} onChange={setDepth} accent="#e7c44e" labelColor="#cfc3a9" />
          <MeterSlider label="Phase ◐" value={stereoPhase} onChange={setStereoPhase} accent="#e66a53" labelColor="#cfc3a9" />
        </div>
      );
    case 6:
      return (
        <KnobPair
          className="rounded-[1.2rem] border border-[#070403]"
          face="linear-gradient(145deg, #26150f, #120a07)"
          labelColor="#d8bc80"
          accentA="#d4af37"
          accentB="#d4af37"
          shell={{
            background: 'radial-gradient(circle at 25% 20%, rgba(255,185,90,0.08), transparent 36%), linear-gradient(145deg, #24140e, #150c09)',
            boxShadow: '10px 13px 20px rgba(0,0,0,0.36), inset 0 1px 2px rgba(255,210,150,0.1), inset 0 -2px 6px rgba(0,0,0,0.55)'
          }}
        >
          <ScrewDots color="#0c0705" />
        </KnobPair>
      );
    case 7:
      return (
        <div className="absolute bottom-[12%] left-[50%] z-10 flex -translate-x-1/2 gap-5 rounded-full border border-[#fff9ed]/80 bg-[#f2e4c8]/90 px-4 py-3 shadow-[7px_11px_17px_rgba(91,65,42,0.18),inset_1px_1px_2px_rgba(255,255,255,0.85),inset_0_-2px_5px_rgba(113,78,44,0.12)]">
          <HardwareRail label="Depth ◍" value={depth} onChange={setDepth} width={84} height={8} accent="#a88842" labelColor="#73583a" track="#d7c4a1" thumb="tab" />
          <HardwareRail label="Phase ◐" value={stereoPhase} onChange={setStereoPhase} width={84} height={8} accent="#a88842" labelColor="#73583a" track="#d7c4a1" thumb="tab" />
        </div>
      );
    case 8:
      return (
        <KnobPair
          className="rounded-[1.35rem] border border-[#fff7e8]/80"
          face="linear-gradient(145deg, #fff8e8, #d7c7a9)"
          labelColor="#7f6747"
          accentA="#b88935"
          accentB="#b88935"
          shell={{
            background: 'linear-gradient(145deg, rgba(255,250,238,0.94), rgba(226,211,184,0.88))',
            boxShadow: '8px 12px 18px rgba(89,65,42,0.18), inset 1px 1px 2px rgba(255,255,255,0.9), inset 0 -2px 5px rgba(120,84,48,0.16)'
          }}
        />
      );
    case 9:
      return (
        <div className="absolute bottom-[11.9%] left-[50%] z-10 flex -translate-x-1/2 gap-4 rounded-[0.9rem] border border-[#d8c09b]/75 bg-[#ead8b8]/86 px-4 py-3 shadow-[6px_10px_15px_rgba(90,63,39,0.16),inset_0_1px_1px_rgba(255,255,255,0.52)]" style={{ backgroundImage: 'repeating-linear-gradient(90deg, rgba(120,92,62,0.06) 0px, rgba(120,92,62,0.06) 1px, transparent 1px, transparent 7px)' }}>
          <HardwareRail label="Depth ◍" value={depth} onChange={setDepth} width={90} height={6} accent="#8a6a32" labelColor="#60492f" track="#d3bea0" thumb="blade" ticks />
          <HardwareRail label="Phase ◐" value={stereoPhase} onChange={setStereoPhase} width={90} height={6} accent="#8a6a32" labelColor="#60492f" track="#d3bea0" thumb="blade" ticks />
        </div>
      );
    case 10:
      return (
        <div className="absolute bottom-[11.8%] left-[50%] z-10 flex -translate-x-1/2 gap-2 rounded-[1.25rem] border border-white/75 bg-[#efe0c2]/86 p-2 shadow-[7px_11px_16px_rgba(75,53,35,0.16),inset_1px_1px_2px_rgba(255,255,255,0.72)]">
          <div className="rounded-[0.9rem] bg-white/28 px-2 py-2 shadow-[inset_0_1px_1px_rgba(255,255,255,0.45)]">
            <HardwareRail label="Depth ◍" value={depth} onChange={setDepth} width={74} height={8} accent="#b98d3a" labelColor="#755a3a" track="#d8c5a6" thumb="round" />
          </div>
          <div className="rounded-[0.9rem] bg-white/18 px-2 py-2 shadow-[inset_0_1px_1px_rgba(255,255,255,0.35)]">
            <HardwareRail label="Phase ◐" value={stereoPhase} onChange={setStereoPhase} width={74} height={8} accent="#b98d3a" labelColor="#755a3a" track="#d8c5a6" thumb="round" />
          </div>
        </div>
      );
    case 11:
      return (
        <div className="absolute bottom-[11.5%] left-[50%] z-10 flex -translate-x-1/2 gap-5 rounded-[1.55rem] border border-black/80 px-4 py-3 shadow-[0_0_0_1px_#2b170b,0_0_0_2px_#78502a,inset_0_1px_2px_rgba(0,0,0,0.6)]" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.06), rgba(0,0,0,0.12)), url("/textures/walnut.png")', backgroundSize: 'cover' }}>
          <HardwareRail label="Depth ◍" value={depth} onChange={setDepth} width={82} height={8} accent="#edd39a" labelColor="#ead2a3" track="#160d08" thumb="blade" ticks />
          <HardwareRail label="Phase ◐" value={stereoPhase} onChange={setStereoPhase} width={82} height={8} accent="#edd39a" labelColor="#ead2a3" track="#160d08" thumb="blade" ticks />
        </div>
      );
    case 12:
      return (
        <div className="absolute bottom-[12%] left-[50%] z-10 flex -translate-x-1/2 gap-5 rounded-[1.2rem] border border-[#1b2520]/80 px-4 py-3 shadow-[8px_12px_17px_rgba(0,0,0,0.22),inset_0_1px_2px_rgba(255,255,255,0.08)]" style={{ background: 'radial-gradient(circle at 18% 18%, rgba(122,166,120,0.24), transparent 32%), radial-gradient(circle at 84% 76%, rgba(230,106,83,0.18), transparent 34%), linear-gradient(135deg, #24312a, #171b18)' }}>
          <HardwareRail label="Depth ◍" value={depth} onChange={setDepth} width={86} height={7} accent="#9fc08c" labelColor="#c8d8b8" track="#101511" thumb="tab" ticks />
          <HardwareRail label="Phase ◐" value={stereoPhase} onChange={setStereoPhase} width={86} height={7} accent="#e66a53" labelColor="#c8d8b8" track="#101511" thumb="tab" ticks />
        </div>
      );
    default:
      return null;
  }
};

const GlassButton = ({ active, onClick, label, size = 45 }) => (
  <div className="flex flex-col items-center gap-2 z-10">
    <button onClick={onClick} className="relative rounded-full outline-none flex items-center justify-center group transition-transform active:scale-95" style={{ width: size, height: size, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', boxShadow: active ? '10px 10px 20px rgba(0,0,0,0.2), 0 0 15px rgba(212,175,55,0.4), inset 0 0 10px rgba(255,255,255,0.5)' : '10px 10px 20px rgba(0,0,0,0.15)' }}>
      <div className="rounded-full transition-all duration-300" style={{ width: size * 0.4, height: size * 0.4, backgroundColor: active ? '#d4af37' : 'rgba(0,0,0,0.3)', boxShadow: active ? '0 0 10px #d4af37' : 'inset 0 1px 3px rgba(0,0,0,0.5)' }} />
    </button>
    <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-[#5a5549]">{label}</span>
  </div>
);

const MiniToggle = ({ active, onClick, label }) => (
  <button onClick={onClick} className={`px-3 py-1.5 rounded-full text-[9px] font-bold tracking-widest uppercase transition-all ${active ? 'bg-[#d4af37] text-[#111] shadow-[0_0_8px_rgba(212,175,55,0.4)]' : 'bg-black/20 text-[#7a7465] border border-white/10'}`}>{label}</button>
);

const RetroCircleToggle = ({ active, onClick, label = 'LFO' }) => (
  <button
    onClick={onClick}
    className={`relative flex h-12 w-12 items-center justify-center rounded-full border-t border-l border-[#444] border-b border-r border-[#111] bg-[#2c2c2c] outline-none transition-all duration-150 ${active ? 'translate-y-[2px] shadow-[0_2px_4px_rgba(0,0,0,0.28),inset_0_4px_8px_rgba(0,0,0,0.78)]' : 'shadow-[0_5px_9px_rgba(0,0,0,0.42),0_2px_0_#111]'}`}
  >
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#222] shadow-[inset_0_0_9px_rgba(0,0,0,0.8)]">
      <span className={`text-[9px] font-bold tracking-widest transition-colors ${active ? 'text-[#df6f5a] drop-shadow-[0_0_3px_rgba(223,111,90,0.8)]' : 'text-[#666]'}`}>{label}</span>
    </div>
  </button>
);

const DropdownSelect = ({ options, value, onChange, width = 80 }) => (
  <select value={value} onChange={e => onChange(Number(e.target.value))} className="bg-black/30 text-[#edd39a] text-[9px] font-bold tracking-wider rounded-lg px-2 py-1.5 border border-white/10 outline-none backdrop-blur-md cursor-pointer" style={{ width }}>
    {options.map((opt, i) => <option key={i} value={i} className="bg-[#2d2c2b] text-[#edd39a]">{opt}</option>)}
  </select>
);

const OrbitalLfoControl = ({ active, setActive, sync, setSync, waveIndex, setWaveIndex, rateIndex, setRateIndex }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [dropdownAnchor, setDropdownAnchor] = useState(null);
  const [lfoSettleTick, setLfoSettleTick] = useState(0);
  const [syncGlowTick, setSyncGlowTick] = useState(0);
  const [waveSettleTick, setWaveSettleTick] = useState(0);
  const [rateSettleTick, setRateSettleTick] = useState(0);
  const dropdownRef = useRef(null);
  const waveButtonRef = useRef(null);
  const rateButtonRef = useRef(null);

  useEffect(() => {
    if (!active) setOpenDropdown(null);
  }, [active]);

  useEffect(() => {
    if (!openDropdown) return;
    const button = openDropdown === 'wave' ? waveButtonRef.current : rateButtonRef.current;
    const updateAnchor = () => {
      const rect = button?.getBoundingClientRect();
      if (!rect) return;
      setDropdownAnchor({
        left: rect.left + rect.width / 2,
        top: rect.bottom + rect.height * 0.1
      });
    };
    updateAnchor();
    window.addEventListener('resize', updateAnchor);
    window.addEventListener('scroll', updateAnchor, true);
    return () => {
      window.removeEventListener('resize', updateAnchor);
      window.removeEventListener('scroll', updateAnchor, true);
    };
  }, [openDropdown]);

  useEffect(() => {
    if (!openDropdown) return;
    const handlePointerDown = (event) => {
      const target = event.target;
      const activeButton = openDropdown === 'wave' ? waveButtonRef.current : rateButtonRef.current;
      if (dropdownRef.current?.contains(target) || activeButton?.contains(target)) return;
      setOpenDropdown(null);
    };
    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, [openDropdown]);

  const positions = {
    sync: { x: -54, y: 0 },
    wave: { x: 0, y: 54 },
    rate: { x: 45, y: 31 }
  };

  const stopControlDrag = (event) => event.stopPropagation();
  const toggleLfoActive = () => {
    setLfoSettleTick(tick => tick + 1);
    setActive(!active);
  };
  const toggleSync = () => {
    setSyncGlowTick(tick => tick + 1);
    setSync(!sync);
  };
  const toggleWaveDropdown = () => {
    setWaveSettleTick(tick => tick + 1);
    setOpenDropdown(openDropdown === 'wave' ? null : 'wave');
  };
  const toggleRateDropdown = () => {
    setRateSettleTick(tick => tick + 1);
    setOpenDropdown(openDropdown === 'rate' ? null : 'rate');
  };
  const wave = SHAPES[waveIndex] || SHAPES[0];
  const waveSymbol = SHAPE_BUTTON_SYMBOLS[waveIndex] || SHAPE_BUTTON_SYMBOLS[0];
  const waveSymbolStyle = SHAPE_BUTTON_SYMBOL_STYLES[waveIndex] || SHAPE_BUTTON_SYMBOL_STYLES[0];
  const rate = SYNC_DIVS[rateIndex] || SYNC_DIVS[0];
  const textActiveClass = active ? 'text-[#edcf88]' : 'text-[#666]';
  const rateActiveClass = active && sync ? 'text-[#e8d19e]' : 'text-[#666]';
  const satelliteButtonStyle = (pressed = false) => ({
    background: pressed ? '#5b332f' : '#151515',
    borderColor: pressed ? '#874842' : '#111',
    boxShadow: pressed
      ? '2px 3px 5px rgba(0,0,0,0.34), inset 1px 1px 1px rgba(255,255,255,0.05), inset -1px -1px 2px rgba(0,0,0,0.26)'
      : '2px 3px 5px rgba(0,0,0,0.42), 1px 2px 2px rgba(0,0,0,0.24), inset 1px 1px 1px rgba(255,255,255,0.06), inset -1px -1px 2px rgba(0,0,0,0.28)'
  });
  const satelliteFaceStyle = (pressed = false) => ({
    background: pressed ? '#ac534c' : '#262626',
    boxShadow: pressed
      ? 'inset 0 -1px 2px rgba(72,18,12,0.24)'
      : 'inset 1px 1px 1px rgba(255,255,255,0.12), inset -1px -2px 3px rgba(0,0,0,0.26)'
  });
  const renderSatelliteGlow = (lit, color = 'rgba(237,207,136,0.14)') => lit ? (
    <span
      className="pointer-events-none absolute -inset-[3px] rounded-full lfo-satellite-glow-on"
      style={{ '--lfo-satellite-glow': color }}
    />
  ) : null;
  const renderDropdownPortal = () => {
    if (!openDropdown || !dropdownAnchor) return null;
    const isRate = openDropdown === 'rate';
    const options = isRate ? SYNC_DIVS : SHAPES;
    const setValue = isRate ? setRateIndex : setWaveIndex;
    const selectedIndex = isRate ? rateIndex : waveIndex;
    return createPortal(
      <div
        ref={dropdownRef}
        onPointerDown={stopControlDrag}
        className={`lfo-scrollbar fixed z-[9999] flex origin-top -translate-x-1/2 flex-col rounded-[16px] border border-[#333] bg-[#1a1a1a] shadow-[0_10px_20px_rgba(0,0,0,0.6)] ${isRate ? 'max-h-[260px] w-[65px] overflow-y-auto overflow-x-hidden' : 'w-[70px] overflow-hidden'}`}
        style={{ left: dropdownAnchor.left, top: dropdownAnchor.top }}
      >
        {options.map((option, i) => {
          const selected = i === selectedIndex;
          return (
          <button
            key={option}
            onClick={() => {
              setValue(i);
              setOpenDropdown(null);
            }}
            className={`${isRate ? 'py-2' : 'px-3 py-2.5'} cursor-pointer text-center text-[10px] font-bold transition-colors hover:bg-[#aa5041] hover:text-[#111] ${selected ? 'text-[#edcf88]' : 'text-[#888]'}`}
          >
            {option}
          </button>
          );
        })}
      </div>,
      document.body
    );
  };

  return (
    <div className="relative z-10 flex h-[46px] w-[46px] items-center justify-center overflow-visible">
      {renderDropdownPortal()}
      <svg width="0" height="0" className="absolute pointer-events-none" aria-hidden="true" focusable="false">
        <defs>
          <filter id="lfoOrbitalGoo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div className="pointer-events-none absolute inset-[-100px] z-0 flex items-center justify-center" style={{ filter: 'url(#lfoOrbitalGoo)' }}>
        <div className="absolute h-[37px] w-[37px] rounded-full bg-[#1a1a1a]" style={{ transform: `translate(${positions.sync.x}px, ${positions.sync.y}px)` }} />
        <div className="absolute h-[37px] w-[37px] rounded-full bg-[#1a1a1a]" style={{ transform: `translate(${positions.wave.x}px, ${positions.wave.y}px)` }} />
        <div className="absolute h-[37px] w-[37px] rounded-full bg-[#1a1a1a]" style={{ transform: `translate(${positions.rate.x}px, ${positions.rate.y}px)` }} />
      </div>
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 h-[49px] w-[49px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1a1a1a]" />

      <button
        key={lfoSettleTick}
        onPointerDown={stopControlDrag}
        onClick={toggleLfoActive}
        className={`${lfoSettleTick > 0 ? 'lfo-button-settle' : ''} relative z-30 flex h-[46px] w-[46px] items-center justify-center rounded-full border-b border-r border-[#111] border-l border-t border-[#444] bg-[#2c2c2c] outline-none transition-[box-shadow,filter] duration-[760ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${active ? 'shadow-[2px_4px_8px_rgba(0,0,0,0.44),inset_0_-5px_10px_rgba(0,0,0,0.72)] brightness-[0.985]' : 'shadow-[3px_5px_9px_rgba(0,0,0,0.42),0_1px_0_#111,inset_1px_2px_2px_rgba(255,255,255,0.1),inset_-2px_-3px_5px_rgba(0,0,0,0.22)] brightness-100'}`}
      >
        <div className={`flex h-[31px] w-[31px] items-center justify-center rounded-full transition-[background-color,box-shadow,filter] duration-[760ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${active ? 'bg-[#131313] shadow-[inset_0_0_15px_rgba(0,0,0,0.9)] brightness-[0.96]' : 'bg-[#222] shadow-[inset_0_0_10px_rgba(0,0,0,0.8)] brightness-100'}`}>
          <span className={`text-[9px] font-bold tracking-widest transition-colors duration-[620ms] ease-out ${active ? 'text-[#df6f5a] lfo-main-glow-on' : 'text-[#666] lfo-main-glow-off'}`}>LFO</span>
        </div>
      </button>

      <div className={`absolute z-20 transition-opacity duration-300 ${active ? 'pointer-events-auto' : 'pointer-events-none'}`} style={{ transform: `translate(${positions.sync.x}px, ${positions.sync.y}px)` }}>
        <button
          disabled={!active}
          onPointerDown={stopControlDrag}
          onClick={toggleSync}
          className="relative flex h-[37px] w-[37px] items-center justify-center overflow-hidden rounded-full border outline-none transition-all duration-300 ease-out"
          style={satelliteButtonStyle(active && sync)}
        >
          <span
            className="pointer-events-none absolute inset-[0.5px] rounded-full"
            style={satelliteFaceStyle(active && sync)}
          />
          {renderSatelliteGlow(active && sync, 'rgba(168,77,69,0.22)')}
          {syncGlowTick > 0 && (
            <span
              key={`sync-ember-${syncGlowTick}`}
              className={`pointer-events-none absolute inset-[0.5px] rounded-full ${active && sync ? 'sync-button-ember-on' : 'sync-button-ember-off'}`}
            />
          )}
          <span className={`relative z-10 text-[9px] font-black tracking-wider transition-all duration-300 ease-out ${active && sync ? 'text-white drop-shadow-sm' : 'text-[#a4998e]'}`}>SYNC</span>
        </button>
      </div>

      <div className={`absolute z-20 transition-opacity duration-300 ${active ? 'pointer-events-auto' : 'pointer-events-none'}`} style={{ transform: `translate(${positions.wave.x}px, ${positions.wave.y}px)` }}>
        <div className="relative">
          <button
            disabled={!active}
            ref={waveButtonRef}
            onPointerDown={stopControlDrag}
            onClick={toggleWaveDropdown}
            className="relative flex h-[37px] w-[37px] items-center justify-center overflow-hidden rounded-full border outline-none transition-all duration-300"
            style={satelliteButtonStyle()}
          >
            <span
              key={`wave-face-${waveSettleTick}`}
              className={`${waveSettleTick > 0 ? 'option-button-settle' : ''} pointer-events-none absolute inset-[0.5px] rounded-full`}
              style={satelliteFaceStyle()}
            />
            {renderSatelliteGlow(active)}
            <span
              className={`absolute inset-0 z-10 flex items-center justify-center leading-none transition-colors duration-300 ${textActiveClass}`}
              style={waveSymbolStyle}
            >
              {waveSymbol}
            </span>
          </button>
        </div>
      </div>

      <div className={`absolute z-20 transition-opacity duration-300 ${active ? 'pointer-events-auto' : 'pointer-events-none'}`} style={{ transform: `translate(${positions.rate.x}px, ${positions.rate.y}px)` }}>
        <div className="relative">
          <button
            disabled={!active}
            ref={rateButtonRef}
            onPointerDown={stopControlDrag}
            onClick={toggleRateDropdown}
            className="relative flex h-[37px] w-[37px] items-center justify-center overflow-hidden rounded-full border outline-none transition-all duration-300"
            style={satelliteButtonStyle()}
        >
          <span
            key={`rate-face-${rateSettleTick}`}
            className={`${rateSettleTick > 0 ? 'option-button-settle' : ''} pointer-events-none absolute inset-[0.5px] rounded-full`}
            style={satelliteFaceStyle()}
          />
          {renderSatelliteGlow(active && sync)}
          <span className={`relative z-10 text-[9px] font-bold tracking-wide transition-colors duration-300 ${rateActiveClass}`}>{rate}</span>
        </button>
        </div>
      </div>
    </div>
  );
};

const CENTER_DIAL_SHADOWS = [
  { name: 'Original', shadow: '18px 18px 35px rgba(0,0,0,0.5), inset 2px 2px 5px rgba(255,255,255,0.1), inset -3px -3px 8px rgba(0,0,0,0.8)' },
  { name: 'Refined Grounded', shadow: '2px 2px 8px rgba(0,0,0,0.7), 18px 18px 40px rgba(0,0,0,0.4), inset 1px 1px 3px rgba(255,255,255,0.15), inset -4px -4px 10px rgba(0,0,0,0.9)' },
  { name: 'Balanced Distance', shadow: '1px 1px 5px rgba(0,0,0,0.4), 18px 18px 35px rgba(0,0,0,0.5), inset 2px 2px 4px rgba(255,255,255,0.15), inset -3px -3px 8px rgba(0,0,0,0.85)' },
  { name: 'Crisp Hover', shadow: '2px 2px 6px rgba(0,0,0,0.3), 20px 20px 30px rgba(0,0,0,0.45), inset 1px 1px 2px rgba(255,255,255,0.2), inset -2px -2px 6px rgba(0,0,0,0.9)' }
];

const CENTER_DIAL_SURFACES = [
  {
    name: 'Original Ribbed',
    backgroundColor: '#1f1e1d',
    backgroundImage: 'conic-gradient(from 0deg at 50% 50%, #111, #333, #111, #333, #111)'
  },
  {
    name: 'Soft Top Lift',
    backgroundColor: '#242322',
    backgroundImage: 'radial-gradient(circle at 50% 18%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.045) 18%, rgba(0,0,0,0) 36%), conic-gradient(from 0deg at 50% 50%, #202020, #353535, #141414, #303030, #202020)'
  },
  {
    name: 'Soft Top Lift - Medium',
    backgroundColor: '#222120',
    backgroundImage: 'radial-gradient(circle at 50% 18%, rgba(255,255,255,0.086) 0%, rgba(255,255,255,0.039) 18%, rgba(0,0,0,0) 36%), conic-gradient(from 0deg at 50% 50%, #1c1c1c, #30302f, #121212, #2b2b2a, #1c1c1c)'
  },
  {
    name: 'Soft Top Lift - Medium Dark',
    backgroundColor: '#20201f',
    backgroundImage: 'radial-gradient(circle at 50% 18%, rgba(255,255,255,0.080) 0%, rgba(255,255,255,0.036) 18%, rgba(0,0,0,0) 36%), conic-gradient(from 0deg at 50% 50%, #1a1a1a, #2d2d2c, #111, #292928, #1a1a1a)'
  },
  {
    name: 'Soft Top Lift - Dark',
    backgroundColor: '#1f1f1e',
    backgroundImage: 'radial-gradient(circle at 50% 18%, rgba(255,255,255,0.075) 0%, rgba(255,255,255,0.034) 18%, rgba(0,0,0,0) 36%), conic-gradient(from 0deg at 50% 50%, #191919, #2b2b2a, #101010, #262625, #191919)'
  },
  {
    name: 'Concentric Ribs',
    decoration: 'concentric-ribs',
    backgroundColor: '#111',
    backgroundImage: 'radial-gradient(circle at 50% 18%, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.025) 20%, transparent 38%), conic-gradient(from 0deg at 50% 50%, #101010, #252525, #090909, #202020, #101010)'
  },
  {
    name: 'Anodized Stealth',
    backgroundColor: '#181818',
    backgroundImage: `${RUBBER_MATTE_NOISE}, radial-gradient(circle at 50% 18%, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.018) 22%, transparent 42%), conic-gradient(from 0deg at 50% 50%, #151515, #2a2a2a, #0a0a0a, #282828, #151515)`,
    backgroundBlendMode: 'overlay, normal, normal'
  },
  {
    name: 'Obsidian Aperture',
    decoration: 'obsidian-aperture',
    hideGenericGrooves: true,
    size: 322,
    backgroundColor: '#11100f',
    backgroundImage: 'radial-gradient(circle at 50% 18%, rgba(255,255,255,0.11), rgba(255,255,255,0.026) 22%, transparent 42%), conic-gradient(from 20deg at 50% 50%, #070707, #242321, #0b0b0b, #1c1b1a, #070707)',
    boxShadow: '0 2px 7px rgba(0,0,0,0.62), 18px 21px 42px rgba(0,0,0,0.36), inset 0 2px 4px rgba(255,255,255,0.1), inset 0 -12px 24px rgba(0,0,0,0.62)',
    indicator: { width: 8, height: 25, top: '7%', background: '#f26b55', boxShadow: '0 0 13px rgba(242,107,85,0.72)' }
  },
  {
    name: 'Nocturne Brass Inlay',
    decoration: 'nocturne-brass',
    hideGenericGrooves: true,
    allowGrooveOverlay: true,
    size: 320,
    backgroundColor: '#171614',
    backgroundImage: 'radial-gradient(circle at 50% 17%, rgba(255,236,180,0.09), rgba(255,255,255,0.018) 24%, transparent 42%), conic-gradient(from 0deg at 50% 50%, #111, #2a2925, #12110f, #24231f, #111)',
    boxShadow: '1px 2px 8px rgba(0,0,0,0.64), 18px 20px 40px rgba(0,0,0,0.38), inset 0 1px 3px rgba(255,235,177,0.12), inset 0 -10px 24px rgba(0,0,0,0.78)',
    indicator: { width: 7, height: 24, top: '8%', background: '#e2bc56', boxShadow: '0 0 11px rgba(226,188,86,0.62)' }
  },
  {
    name: 'Nocturne Brass - Pale Outer Rim',
    decoration: 'nocturne-brass',
    outerRim: true,
    hideGenericGrooves: true,
    allowGrooveOverlay: true,
    size: 320,
    backgroundColor: '#171614',
    backgroundImage: 'radial-gradient(circle at 50% 17%, rgba(255,236,180,0.09), rgba(255,255,255,0.018) 24%, transparent 42%), conic-gradient(from 0deg at 50% 50%, #111, #2a2925, #12110f, #24231f, #111)',
    boxShadow: '1px 2px 8px rgba(0,0,0,0.64), 18px 20px 40px rgba(0,0,0,0.38), inset 0 1px 3px rgba(255,235,177,0.12), inset 0 -10px 24px rgba(0,0,0,0.78)',
    indicator: { width: 7, height: 24, top: '8%', background: '#e2bc56', boxShadow: '0 0 11px rgba(226,188,86,0.62)' }
  },
  {
    name: 'Nocturne Brass - Red Pointer Soft Rim',
    decoration: 'nocturne-brass',
    outerRim: true,
    reducedRimShadow: true,
    softNocturneRings: true,
    hideGenericGrooves: true,
    allowGrooveOverlay: true,
    size: 313,
    backgroundColor: '#171614',
    backgroundImage: 'radial-gradient(circle at 50% 17%, rgba(255,236,180,0.09), rgba(255,255,255,0.018) 24%, transparent 42%), conic-gradient(from 0deg at 50% 50%, #111, #2a2925, #12110f, #24231f, #111)',
    boxShadow: '9px 12px 22px rgba(0,0,0,0.14), inset 0 1px 3px rgba(255,235,177,0.1), inset 0 -8px 18px rgba(0,0,0,0.68)',
    indicator: { width: 8, height: 25, top: '7%', background: '#f26b55', boxShadow: '0 0 13px rgba(242,107,85,0.72)' }
  },
  {
    name: 'Nocturne Brass - Walnut Rim',
    decoration: 'nocturne-brass',
    outerRim: true,
    outerRimTexture: true,
    rimWidth: 14,
    rimBackgroundColor: '#3a2114',
    rimBackgroundImage: 'linear-gradient(rgba(0,0,0,0.05), rgba(0,0,0,0.12)), url("/textures/walnut.png")',
    rimBackgroundSize: 'cover',
    allowOuterShadow: true,
    reducedRimShadow: true,
    softNocturneRings: true,
    hideGenericGrooves: true,
    allowGrooveOverlay: true,
    size: 313,
    backgroundColor: '#171614',
    backgroundImage: 'radial-gradient(circle at 50% 17%, rgba(255,236,180,0.09), rgba(255,255,255,0.018) 24%, transparent 42%), conic-gradient(from 0deg at 50% 50%, #111, #2a2925, #12110f, #24231f, #111)',
    boxShadow: '8px 12px 20px rgba(0,0,0,0.16), inset 0 1px 3px rgba(255,235,177,0.08), inset 0 -8px 18px rgba(0,0,0,0.62)',
    indicator: { width: 8, height: 25, top: '7%', background: '#f26b55', boxShadow: '0 0 13px rgba(242,107,85,0.72)' }
  },
  {
    name: 'Nocturne Brass - Walnut Rim Inset',
    decoration: 'nocturne-brass',
    outerRim: true,
    outerRimTexture: true,
    ringOnlyShadow: true,
    rimWidth: 14,
    rimBackgroundColor: '#3a2114',
    rimBackgroundImage: 'linear-gradient(rgba(0,0,0,0.05), rgba(0,0,0,0.12)), url("/textures/walnut.png")',
    rimBackgroundSize: 'cover',
    reducedRimShadow: true,
    softNocturneRings: true,
    hideGenericGrooves: true,
    allowGrooveOverlay: true,
    size: 313,
    backgroundColor: '#171614',
    backgroundImage: 'radial-gradient(circle at 50% 17%, rgba(255,236,180,0.09), rgba(255,255,255,0.018) 24%, transparent 42%), conic-gradient(from 0deg at 50% 50%, #111, #2a2925, #12110f, #24231f, #111)',
    boxShadow: 'none',
    indicator: { width: 8, height: 25, top: '7%', background: '#f26b55', boxShadow: '0 0 13px rgba(242,107,85,0.72)' }
  },
  {
    name: 'Nocturne Brass - Walnut Rim Clean',
    decoration: 'nocturne-brass',
    outerRim: true,
    outerRimTexture: true,
    rimWidth: 14,
    rimBackgroundColor: '#3a2114',
    rimBackgroundImage: 'linear-gradient(rgba(0,0,0,0.05), rgba(0,0,0,0.12)), url("/textures/walnut.png")',
    rimBackgroundSize: 'cover',
    reducedRimShadow: true,
    softNocturneRings: true,
    hideGenericGrooves: true,
    allowGrooveOverlay: true,
    size: 313,
    backgroundColor: '#171614',
    backgroundImage: 'radial-gradient(circle at 50% 17%, rgba(255,236,180,0.09), rgba(255,255,255,0.018) 24%, transparent 42%), conic-gradient(from 0deg at 50% 50%, #111, #2a2925, #12110f, #24231f, #111)',
    boxShadow: 'none',
    indicator: { width: 8, height: 25, top: '7%', background: '#f26b55', boxShadow: '0 0 13px rgba(242,107,85,0.72)' }
  },
  {
    name: 'Nocturne Brass - Walnut Rim Deep Inset',
    decoration: 'nocturne-brass',
    outerRim: true,
    outerRimTexture: true,
    ringOnlyShadow: true,
    ringBottomShadow: true,
    ringSeatBevel: true,
    ringFlavorMatch: true,
    rimWidth: 28,
    rimBackgroundColor: '#3a2114',
    rimBackgroundImage: 'linear-gradient(rgba(0,0,0,0.05), rgba(0,0,0,0.12)), url("/textures/walnut.png")',
    rimBackgroundSize: 'cover',
    reducedRimShadow: true,
    softNocturneRings: true,
    hideGenericGrooves: true,
    allowGrooveOverlay: true,
    size: 313,
    backgroundColor: '#171614',
    backgroundImage: 'radial-gradient(circle at 50% 17%, rgba(255,236,180,0.09), rgba(255,255,255,0.018) 24%, transparent 42%), conic-gradient(from 0deg at 50% 50%, #111, #2a2925, #12110f, #24231f, #111)',
    boxShadow: 'none',
    indicator: { width: 8, height: 25, top: '7%', background: '#f26b55', boxShadow: '0 0 13px rgba(242,107,85,0.72)' }
  },
  {
    name: 'Nocturne Brass - Walnut Rim Deep Inset Arc Rings',
    decoration: 'nocturne-brass',
    outerRim: true,
    outerRimTexture: true,
    ringOnlyShadow: true,
    ringBottomShadow: true,
    ringSeatBevel: true,
    ringFlavorMatch: true,
    partialGuideRings: true,
    rimWidth: 28,
    rimBackgroundColor: '#3a2114',
    rimBackgroundImage: 'linear-gradient(rgba(0,0,0,0.05), rgba(0,0,0,0.12)), url("/textures/walnut.png")',
    rimBackgroundSize: 'cover',
    reducedRimShadow: true,
    softNocturneRings: true,
    hideGenericGrooves: true,
    allowGrooveOverlay: true,
    size: 313,
    backgroundColor: '#171614',
    backgroundImage: 'radial-gradient(circle at 50% 17%, rgba(255,236,180,0.09), rgba(255,255,255,0.018) 24%, transparent 42%), conic-gradient(from 0deg at 50% 50%, #111, #2a2925, #12110f, #24231f, #111)',
    boxShadow: 'none',
    indicator: { width: 8, height: 25, top: '7%', background: '#f26b55', boxShadow: '0 0 13px rgba(242,107,85,0.72)' }
  },
  {
    name: 'Nocturne Brass - Walnut Rim Deep Inset Soft Previous',
    decoration: 'nocturne-brass',
    outerRim: true,
    outerRimTexture: true,
    ringOnlyShadow: true,
    ringBottomShadow: true,
    ringSeatBevel: true,
    ringFlavorMatch: 'soft',
    rimWidth: 28,
    rimBackgroundColor: '#3a2114',
    rimBackgroundImage: 'linear-gradient(rgba(0,0,0,0.05), rgba(0,0,0,0.12)), url("/textures/walnut.png")',
    rimBackgroundSize: 'cover',
    reducedRimShadow: true,
    softNocturneRings: true,
    hideGenericGrooves: true,
    allowGrooveOverlay: true,
    size: 313,
    backgroundColor: '#171614',
    backgroundImage: 'radial-gradient(circle at 50% 17%, rgba(255,236,180,0.09), rgba(255,255,255,0.018) 24%, transparent 42%), conic-gradient(from 0deg at 50% 50%, #111, #2a2925, #12110f, #24231f, #111)',
    boxShadow: 'none',
    indicator: { width: 8, height: 25, top: '7%', background: '#f26b55', boxShadow: '0 0 13px rgba(242,107,85,0.72)' }
  },
  {
    name: 'Nocturne Brass - Coral Rim',
    decoration: 'nocturne-brass',
    outerRim: true,
    outerRimColor: 'rgba(220,110,89,0.9)',
    outerRimHighlight: 'rgba(255,184,160,0.18)',
    reducedRimShadow: true,
    softNocturneRings: true,
    hideGenericGrooves: true,
    allowGrooveOverlay: true,
    size: 313,
    backgroundColor: '#171614',
    backgroundImage: 'radial-gradient(circle at 50% 17%, rgba(255,236,180,0.09), rgba(255,255,255,0.018) 24%, transparent 42%), conic-gradient(from 0deg at 50% 50%, #111, #2a2925, #12110f, #24231f, #111)',
    boxShadow: '9px 12px 22px rgba(0,0,0,0.14), inset 0 1px 3px rgba(255,235,177,0.1), inset 0 -8px 18px rgba(0,0,0,0.68)',
    indicator: { width: 8, height: 25, top: '7%', background: '#f26b55', boxShadow: '0 0 13px rgba(242,107,85,0.72)' }
  },
  {
    name: 'Nocturne Brass - Amber Rim',
    decoration: 'nocturne-brass',
    outerRim: true,
    outerRimColor: 'rgba(215,163,122,0.92)',
    outerRimHighlight: 'rgba(255,214,176,0.18)',
    reducedRimShadow: true,
    softNocturneRings: true,
    hideGenericGrooves: true,
    allowGrooveOverlay: true,
    size: 313,
    backgroundColor: '#171614',
    backgroundImage: 'radial-gradient(circle at 50% 17%, rgba(255,236,180,0.09), rgba(255,255,255,0.018) 24%, transparent 42%), conic-gradient(from 0deg at 50% 50%, #111, #2a2925, #12110f, #24231f, #111)',
    boxShadow: '9px 12px 22px rgba(0,0,0,0.14), inset 0 1px 3px rgba(255,235,177,0.1), inset 0 -8px 18px rgba(0,0,0,0.68)',
    indicator: { width: 8, height: 25, top: '7%', background: '#f26b55', boxShadow: '0 0 13px rgba(242,107,85,0.72)' }
  },
  {
    name: 'Smoked Glass Halo',
    decoration: 'smoked-glass',
    hideGenericGrooves: true,
    size: 316,
    backgroundColor: '#181b1b',
    backgroundImage: 'radial-gradient(circle at 45% 15%, rgba(255,255,255,0.18), rgba(255,255,255,0.036) 22%, transparent 44%), radial-gradient(circle at 68% 74%, rgba(89,110,91,0.16), transparent 42%), conic-gradient(from 35deg at 50% 50%, #0f1010, #252828, #121414, #212424, #0f1010)',
    boxShadow: '0 2px 7px rgba(0,0,0,0.58), 16px 19px 38px rgba(0,0,0,0.34), inset 0 2px 5px rgba(255,255,255,0.13), inset 0 -12px 28px rgba(0,0,0,0.66)',
    indicator: { width: 6, height: 22, top: '7.5%', background: '#df6f5a', boxShadow: '0 0 12px rgba(223,111,90,0.68)' }
  },
  {
    name: 'Carbon Fiber Weave',
    decoration: 'carbon-weave',
    hideGenericGrooves: true,
    size: 318,
    backgroundColor: '#141414',
    backgroundImage: 'radial-gradient(circle at 50% 18%, rgba(255,255,255,0.07), transparent 36%), conic-gradient(from 0deg at 50% 50%, #0d0d0d, #252525, #101010, #202020, #0d0d0d)',
    boxShadow: '1px 2px 7px rgba(0,0,0,0.68), 18px 22px 42px rgba(0,0,0,0.38), inset 0 1px 2px rgba(255,255,255,0.08), inset 0 -10px 24px rgba(0,0,0,0.75)',
    indicator: { width: 7, height: 23, top: '8%', background: '#df6f5a', boxShadow: '0 0 10px rgba(223,111,90,0.62)' }
  },
  {
    name: 'Tape Reel Night',
    decoration: 'tape-reel',
    hideGenericGrooves: true,
    size: 322,
    backgroundColor: '#171513',
    backgroundImage: 'radial-gradient(circle at 50% 18%, rgba(255,255,255,0.08), rgba(255,255,255,0.02) 24%, transparent 42%), conic-gradient(from 18deg at 50% 50%, #0d0c0b, #27231d, #11100e, #211e19, #0d0c0b)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.68), 18px 22px 42px rgba(0,0,0,0.38), inset 0 1px 3px rgba(255,230,170,0.1), inset 0 -12px 28px rgba(0,0,0,0.76)',
    indicator: { width: 8, height: 24, top: '8%', background: '#f06b55', boxShadow: '0 0 13px rgba(240,107,85,0.7)' }
  },
  {
    name: 'Warm Bakelite Halo',
    decoration: 'bakelite-halo',
    hideGenericGrooves: true,
    size: 318,
    backgroundColor: '#18120e',
    backgroundImage: 'radial-gradient(circle at 45% 18%, rgba(255,205,140,0.12), rgba(255,255,255,0.02) 25%, transparent 43%), conic-gradient(from 0deg at 50% 50%, #0f0c09, #2d2118, #120d0a, #261b14, #0f0c09)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.64), 18px 22px 42px rgba(0,0,0,0.36), inset 0 2px 4px rgba(255,210,150,0.12), inset 0 -12px 28px rgba(0,0,0,0.72)',
    indicator: { width: 8, height: 25, top: '8%', background: '#d4af37', boxShadow: '0 0 12px rgba(212,175,55,0.62)' }
  },
  {
    name: 'Patina Etched Night',
    decoration: 'patina-night',
    hideGenericGrooves: true,
    size: 320,
    backgroundColor: '#151a17',
    backgroundImage: `${RUBBER_MATTE_NOISE}, radial-gradient(circle at 50% 18%, rgba(214,238,200,0.08), transparent 38%), radial-gradient(circle at 27% 78%, rgba(122,166,120,0.11), transparent 35%), conic-gradient(from 0deg at 50% 50%, #0f1310, #22261f, #0d100e, #1d211c, #0f1310)`,
    backgroundBlendMode: 'overlay, normal, normal, normal',
    boxShadow: '0 2px 8px rgba(0,0,0,0.66), 18px 22px 42px rgba(0,0,0,0.37), inset 0 1px 3px rgba(214,238,200,0.1), inset 0 -12px 28px rgba(0,0,0,0.78)',
    indicator: { width: 7, height: 24, top: '8%', background: '#8ead76', boxShadow: '0 0 12px rgba(142,173,118,0.66)' }
  },
  {
    name: 'Broadcast Radar',
    decoration: 'broadcast-radar',
    hideGenericGrooves: true,
    size: 320,
    animated: true,
    backgroundColor: '#121414',
    backgroundImage: 'radial-gradient(circle at 50% 18%, rgba(255,255,255,0.075), transparent 38%), conic-gradient(from 0deg at 50% 50%, #0d0f0f, #222524, #0c0d0d, #1d2020, #0d0f0f)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.66), 18px 22px 42px rgba(0,0,0,0.37), inset 0 1px 3px rgba(180,210,190,0.09), inset 0 -12px 28px rgba(0,0,0,0.76)',
    indicator: { width: 7, height: 24, top: '8%', background: '#df6f5a', boxShadow: '0 0 12px rgba(223,111,90,0.66)' }
  }
];

const CENTER_DIAL_GROOVES = [
  { name: 'None', backgroundImage: 'none', opacity: 0 },
  { name: 'Fine Ribs', backgroundImage: 'repeating-radial-gradient(circle at 50% 50%, transparent, transparent 2px, rgba(0,0,0,0.4) 3px, rgba(0,0,0,0.4) 4px)', opacity: 1 },
  { name: 'Soft Fine Ribs', backgroundImage: 'repeating-radial-gradient(circle at 50% 50%, transparent, transparent 2px, rgba(0,0,0,0.25) 3px, rgba(0,0,0,0.25) 4px)', opacity: 1 },
  { name: 'Wide Grooves', backgroundImage: 'repeating-radial-gradient(circle at 50% 50%, transparent, transparent 4px, rgba(0,0,0,0.36) 5px, rgba(0,0,0,0.36) 7px)', opacity: 1 },
  { name: 'Thick Sparse Grooves', backgroundImage: 'repeating-radial-gradient(circle at 50% 50%, transparent, transparent 9px, rgba(0,0,0,0.42) 10px, rgba(0,0,0,0.42) 13px)', opacity: 1 },
  { name: 'Stepped Concentric', backgroundImage: 'radial-gradient(circle at 50% 50%, transparent 0 30%, rgba(58,58,58,0.55) 30.4%, rgba(10,10,10,0.42) 31%, transparent 31.8%, transparent 39%, rgba(51,51,51,0.5) 39.4%, rgba(9,9,9,0.44) 40.1%, transparent 41%, transparent 48%, rgba(37,37,37,0.52) 48.4%, rgba(8,8,8,0.46) 49.2%, transparent 50%, transparent 58%, rgba(34,34,34,0.48) 58.4%, rgba(6,6,6,0.44) 59.2%, transparent 60%)', opacity: 1 }
];

const CENTER_DIAL_MARK_STYLES = [
  { name: 'None' },
  { name: 'Classic Rings' },
  { name: 'Fine Brass Index' },
  { name: 'Ivory Micro Ticks' },
  { name: 'Studio Double Ring' },
  { name: 'Quiet Tick Ring' },
  { name: 'Amber Calibration' },
  { name: 'Twin Hairlines' },
  { name: 'Minimal Dots' },
  { name: 'Inner Compass' },
  { name: 'Gold Hairline' }
];

const CENTER_DIAL_NUMBER_STYLES = [
  { name: 'None' },
  { name: 'Classic 0-10' },
  { name: 'Bold Mono' },
  { name: 'Ivory Serif' },
  { name: 'Small Caps' },
  { name: 'Amber Micro' },
  { name: 'Studio Decimal' },
  { name: 'Wide Brass' },
  { name: 'Inner Gold' },
  { name: 'Soft Cream' },
  { name: 'Compact Label' }
];

const MIDDLE_KNOB_STYLES = [
  { name: 'Original Copper' },
  {
    name: 'Original Copper 9px Ring',
    useOriginalBackground: true,
    originalCenterOverlay: true,
    originalCenterOverlayOpacity: 1,
    originalCenterOverlayInset: 9,
    sheenOpacity: 0.34
  },
  {
    name: 'Original Copper 10px Ring Test',
    originalInset: '8.5px'
  },
  {
    name: 'Original Copper Thick Outer Ring',
    background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.1) 20%, rgba(0,0,0,0.4) 80%, rgba(0,0,0,0.8) 100%), conic-gradient(from 180deg at 50% 50%, #a88842 0deg, #edd39a 45deg, #a88842 90deg, #edd39a 135deg, #a88842 180deg, #edd39a 225deg, #a88842 270deg, #edd39a 315deg, #a88842 360deg)',
    shadow: '15px 15px 30px rgba(0,0,0,0.5), inset 2px 2px 5px rgba(255,255,255,0.9), inset -4px -4px 8px rgba(0,0,0,0.6)',
    centerDiscInset: 8,
    centerDiscBackground: 'radial-gradient(circle at 34% 30%, rgba(255,255,255,0.34), transparent 30%), conic-gradient(from 180deg at 50% 50%, #9f8b5b 0deg, #cfbd8b 45deg, #a28d5e 90deg, #d7c695 135deg, #9f8b5b 180deg, #cab884 225deg, #988455 270deg, #d4c28f 315deg, #9f8b5b 360deg)',
    centerDiscShadow: 'inset 1px 1px 2px rgba(255,255,255,0.16), inset -1px -2px 3px rgba(0,0,0,0.18)',
    originalCenterOverlay: true,
    originalCenterOverlayOpacity: 1,
    originalCenterOverlayInset: 8,
    sheenOpacity: 0.34
  },
  {
    name: 'Original Copper Soft',
    shadow: '14px 16px 30px rgba(0,0,0,0.48), inset 2px 2px 6px rgba(255,255,255,0.6), inset -5px -7px 13px rgba(0,0,0,0.5), 0 0 0 1.2px rgba(33,24,11,0.4)',
    edgeInset: 5,
    edgeBorder: '1px solid rgba(255,255,255,0.15)',
    edgeShadow: 'inset 0 2px 4px rgba(255,255,255,0.15), inset 0 -5px 9px rgba(0,0,0,0.25)',
  },
  {
    name: 'Original Graphite Grip Copper Ring Coral Pointer',
    background: 'radial-gradient(circle at 31% 29%, rgba(255,255,255,0.13), transparent 28%), radial-gradient(circle at 50% 50%, transparent 0 58%, rgba(255,255,255,0.08) 62%, rgba(0,0,0,0.34) 82%, transparent 88%), radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.8) 100%), conic-gradient(from 180deg at 50% 50%, #0a0a0a 0deg, #252525 45deg, #0a0a0a 90deg, #252525 135deg, #0a0a0a 180deg, #252525 225deg, #0a0a0a 270deg, #252525 315deg, #0a0a0a 360deg)',
    shadow: '6px 12px 20px rgba(0,0,0,0.45), 3px 4px 6px rgba(0,0,0,0.35), inset 1px 1px 3px rgba(255,255,255,0.16), inset -3px -4px 8px rgba(0,0,0,0.86)',
    edgeInset: 8,
    edgeBorder: '1px solid rgba(203,132,72,0.32)',
    edgeShadow: 'inset 0 2px 4px rgba(255,197,146,0.13), inset 0 -5px 10px rgba(62,27,14,0.52), 0 0 0 1px rgba(0,0,0,0.46)',
    edgeTexture: 'repeating-conic-gradient(from 0deg, rgba(234,154,92,0.58) 0deg 0.75deg, rgba(72,35,19,0.44) 0.75deg 2.5deg)',
    edgeMask: 'radial-gradient(circle, transparent 0 67%, #000 69% 100%)',
    edgeOpacity: 0.5,
    edgeBlendMode: 'normal',
    innerInset: 17,
    innerOpacity: 0.2,
    sheenOpacity: 0.22,
    pointerStyle: {
      background: 'linear-gradient(to bottom, #e9725d, #b84c39)',
      boxShadow: '0 0 5px rgba(255,107,74,0.18), 0 2px 4px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,196,181,0.36)'
    }
  },
  {
    name: 'Original Graphite Grip Walnut Ring Coral Pointer',
    background: 'radial-gradient(circle at 31% 29%, rgba(255,255,255,0.13), transparent 28%), radial-gradient(circle at 50% 50%, transparent 0 58%, rgba(255,255,255,0.08) 62%, rgba(0,0,0,0.34) 82%, transparent 88%), radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.8) 100%), conic-gradient(from 180deg at 50% 50%, #0a0a0a 0deg, #252525 45deg, #0a0a0a 90deg, #252525 135deg, #0a0a0a 180deg, #252525 225deg, #0a0a0a 270deg, #252525 315deg, #0a0a0a 360deg)',
    shadow: '6px 12px 20px rgba(0,0,0,0.45), 3px 4px 6px rgba(0,0,0,0.35), inset 1px 1px 3px rgba(255,255,255,0.16), inset -3px -4px 8px rgba(0,0,0,0.86)',
    edgeInset: 8,
    edgeBorder: '1px solid rgba(117,75,45,0.36)',
    edgeShadow: 'inset 0 2px 4px rgba(187,126,78,0.12), inset 0 -5px 10px rgba(34,18,10,0.58), 0 0 0 1px rgba(0,0,0,0.48)',
    edgeTexture: 'repeating-conic-gradient(from 0deg, rgba(114,70,39,0.62) 0deg 0.8deg, rgba(50,27,15,0.58) 0.8deg 2.35deg, rgba(151,93,51,0.42) 2.35deg 3.1deg)',
    edgeMask: 'radial-gradient(circle, transparent 0 67%, #000 69% 100%)',
    edgeOpacity: 0.54,
    edgeBlendMode: 'normal',
    innerInset: 17,
    innerOpacity: 0.2,
    sheenOpacity: 0.22,
    pointerStyle: {
      background: 'linear-gradient(to bottom, #e9725d, #b84c39)',
      boxShadow: '0 0 5px rgba(255,107,74,0.18), 0 2px 4px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,196,181,0.36)'
    }
  },
  {
    name: 'Original Walnut Grip Coral Pointer',
    background: 'radial-gradient(circle at 31% 29%, rgba(255,255,255,0.13), transparent 28%), radial-gradient(circle at 50% 50%, transparent 0 58%, rgba(255,255,255,0.08) 62%, rgba(0,0,0,0.34) 82%, transparent 88%), radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.8) 100%), conic-gradient(from 180deg at 50% 50%, #0a0a0a 0deg, #252525 45deg, #0a0a0a 90deg, #252525 135deg, #0a0a0a 180deg, #252525 225deg, #0a0a0a 270deg, #252525 315deg, #0a0a0a 360deg)',
    shadow: '6px 12px 20px rgba(0,0,0,0.45), 3px 4px 6px rgba(0,0,0,0.35), inset 1px 1px 3px rgba(255,255,255,0.16), inset -3px -4px 8px rgba(0,0,0,0.86)',
    outerBackground: 'radial-gradient(circle at 34% 28%, rgba(165,105,66,0.16), transparent 38%), conic-gradient(from 180deg at 50% 50%, #2d190e 0deg, #634020 45deg, #2a160c 90deg, #7a4d2a 135deg, #321b0f 180deg, #5a351d 225deg, #25130a 270deg, #6d4425 315deg, #2d190e 360deg)',
    outerMask: 'radial-gradient(circle, transparent 0 67%, #000 69% 100%)',
    edgeInset: 8,
    edgeBorder: '1px solid rgba(94,58,34,0.34)',
    edgeShadow: 'inset 0 2px 4px rgba(165,105,66,0.1), inset 0 -4px 8px rgba(25,13,8,0.52), 0 0 0 1px rgba(0,0,0,0.46)',
    sheenOpacity: 0.12,
    pointerStyle: {
      background: 'linear-gradient(to bottom, #e9725d, #b84c39)',
      boxShadow: '0 0 5px rgba(255,107,74,0.18), 0 2px 4px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,196,181,0.36)'
    }
  },
  {
    name: 'Original Copper Graphite Grip',
    useOriginalBackground: true,
    shadow: '6px 12px 20px rgba(0,0,0,0.45), 3px 4px 6px rgba(0,0,0,0.35), inset 1px 1px 3px rgba(255,255,255,0.16), inset -3px -4px 8px rgba(0,0,0,0.86)',
    outerBackground: 'radial-gradient(circle at 31% 29%, rgba(255,255,255,0.13), transparent 28%), radial-gradient(circle at 50% 50%, transparent 0 58%, rgba(255,255,255,0.08) 62%, rgba(0,0,0,0.34) 82%, transparent 88%), radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.8) 100%), conic-gradient(from 180deg at 50% 50%, #0a0a0a 0deg, #252525 45deg, #0a0a0a 90deg, #252525 135deg, #0a0a0a 180deg, #252525 225deg, #0a0a0a 270deg, #252525 315deg, #0a0a0a 360deg)',
    outerMask: 'radial-gradient(circle, transparent 0 58%, #000 60% 100%)',
    edgeInset: 8,
    edgeBorder: '1px solid rgba(210,225,225,0.18)',
    edgeShadow: 'inset 0 2px 4px rgba(255,255,255,0.11), inset 0 -5px 10px rgba(0,0,0,0.58), 0 0 0 1px rgba(0,0,0,0.46)',
    edgeTexture: 'repeating-conic-gradient(from 0deg, rgba(220,230,230,0.16) 0deg 0.75deg, rgba(0,0,0,0.26) 0.75deg 2.5deg)',
    edgeMask: 'radial-gradient(circle, transparent 0 67%, #000 69% 100%)',
    edgeOpacity: 0.42,
    edgeBlendMode: 'screen',
    originalCenterOverlay: true,
    originalCenterOverlayOpacity: 1,
    sheenOpacity: 0
  },
  {
    name: 'Smoked Champagne Bold Clean',
    background: 'radial-gradient(circle at 34% 30%, rgba(255,255,255,0.4), transparent 32%), radial-gradient(circle at 50% 50%, transparent 0 64%, rgba(211,196,160,0.13) 75%, rgba(35,31,25,0.46) 96%), conic-gradient(from 180deg at 50% 50%, #6e634a, #b8ab82, #71664c, #c4b58b, #6e634a, #afa178, #695e47, #beb087, #6e634a)',
    shadow: '13px 15px 27px rgba(0,0,0,0.5), inset 3px 3px 7px rgba(255,255,255,0.35), inset -5px -7px 12px rgba(0,0,0,0.47)',
    edgeInset: 8,
    edgeBorder: '1.2px solid rgba(218,207,175,0.28)',
    edgeShadow: 'inset 0 4px 6px rgba(255,255,255,0.13), inset 0 -6px 10px rgba(27,23,18,0.4)',
    sheenOpacity: 0.24
  },
  {
    name: 'Dark Aged Brass',
    background: 'radial-gradient(circle at 34% 30%, rgba(255,255,255,0.32), transparent 32%), radial-gradient(circle at 50% 50%, transparent 0 64%, rgba(128,110,76,0.16) 75%, rgba(18,13,8,0.6) 96%), conic-gradient(from 180deg at 50% 50%, #675235, #93805c, #59472c, #a08c67, #675235, #897650, #534126, #97845f, #675235)',
    shadow: '13px 15px 27px rgba(0,0,0,0.54), inset 3px 3px 7px rgba(255,255,255,0.28), inset -5px -7px 12px rgba(0,0,0,0.58)',
    edgeInset: 8,
    edgeBorder: '1.2px solid rgba(151,130,94,0.24)',
    edgeShadow: 'inset 0 4px 6px rgba(255,255,255,0.1), inset 0 -6px 10px rgba(18,12,5,0.42)',
    sheenOpacity: 0.24
  },
  {
    name: 'Aged Champagne Brass',
    background: 'radial-gradient(circle at 34% 30%, rgba(255,255,255,0.39), transparent 32%), radial-gradient(circle at 50% 50%, transparent 0 64%, rgba(182,162,122,0.15) 75%, rgba(24,18,12,0.54) 96%), conic-gradient(from 180deg at 50% 50%, #726148, #ae9f79, #6b5a42, #bead85, #726148, #a4936d, #64543d, #b3a27b, #726148)',
    shadow: '13px 15px 27px rgba(0,0,0,0.5), inset 3px 3px 7px rgba(255,255,255,0.34), inset -5px -7px 12px rgba(0,0,0,0.54)',
    edgeInset: 8,
    edgeBorder: '1.2px solid rgba(194,177,138,0.26)',
    edgeShadow: 'inset 0 4px 6px rgba(255,255,255,0.12), inset 0 -6px 10px rgba(22,16,10,0.38)',
    sheenInset: 9,
    sheenOpacity: 0.24
  },
  {
    name: 'Vintage Nickel Brass Bold Heavy',
    background: 'radial-gradient(circle at 34% 30%, rgba(255,255,255,0.42), transparent 32%), radial-gradient(circle at 50% 50%, transparent 0 64%, rgba(198,187,156,0.13) 75%, rgba(34,32,27,0.5) 98%), conic-gradient(from 180deg at 50% 50%, #706a59, #b4aa86, #746d5b, #bdb28d, #706a59, #aca17e, #6a6352, #b7ad88, #706a59)',
    shadow: '13px 15px 28px rgba(0,0,0,0.48), inset 3px 3px 7px rgba(255,255,255,0.34), inset -5px -7px 12px rgba(0,0,0,0.47)',
    edgeInset: 8,
    edgeBorder: '1.2px solid rgba(211,203,178,0.3)',
    edgeShadow: 'inset 0 4px 6px rgba(255,255,255,0.13), inset 0 -6px 10px rgba(31,29,24,0.4)',
    sheenOpacity: 0.21
  },
  {
    name: 'Original Copper Heavy Ring',
    useOriginalBackground: true,
    shadow: '15px 15px 30px rgba(0,0,0,0.52), inset 2px 2px 5px rgba(255,255,255,0.88), inset -4px -4px 8px rgba(0,0,0,0.62)',
    originalCenterOverlay: true,
    originalCenterOverlayOpacity: 1,
    edgeInset: 4,
    edgeBorder: '1.4px solid rgba(122,90,34,0.34)',
    edgeShadow: 'inset 0 3px 5px rgba(255,245,210,0.22), inset 0 -5px 8px rgba(53,35,12,0.38)',
    sheenOpacity: 0.3
  },
  {
    name: 'Original Copper Soft Glow',
    useOriginalBackground: true,
    shadow: '14px 15px 28px rgba(0,0,0,0.46), inset 2px 2px 6px rgba(255,255,255,0.96), inset -4px -4px 7px rgba(0,0,0,0.52)',
    originalCenterOverlay: true,
    originalCenterOverlayOpacity: 1,
    edgeInset: 6,
    edgeBorder: '1px solid rgba(149,118,54,0.22)',
    edgeShadow: 'inset 0 2px 4px rgba(255,248,222,0.2), inset 0 -4px 7px rgba(68,44,18,0.24)',
    innerInset: 16,
    innerOpacity: 0.16,
    sheenOpacity: 0.36
  },
  {
    name: 'Original Copper Deep Shadow',
    useOriginalBackground: true,
    shadow: '16px 17px 31px rgba(0,0,0,0.5), inset 2px 2px 5px rgba(255,255,255,0.76), inset -3px -3px 6px rgba(0,0,0,0.42)',
    originalCenterOverlay: true,
    originalCenterOverlayOpacity: 1,
    originalCenterOverlayBoxShadow: 'inset 0.5px 0.5px 1.5px rgba(0,0,0,0.28), 0 1px 1px rgba(255,255,255,0.42)',
    edgeInset: 5,
    edgeBorder: '1.1px solid rgba(117,84,31,0.28)',
    edgeShadow: 'inset 0 2px 4px rgba(248,236,198,0.14), inset 0 -6px 10px rgba(40,26,9,0.46)',
    sheenOpacity: 0.2
  },
  {
    name: 'Original Copper Satin Cut',
    useOriginalBackground: true,
    shadow: '14px 15px 28px rgba(0,0,0,0.48), inset 2px 2px 5px rgba(255,255,255,0.84), inset -4px -4px 8px rgba(0,0,0,0.58)',
    originalCenterOverlay: true,
    originalCenterOverlayOpacity: 1,
    edgeInset: 7,
    edgeBorder: '1.2px solid rgba(168,132,63,0.22)',
    edgeShadow: 'inset 0 3px 5px rgba(255,248,226,0.18), inset 0 -5px 8px rgba(55,36,12,0.28)',
    innerInset: 18,
    innerOpacity: 0.14,
    sheenOpacity: 0.18
  },
  {
    name: 'Original Copper Muted Highlight',
    useOriginalBackground: true,
    shadow: '15px 15px 30px rgba(0,0,0,0.5), inset 1px 1px 3px rgba(255,255,255,0.66), inset -4px -4px 8px rgba(0,0,0,0.62)',
    originalCenterOverlay: true,
    originalCenterOverlayOpacity: 1,
    edgeInset: 5,
    edgeBorder: '1px solid rgba(132,98,39,0.26)',
    edgeShadow: 'inset 0 2px 3px rgba(255,241,205,0.12), inset 0 -5px 8px rgba(46,31,11,0.34)',
    sheenOpacity: 0.12
  },
  {
    name: 'Original Copper Studio Clean',
    useOriginalBackground: true,
    shadow: '13px 14px 26px rgba(0,0,0,0.46), inset 2px 2px 4px rgba(255,255,255,0.86), inset -3px -3px 7px rgba(0,0,0,0.56)',
    originalCenterOverlay: true,
    originalCenterOverlayOpacity: 1,
    edgeInset: 6,
    edgeBorder: '1px solid rgba(177,141,71,0.18)',
    edgeShadow: 'inset 0 2px 4px rgba(255,250,230,0.16), inset 0 -4px 7px rgba(60,40,15,0.22)',
    innerInset: 17,
    innerOpacity: 0.12,
    sheenOpacity: 0.14
  }
];

const LEGACY_MIDDLE_KNOB_STYLE_INDEX_MAP = {
  0: 0,
  1: 3,
  4: 4,
  5: 5,
  7: 6,
  10: 7,
  16: 8,
  18: 9,
  26: 10
};

const normalizeMiddleKnobStyle = (value) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return 0;
  if (numericValue >= 0 && numericValue < MIDDLE_KNOB_STYLES.length) return numericValue;
  const mappedValue = LEGACY_MIDDLE_KNOB_STYLE_INDEX_MAP[numericValue];
  if (mappedValue !== undefined) return mappedValue;
  return Math.max(0, Math.min(MIDDLE_KNOB_STYLES.length - 1, numericValue));
};

const SPREAD_POINTER_STYLES = [
  { name: 'Original Coral Pill' },
  { name: 'Edge Coral Tab' },
  { name: 'Fine Brass Edge' },
  { name: 'Ivory Edge Paint' },
  { name: 'Copper Knife Mark' },
  { name: 'Smoked Rubber Tab' },
  { name: 'Amber Edge Pip' },
  { name: 'Black Cut Notch' },
  { name: 'Coral Enamel Dash' },
  { name: 'Brass Rivet Tick' },
  { name: 'Double Hairline Edge' }
];

const normalizeSpreadPointerStyle = (value) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return 0;
  return Math.max(0, Math.min(SPREAD_POINTER_STYLES.length - 1, numericValue));
};

const OUTER_RING_SCALES = [
  { name: 'None', type: 'none' },
  // Original "Gold Inlay" Styles
  { name: 'Minimal Dots', type: 'dots', count: 11, radius: 1.5, color: '#d3ba8c', glow: true },
  { name: 'Dense Dots', type: 'dots', count: 21, radius: 1.2, color: '#d3ba8c', glow: true },
  { name: 'Classic Engraved Lines', type: 'lines', count: 11, length: 6, width: 1.5, color: '#d3ba8c', glow: true },
  { name: 'Fine Instrument Needles', type: 'lines', count: 31, length: 4, width: 1, color: '#d3ba8c', glow: true },
  { name: 'Alternating Dots', type: 'alternating-dots', count: 21, radiusL: 2, radiusS: 1, color: '#d3ba8c', glow: true },
  { name: 'Alternating Lines', type: 'alternating-lines', count: 31, lengthL: 6, lengthS: 3, width: 1.5, color: '#d3ba8c', glow: true },
  { name: 'Inner Edge Beads', type: 'dots-inner', count: 15, radius: 1.8, color: '#d3ba8c', glow: true },
  { name: 'Outer Edge Ticks', type: 'lines-outer', count: 21, length: 5, width: 1.5, color: '#d3ba8c', glow: true },
  { name: 'Vintage Graduated Scale', type: 'graduated', count: 25, color: '#d3ba8c', glow: true },
  { name: 'Heavy Brass Studs', type: 'studs', count: 11, radius: 2.5, color: '#bca06f', glow: true },
  // New "Engraved / Debossed" Styles
  { name: 'Engraved Minimal Dots', type: 'dots', count: 11, radius: 1.5, color: '#1a110a', engraved: true },
  { name: 'Engraved Dense Dots', type: 'dots', count: 21, radius: 1.2, color: '#1a110a', engraved: true },
  { name: 'Engraved Classic Lines', type: 'lines', count: 11, length: 6, width: 1.5, color: '#1a110a', engraved: true },
  { name: 'Engraved Thick Lines', type: 'lines', count: 11, length: 6, width: 2.5, color: '#1a110a', engraved: true },
  { name: 'Engraved Fine Needles', type: 'lines', count: 31, length: 4, width: 1, color: '#1a110a', engraved: true },
  { name: 'Engraved Alternating Dots', type: 'alternating-dots', count: 21, radiusL: 2, radiusS: 1, color: '#1a110a', engraved: true },
  { name: 'Engraved Alternating Lines', type: 'alternating-lines', count: 31, lengthL: 6, lengthS: 3, width: 1.5, color: '#1a110a', engraved: true },
  { name: 'Engraved Inner Beads', type: 'dots-inner', count: 15, radius: 1.8, color: '#1a110a', engraved: true },
  { name: 'Engraved Outer Ticks', type: 'lines-outer', count: 21, length: 5, width: 1.5, color: '#1a110a', engraved: true },
  { name: 'Engraved Vintage Scale', type: 'graduated', count: 25, color: '#1a110a', engraved: true },
  { name: 'Engraved Deep Divots', type: 'studs', count: 11, radius: 2.5, color: '#0f0a06', engraved: true },
  // New "Inner" Elegant Styles
  { name: 'Inner Minimal Dots', type: 'dots', count: 11, radius: 1, color: '#8b5a35', position: 'inside', opacity: 0.76 },
  { name: 'Inner Fine Needles', type: 'lines', count: 31, length: 3, width: 0.6, color: '#8b5a35', position: 'inside', opacity: 0.72 },
  { name: 'Inner Brass Studs', type: 'studs', count: 11, radius: 1.5, color: '#8b5a35', position: 'inside', opacity: 0.78 },
  { name: 'Inner Diamond Studs', type: 'diamonds', count: 11, radius: 1.5, color: '#8b5a35', position: 'inside', opacity: 0.78 },
  { name: 'Inner Hairline Dashes', type: 'dashes', count: 31, length: 3, width: 0.5, color: '#8b5a35', position: 'inside', opacity: 0.7 },
  { name: 'Inner Double Orbits', type: 'double-dots', count: 11, radius: 0.8, color: '#8b5a35', position: 'inside', opacity: 0.74 },
  { name: 'Inner Golden Wedges', type: 'wedges', count: 11, radius: 2, color: '#8b5a35', position: 'inside', opacity: 0.74 },
  { name: 'Inner Sub-Dial Arc', type: 'sub-dial-arc', count: 11, radius: 1, color: '#8b5a35', position: 'inside', opacity: 0.72 },
  
  // New "Inner" Drifty / Creative Styles
  { name: 'Drifter Flutter Arcs', type: 'flutter-arcs', count: 21, width: 1, color: '#8b5a35', position: 'inside', opacity: 0.74 },
  { name: 'Sparse Drifter Flutter Arcs', type: 'flutter-arcs', count: 13, width: 1, color: '#8b5a35', position: 'inside', opacity: 0.74 },
  { name: 'Wabi-Sabi Flow', type: 'wabi-sabi-flow', count: 15, radius: 1.5, color: '#8b5a35', position: 'inside', opacity: 0.74 },
  { name: 'Unstable Clusters', type: 'unstable-clusters', count: 11, radius: 0.6, color: '#8b5a35', position: 'inside', opacity: 0.7 },
  { name: 'Cinematic Embers', type: 'cinematic-embers', count: 21, radius: 1.2, color: '#8b5a35', position: 'inside', opacity: 0.76 },
  { name: 'Magnetic Tape Bleed', type: 'magnetic-bleed', count: 11, width: 2, color: '#8b5a35', position: 'inside', opacity: 0.72 },

  // Inner Scales (Permanent)
  { name: 'Inner Graduated Scale', type: 'graduated', count: 25, color: '#8b5a35', position: 'inside', opacity: 0.74 },
  { name: 'Inner Sparse Tape Scale', type: 'sparse-tape-scale', count: 13, color: '#8b5a35', position: 'inside', opacity: 0.76 },
  
  // Faceplate Styles
  { name: 'Faceplate Vintage Gauge', type: 'graduated', count: 25, color: '#7a5d49', position: 'outside' }
];

const BotanicalCenterDial = ({ drift, setDrift, spread, setSpread, rate, mode, shadowStyle, surfaceStyle, grooveStyle, markStyleIndex = 0, numberStyleIndex = 0, circlesEnabled = true, numbersEnabled = true, guideRings = CENTER_DIAL_GUIDE_RING_DEFAULTS, middleKnobStyle = 0, spreadPointerStyle = 0, animationStyle = 0, outerRingScaleStyle = 0, knobFlutterFilledColors = DEFAULT_KNOB_FLUTTER_FILLED_COLORS, originalCopperTuning = DEFAULT_ORIGINAL_COPPER_TUNING, agedChampagneBrassTuning = DEFAULT_AGED_CHAMPAGNE_BRASS_TUNING, smokedChampagneBoldCleanTuning = DEFAULT_SMOKED_CHAMPAGNE_BOLD_CLEAN_TUNING, centerDepthModel, onDoubleClickDrift, onDoubleClickSpread, readoutStyleIndex = 0 }) => {
  const [isDraggingDrift, setIsDraggingDrift] = useState(false);
  const [isDraggingSpread, setIsDraggingSpread] = useState(false);
  const driftY = useRef(0), driftStart = useRef(0), spreadY = useRef(0), spreadStart = useRef(0);
  const handleDriftDown = (e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingDrift(true); driftY.current = e.clientY; driftStart.current = drift; e.target.setPointerCapture(e.pointerId); };
  const handleDriftMove = (e) => { if (!isDraggingDrift) return; e.preventDefault(); e.stopPropagation(); setDrift(Math.max(0, Math.min(100, driftStart.current + (driftY.current - e.clientY) * 0.8))); };
  const handleDriftUp = (e) => { setIsDraggingDrift(false); e.target.releasePointerCapture(e.pointerId); };
  const handleSpreadDown = (e) => { e.preventDefault(); setIsDraggingSpread(true); spreadY.current = e.clientY; spreadStart.current = spread; e.target.setPointerCapture(e.pointerId); };
  const handleSpreadMove = (e) => { if (!isDraggingSpread) return; e.preventDefault(); setSpread(Math.max(0, Math.min(100, spreadStart.current + (spreadY.current - e.clientY) * 0.8))); };
  const handleSpreadUp = (e) => { setIsDraggingSpread(false); e.target.releasePointerCapture(e.pointerId); };
  const driftRot = (drift / 100 * 270) - 135;
  const spreadRot = (spread / 100 * 270) - 135;
  const auraActive = isDraggingDrift || isDraggingSpread || drift > 0.25;
  const surface = surfaceStyle || CENTER_DIAL_SURFACES[0];
  const outerSize = surface.size || 320;
  const outerShadow = surface.boxShadow || shadowStyle || '2px 2px 8px rgba(0,0,0,0.7), 18px 18px 40px rgba(0,0,0,0.4), inset 1px 1px 3px rgba(255,255,255,0.15), inset -4px -4px 10px rgba(0,0,0,0.9)';
  const rimFillColor = surface.outerRimColor || 'rgba(86,50,28,0.88)';
  const rimInnerInset = surface.outerRim ? (surface.rimWidth || 12) : 12;
  const guardedOuterShadow = surface.outerRim ? (surface.allowOuterShadow ? outerShadow : 'none') : outerShadow;
  const spreadIndicator = surface.indicator || { width: 8, height: 24, top: '8%', background: '#e66a53', boxShadow: '0 0 10px #e66a53' };
  const spreadPointerNudge = 7;
  const spreadIndicatorHeight = Math.max(1, (spreadIndicator.height || 24) - 2);
  const adjustedIndicatorPosition = spreadIndicator.bottom
    ? { bottom: `calc(${spreadIndicator.bottom} + ${spreadPointerNudge}px)` }
    : { top: `calc(${spreadIndicator.top || '8%'} + ${spreadPointerNudge}px)` };
  const guideRingSettings = {
    large: { ...CENTER_DIAL_GUIDE_RING_DEFAULTS.large, ...(guideRings?.large || {}) },
    small: { ...CENTER_DIAL_GUIDE_RING_DEFAULTS.small, ...(guideRings?.small || {}) }
  };
  const activeSpreadPointerStyle = normalizeSpreadPointerStyle(spreadPointerStyle);
  const selectedMiddleKnobStyle = MIDDLE_KNOB_STYLES[normalizeMiddleKnobStyle(middleKnobStyle)] || MIDDLE_KNOB_STYLES[0];
  const activeMiddleKnobStyle = selectedMiddleKnobStyle.name === 'Aged Champagne Brass'
    ? {
        ...selectedMiddleKnobStyle,
        background: `radial-gradient(circle at 34% 30%, rgba(255,255,255,${agedChampagneBrassTuning.faceHighlightOpacity}), transparent 32%), radial-gradient(circle at 50% 50%, transparent 0 64%, ${hexToRgba(agedChampagneBrassTuning.midMetalColor, 0.15)} 75%, rgba(24,18,12,${agedChampagneBrassTuning.faceShadowOpacity}) 96%), conic-gradient(from 180deg at 50% 50%, ${agedChampagneBrassTuning.darkMetalColor}, ${agedChampagneBrassTuning.midMetalColor}, ${agedChampagneBrassTuning.darkMetalColor}, ${agedChampagneBrassTuning.lightMetalColor}, ${agedChampagneBrassTuning.darkMetalColor}, ${agedChampagneBrassTuning.midMetalColor}, ${agedChampagneBrassTuning.darkMetalColor}, ${agedChampagneBrassTuning.lightMetalColor}, ${agedChampagneBrassTuning.darkMetalColor})`,
        shadow: `13px 15px 27px rgba(0,0,0,${agedChampagneBrassTuning.baseOuterShadowOpacity}), inset 3px 3px 7px rgba(255,255,255,${agedChampagneBrassTuning.baseInnerHighlightOpacity}), inset -5px -7px 12px rgba(0,0,0,${agedChampagneBrassTuning.baseInnerShadowOpacity})`,
        edgeInset: agedChampagneBrassTuning.ringInset,
        edgeBorder: `1.2px solid ${hexToRgba(agedChampagneBrassTuning.lightMetalColor, agedChampagneBrassTuning.ringBorderOpacity)}`,
        edgeShadow: `inset 0 4px 6px rgba(255,255,255,${agedChampagneBrassTuning.ringHighlightOpacity}), inset 0 -6px 10px rgba(22,16,10,${agedChampagneBrassTuning.ringShadowOpacity})`,
        centerTextureInset: agedChampagneBrassTuning.ringInset + 1,
        centerTexture: `radial-gradient(circle at 50% 50%, transparent 0 54%, rgba(32,24,16,${Math.max(0, agedChampagneBrassTuning.faceShadowOpacity * 0.28)}) 74%, rgba(16,12,8,${agedChampagneBrassTuning.faceShadowOpacity}) 100%)`,
        centerOpacity: 1,
        centerBlendMode: 'multiply',
        sheenInset: agedChampagneBrassTuning.ringInset + 1,
        sheenOpacity: agedChampagneBrassTuning.sheenOpacity
      }
    : selectedMiddleKnobStyle.name === 'Smoked Champagne Bold Clean'
    ? {
        ...selectedMiddleKnobStyle,
        background: `radial-gradient(circle at 34% 30%, rgba(255,255,255,${smokedChampagneBoldCleanTuning.faceHighlightOpacity}), transparent 32%), radial-gradient(circle at 50% 50%, transparent 0 64%, ${hexToRgba(smokedChampagneBoldCleanTuning.midMetalColor, 0.13)} 75%, rgba(35,31,25,${smokedChampagneBoldCleanTuning.faceShadowOpacity}) 96%), conic-gradient(from 180deg at 50% 50%, ${smokedChampagneBoldCleanTuning.darkMetalColor}, ${smokedChampagneBoldCleanTuning.midMetalColor}, ${smokedChampagneBoldCleanTuning.darkMetalColor}, ${smokedChampagneBoldCleanTuning.lightMetalColor}, ${smokedChampagneBoldCleanTuning.darkMetalColor}, ${smokedChampagneBoldCleanTuning.midMetalColor}, ${smokedChampagneBoldCleanTuning.darkMetalColor}, ${smokedChampagneBoldCleanTuning.lightMetalColor}, ${smokedChampagneBoldCleanTuning.darkMetalColor})`,
        shadow: `13px 15px 27px rgba(0,0,0,${smokedChampagneBoldCleanTuning.baseOuterShadowOpacity}), inset 3px 3px 7px rgba(255,255,255,${smokedChampagneBoldCleanTuning.baseInnerHighlightOpacity}), inset -5px -7px 12px rgba(0,0,0,${smokedChampagneBoldCleanTuning.baseInnerShadowOpacity})`,
        edgeInset: smokedChampagneBoldCleanTuning.ringInset,
        edgeBorder: `1.2px solid ${hexToRgba(smokedChampagneBoldCleanTuning.lightMetalColor, smokedChampagneBoldCleanTuning.ringBorderOpacity)}`,
        edgeShadow: `inset 0 4px 6px rgba(255,255,255,${smokedChampagneBoldCleanTuning.ringHighlightOpacity}), inset 0 -6px 10px rgba(27,23,18,${smokedChampagneBoldCleanTuning.ringShadowOpacity})`,
        centerTextureInset: smokedChampagneBoldCleanTuning.ringInset + 1,
        centerTexture: `radial-gradient(circle at 50% 50%, transparent 0 54%, rgba(46,39,28,${Math.max(0, smokedChampagneBoldCleanTuning.faceShadowOpacity * 0.26)}) 74%, rgba(22,18,12,${smokedChampagneBoldCleanTuning.faceShadowOpacity}) 100%)`,
        centerOpacity: 1,
        centerBlendMode: 'multiply',
        sheenInset: smokedChampagneBoldCleanTuning.ringInset + 1,
        sheenOpacity: smokedChampagneBoldCleanTuning.sheenOpacity
      }
    : selectedMiddleKnobStyle;
  const insetPointerTop = (surface.outerRim ? rimInnerInset + 4 : Math.round(outerSize * 0.085)) + spreadPointerNudge;
  const pointerBaseStyle = {
    top: insetPointerTop,
    left: '50%',
    transform: 'translateX(-50%)'
  };
  const dialMarkScale = outerSize / 320;
  const dialMarkCenter = outerSize / 2;
  const dialMarkOuterRadius = 140 * dialMarkScale;
  const dialMarkMiddleRadius = 120 * dialMarkScale;
  const dialMarkInnerRadius = 90 * dialMarkScale;
  const dialNumberY = dialMarkCenter - 125 * dialMarkScale;
  const innerMarkLimit = surface.outerRim ? dialMarkCenter - rimInnerInset - 10 * dialMarkScale : dialMarkCenter - 18 * dialMarkScale;
  const markOuterRadius = Math.min(126 * dialMarkScale, innerMarkLimit);
  const markMidRadius = markOuterRadius - 22 * dialMarkScale;
  const markInnerRadius = markOuterRadius - 48 * dialMarkScale;
  const markNumbers = Array.from({ length: 11 }, (_, i) => i);
  const markPoint = (angle, radius) => {
    const rad = (angle - 90) * Math.PI / 180;
    return {
      x: dialMarkCenter + Math.cos(rad) * radius,
      y: dialMarkCenter + Math.sin(rad) * radius
    };
  };
  const renderNumbers = ({ radius, color = '#d4af37', opacity = 0.5, size = 12, family = 'monospace', weight = 700, letterSpacing = 0, rotate = false }) => {
    if (!numbersEnabled) return null;
    return markNumbers.map((number, i) => {
      const angle = -135 + i * 27;
      const point = markPoint(angle, radius);
      return (
        <text
          key={`num-${i}`}
          x={point.x}
          y={point.y}
          fill={color}
          opacity={opacity}
          fontSize={size * dialMarkScale}
          fontFamily={family}
          fontWeight={weight}
          letterSpacing={letterSpacing}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ transformOrigin: `${point.x}px ${point.y}px`, transform: rotate ? `rotate(${angle}deg)` : undefined }}
        >
          {number}
        </text>
      );
    });
  };
  const renderTicks = ({ radius, length = 8, color = '#d4af37', opacity = 0.35, width = 1, count = 55, majorEvery = 5 }) => {
    if (!circlesEnabled) return null;
    return Array.from({ length: count }, (_, i) => {
      const angle = -135 + i * (270 / (count - 1));
      const major = i % majorEvery === 0;
      const outer = markPoint(angle, radius);
      const inner = markPoint(angle, radius - (major ? length : length * 0.52) * dialMarkScale);
      return (
        <line
          key={`tick-${i}`}
          x1={inner.x}
          y1={inner.y}
          x2={outer.x}
          y2={outer.y}
          stroke={color}
          strokeOpacity={major ? opacity : opacity * 0.55}
          strokeWidth={(major ? width : width * 0.7) * dialMarkScale}
          strokeLinecap="round"
        />
      );
    });
  };
  const renderCircle = ({ radius, color = '#a85b3d', opacity = 0.35, width = 1, dash }) => {
    if (!circlesEnabled) return null;
    return <circle cx={dialMarkCenter} cy={dialMarkCenter} r={radius} fill="none" stroke={color} strokeOpacity={opacity} strokeWidth={width * dialMarkScale} strokeDasharray={dash} />;
  };
  const renderDialMarkStyle = () => {
    if (markStyleIndex === 0) return null;
    switch (markStyleIndex) {
      case 1:
        return (
          <>
            {renderCircle({ radius: markOuterRadius, opacity: 0.28, width: 0.8 })}
            {renderCircle({ radius: markMidRadius, opacity: 0.2, width: 0.65 })}
            {renderTicks({ radius: markOuterRadius - 4 * dialMarkScale, length: 7, opacity: 0.42, width: 0.9, count: 41, majorEvery: 4 })}
          </>
        );
      case 2:
        return (
          <>
            {renderCircle({ radius: markOuterRadius - 2 * dialMarkScale, color: '#d4af37', opacity: 0.24, width: 0.7 })}
            {renderCircle({ radius: markInnerRadius, color: '#d4af37', opacity: 0.16, width: 0.6 })}
            {renderTicks({ radius: markOuterRadius - 8 * dialMarkScale, length: 10, color: '#d4af37', opacity: 0.38, width: 0.8, count: 55, majorEvery: 5 })}
          </>
        );
      case 3:
        return (
          <>
            {renderCircle({ radius: markMidRadius, color: '#f4ead6', opacity: 0.16, width: 0.7 })}
            {renderTicks({ radius: markOuterRadius - 10 * dialMarkScale, length: 5, color: '#f4ead6', opacity: 0.28, width: 0.75, count: 31, majorEvery: 3 })}
          </>
        );
      case 4:
        return (
          <>
            {renderCircle({ radius: markOuterRadius - 6 * dialMarkScale, color: '#8a6a32', opacity: 0.32, width: 0.7 })}
            {renderCircle({ radius: markOuterRadius - 32 * dialMarkScale, color: '#8a6a32', opacity: 0.16, width: 0.7 })}
          </>
        );
      case 5:
        return (
          <>
            {renderTicks({ radius: markOuterRadius - 3 * dialMarkScale, length: 12, color: '#d4af37', opacity: 0.34, width: 0.8, count: 21, majorEvery: 2 })}
          </>
        );
      case 6:
        return (
          <>
            {renderCircle({ radius: markOuterRadius - 4 * dialMarkScale, color: '#e66a53', opacity: 0.2, width: 0.8 })}
            {renderTicks({ radius: markOuterRadius - 8 * dialMarkScale, length: 8, color: '#e66a53', opacity: 0.34, width: 0.9, count: 41, majorEvery: 4 })}
          </>
        );
      case 7:
        return (
          <>
            {renderCircle({ radius: markOuterRadius - 6 * dialMarkScale, color: '#b88935', opacity: 0.22, width: 0.7 })}
            {renderCircle({ radius: markInnerRadius + 6 * dialMarkScale, color: '#b88935', opacity: 0.13, width: 0.6 })}
          </>
        );
      case 8:
        return (
          <>
            {circlesEnabled && markNumbers.map((_, i) => {
              const point = markPoint(-135 + i * 27, markOuterRadius - 10 * dialMarkScale);
              return <circle key={`dot-${i}`} cx={point.x} cy={point.y} r={(i % 5 === 0 ? 2.2 : 1.35) * dialMarkScale} fill="#d4af37" opacity={i % 5 === 0 ? 0.5 : 0.26} />;
            })}
          </>
        );
      case 9:
        return (
          <>
            {renderCircle({ radius: markOuterRadius - 5 * dialMarkScale, color: '#d4af37', opacity: 0.18, width: 0.7 })}
            {renderCircle({ radius: markMidRadius - 4 * dialMarkScale, color: '#e66a53', opacity: 0.12, width: 0.7 })}
          </>
        );
      case 10:
        return (
          <>
            {renderCircle({ radius: markOuterRadius - 2 * dialMarkScale, color: '#edd39a', opacity: 0.2, width: 0.55 })}
            {renderCircle({ radius: markOuterRadius - 14 * dialMarkScale, color: '#edd39a', opacity: 0.12, width: 0.55 })}
            {renderTicks({ radius: markOuterRadius - 4 * dialMarkScale, length: 6, color: '#edd39a', opacity: 0.26, width: 0.7, count: 31, majorEvery: 3 })}
          </>
        );
      default:
        return null;
    }
  };
  const renderDialNumberStyle = () => {
    if (numberStyleIndex === 0) return null;
    switch (numberStyleIndex) {
      case 1:
        return renderNumbers({ radius: markOuterRadius - 28 * dialMarkScale, opacity: 0.56, size: 12.4, family: 'monospace', weight: 800 });
      case 2:
        return renderNumbers({ radius: markOuterRadius - 26 * dialMarkScale, color: '#edd39a', opacity: 0.58, size: 13, family: 'monospace', weight: 900 });
      case 3:
        return renderNumbers({ radius: markOuterRadius - 27 * dialMarkScale, color: '#f4ead6', opacity: 0.5, size: 12.8, family: 'Georgia, serif', weight: 700 });
      case 4:
        return renderNumbers({ radius: markOuterRadius - 27 * dialMarkScale, color: '#e7d6a4', opacity: 0.54, size: 12.2, family: 'Arial, sans-serif', weight: 800, letterSpacing: 0.8 });
      case 5:
        return renderNumbers({ radius: markOuterRadius - 29 * dialMarkScale, color: '#d4af37', opacity: 0.46, size: 11.8, family: 'monospace', weight: 700 });
      case 6:
        return renderNumbers({ radius: markOuterRadius - 24 * dialMarkScale, color: '#d4af37', opacity: 0.54, size: 12.2, family: 'monospace', weight: 800 });
      case 7:
        return renderNumbers({ radius: markOuterRadius - 28 * dialMarkScale, color: '#edd39a', opacity: 0.5, size: 12.6, family: 'Georgia, serif', weight: 700, letterSpacing: 0.5 });
      case 8:
        return renderNumbers({ radius: markInnerRadius + 14 * dialMarkScale, color: '#d4af37', opacity: 0.45, size: 11.6, family: 'monospace', weight: 800 });
      case 9:
        return renderNumbers({ radius: markOuterRadius - 30 * dialMarkScale, color: '#f4ead6', opacity: 0.42, size: 12, family: 'Arial, sans-serif', weight: 700 });
      case 10:
        return renderNumbers({ radius: markOuterRadius - 25 * dialMarkScale, color: '#edd39a', opacity: 0.52, size: 12.5, family: 'Arial, sans-serif', weight: 900 });
      default:
        return null;
    }
  };
  const renderDialLabels = () => {
    const spreadY = outerSize - (surface.outerRim ? Math.max(19.5, rimInnerInset * 0.76 - 1.5) : 30.5);
    const driftY = dialMarkCenter + 79 * dialMarkScale;
    return (
      <g aria-hidden="true">
        <defs>
          <path
            id="spreadLabelArc"
            d={`M ${dialMarkCenter - 58 * dialMarkScale} ${spreadY - 1 * dialMarkScale} Q ${dialMarkCenter} ${spreadY + 13 * dialMarkScale} ${dialMarkCenter + 58 * dialMarkScale} ${spreadY - 1 * dialMarkScale}`}
          />
          <path
            id="driftLabelArc"
            d={`M ${dialMarkCenter - 43 * dialMarkScale} ${driftY - 3 * dialMarkScale} Q ${dialMarkCenter} ${driftY + 11 * dialMarkScale} ${dialMarkCenter + 43 * dialMarkScale} ${driftY - 3 * dialMarkScale}`}
          />
          <filter id="dialLabelPressedShadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="1" stdDeviation="0.35" floodColor="#000000" floodOpacity="0.9" />
          </filter>
          <filter id="driftLabelWarmShadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="1" stdDeviation="0.6" floodColor="#000000" floodOpacity="0.58" />
            <feDropShadow dx="0" dy="0" stdDeviation="1.3" floodColor="#e66a53" floodOpacity="0.24" />
          </filter>
        </defs>
        <text
          fill="#d3ba8c"
          fillOpacity="1"
          fontSize={11 * dialMarkScale}
          fontFamily="Arial, sans-serif"
          fontWeight="900"
          letterSpacing={4.2 * dialMarkScale}
          textAnchor="middle"
          dominantBaseline="middle"
          filter="url(#dialLabelPressedShadow)"
          style={{ paintOrder: 'stroke', stroke: 'rgba(38,22,12,0.26)', strokeWidth: 0.65 * dialMarkScale }}
        >
          <textPath href="#spreadLabelArc" startOffset="50%">SPREAD</textPath>
        </text>
        <text
          fill="#e66a53"
          fillOpacity="0.92"
          fontSize={10.4 * dialMarkScale}
          fontFamily="Arial, sans-serif"
          fontWeight="900"
          letterSpacing={3.2 * dialMarkScale}
          textAnchor="middle"
          dominantBaseline="middle"
          filter="url(#driftLabelWarmShadow)"
          style={{ paintOrder: 'stroke', stroke: 'rgba(30,12,8,0.22)', strokeWidth: 0.5 * dialMarkScale }}
        >
          <textPath href="#driftLabelArc" startOffset="50%">DRIFT</textPath>
        </text>
      </g>
    );
  };
  const renderSpreadPointer = () => {
    if (activeSpreadPointerStyle === 0) {
      return (
        <div
          className="absolute left-1/2 -translate-x-1/2 rounded-full"
          style={{
            ...adjustedIndicatorPosition,
            width: spreadIndicator.width,
            height: spreadIndicatorHeight,
            background: 'linear-gradient(to bottom, #be5848, #8f3d32)',
            boxShadow: '0 0 6px rgba(150,58,48,0.38), 0 1px 2px rgba(0,0,0,0.5), inset 0 1px 1px rgba(235,160,142,0.24)',
            opacity: spreadIndicator.opacity ?? 1,
            border: spreadIndicator.border
          }}
        />
      );
    }

    switch (activeSpreadPointerStyle) {
      case 1:
        return (
          <div
            className="absolute rounded-full"
            style={{
              ...pointerBaseStyle,
              width: 10,
              height: 22,
              background: 'linear-gradient(90deg, #8f382f 0%, #be5848 48%, #6d281f 100%)',
              border: '1px solid rgba(255,170,150,0.24)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.58), inset 0 1px 1px rgba(235,160,142,0.2), 0 0 4px rgba(150,58,48,0.28)'
            }}
          />
        );
      case 2:
        return (
          <div
            className="absolute rounded-full"
            style={{
              ...pointerBaseStyle,
              width: 5,
              height: 25,
              background: 'linear-gradient(90deg, #6a4b1e, #d8b24f 48%, #74501f)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.56), inset 1px 0 1px rgba(255,235,170,0.38), 0 0 5px rgba(212,175,55,0.2)'
            }}
          />
        );
      case 3:
        return (
          <div
            className="absolute rounded-full"
            style={{
              ...pointerBaseStyle,
              width: 6,
              height: 23,
              background: 'linear-gradient(90deg, #c8b884, #f4ead6 52%, #a99460)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.48), inset 0 -1px 1px rgba(90,66,42,0.26)',
              opacity: 0.86
            }}
          />
        );
      case 4:
        return (
          <div
            className="absolute rounded-full"
            style={{
              ...pointerBaseStyle,
              width: 7,
              height: 27,
              background: 'linear-gradient(90deg, #67301f, #c87951 48%, #5c251b)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.58), inset 1px 0 1px rgba(255,202,160,0.2), 0 0 4px rgba(198,105,72,0.2)'
            }}
          />
        );
      case 5:
        return (
          <div
            className="absolute rounded-[5px]"
            style={{
              ...pointerBaseStyle,
              width: 12,
              height: 22,
              background: 'linear-gradient(180deg, rgba(41,39,35,0.98), rgba(6,6,5,0.96))',
              border: '1px solid rgba(255,255,255,0.065)',
              boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.09), inset 0 -3px 5px rgba(0,0,0,0.86), 0 1px 2px rgba(0,0,0,0.56)'
            }}
          />
        );
      case 6:
        return (
          <div
            className="absolute rounded-full"
            style={{
              ...pointerBaseStyle,
              width: 11,
              height: 11,
              top: insetPointerTop + 7,
              background: 'radial-gradient(circle at 35% 30%, #ffe0a0 0%, #c89634 38%, #633116 78%, #120906 100%)',
              border: '1px solid rgba(255,218,150,0.34)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.58), inset 0 1px 1px rgba(255,255,255,0.36), 0 0 6px rgba(212,175,55,0.24)'
            }}
          />
        );
      case 7:
        return (
          <div
            className="absolute rounded-full"
            style={{
              ...pointerBaseStyle,
              width: 9,
              height: 23,
              background: 'linear-gradient(180deg, #020202, #151311 56%, #030303)',
              border: '1px solid rgba(255,255,255,0.035)',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.96), inset 0 -1px 1px rgba(255,255,255,0.06), 0 1px 1px rgba(255,255,255,0.035)'
            }}
          />
        );
      case 8:
        return (
          <div
            className="absolute rounded-full"
            style={{
              ...pointerBaseStyle,
              width: 18,
              height: 7,
              top: insetPointerTop + 7,
              background: 'linear-gradient(180deg, #ff9b86, #e66a53 58%, #8e2c24)',
              border: '1px solid rgba(255,180,160,0.2)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.58), inset 0 1px 1px rgba(255,220,200,0.25), 0 0 6px rgba(230,106,83,0.36)'
            }}
          />
        );
      case 9:
        return (
          <div
            className="absolute flex items-center justify-center rounded-full"
            style={{
              ...pointerBaseStyle,
              width: 14,
              height: 14,
              top: insetPointerTop + 5,
              background: 'radial-gradient(circle at 35% 30%, #ddc074, #7d5b23 55%, #17100a 100%)',
              border: '1px solid rgba(237,211,154,0.28)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,240,190,0.25)'
            }}
          >
            <span className="h-[2px] w-[8px] rounded-full bg-[#120c07]/70" />
          </div>
        );
      case 10:
        return (
          <div className="absolute" style={{ ...pointerBaseStyle, width: 14, height: 24 }}>
            <span className="absolute left-[3px] top-0 h-full w-[2px] rounded-full bg-[#d4af37]/90 shadow-[0_1px_2px_rgba(0,0,0,0.52)]" />
            <span className="absolute right-[3px] top-0 h-full w-[2px] rounded-full bg-[#e66a53]/82 shadow-[0_0_4px_rgba(230,106,83,0.28),0_1px_2px_rgba(0,0,0,0.52)]" />
          </div>
        );
      default:
        return null;
    }
  };
  const renderSurfaceDecoration = () => {
    const renderGuideRing = (ringKey, fallbackInset, borderColor) => {
      const ring = guideRingSettings[ringKey];
      if (!ring?.enabled) return null;
      const fallbackSize = outerSize - fallbackInset * 2;
      const ringSize = Math.max(40, Math.min(outerSize, Number(ring.size) || fallbackSize));
      const ringInset = (outerSize - ringSize) / 2;
      if (surface.partialGuideRings && ringKey === 'small') {
        const strokeWidth = 1;
        const radius = Math.max(1, ringSize / 2 - strokeWidth / 2);
        const circumference = 2 * Math.PI * radius;
        const arcLength = circumference * 0.885;
        return (
          <svg
            className="absolute pointer-events-none"
            style={{ inset: ringInset }}
            viewBox={`0 0 ${ringSize} ${ringSize}`}
            aria-hidden="true"
          >
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              fill="none"
              stroke={borderColor}
              strokeWidth={strokeWidth}
              strokeDasharray={`${arcLength} ${circumference}`}
              transform={`rotate(112 ${ringSize / 2} ${ringSize / 2})`}
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        );
      }
      return (
        <div
          className="absolute rounded-full border pointer-events-none"
          style={{
            inset: ringInset,
            borderColor
          }}
        />
      );
    };

    switch (surface.decoration) {
      case 'concentric-ribs':
        return (
          <>
            <div className="absolute inset-[12px] rounded-full border border-[#262626] bg-[#1a1a1a]/60 shadow-[inset_0_2px_6px_rgba(0,0,0,0.9)] pointer-events-none" />
            <div className="absolute inset-[26px] rounded-full border border-[#2b2b2b] bg-[#151515]/58 shadow-[inset_0_2px_6px_rgba(0,0,0,0.9)] pointer-events-none" />
            <div className="absolute inset-[40px] rounded-full border border-[#373737] bg-[#111]/56 shadow-[inset_0_2px_6px_rgba(0,0,0,0.88)] pointer-events-none" />
            <div className="absolute inset-[54px] rounded-full border border-[#414141] bg-[#0a0a0a]/54 shadow-[inset_0_2px_6px_rgba(0,0,0,0.86)] pointer-events-none" />
          </>
        );
      case 'obsidian-aperture':
        return (
          <>
            <div
              className="absolute inset-[10px] rounded-full opacity-70 pointer-events-none"
              style={{
                background: 'repeating-conic-gradient(from -9deg, rgba(255,255,255,0.055) 0deg 8deg, rgba(0,0,0,0.42) 8deg 24deg, rgba(255,255,255,0.025) 24deg 30deg)',
                WebkitMask: 'radial-gradient(circle, transparent 0 36%, #000 37% 89%, transparent 90%)',
                mask: 'radial-gradient(circle, transparent 0 36%, #000 37% 89%, transparent 90%)'
              }}
            />
            <div className="absolute inset-[22px] rounded-full border border-white/10 shadow-[inset_0_8px_18px_rgba(0,0,0,0.74)] pointer-events-none" />
            <div className="absolute inset-[72px] rounded-full border border-[#d4af37]/20 shadow-[0_0_12px_rgba(212,175,55,0.08)] pointer-events-none" />
          </>
        );
      case 'nocturne-brass':
        return (
          <>
            {surface.outerRim && (
              <>
                <div className="absolute inset-0 rounded-full pointer-events-none" />
                {surface.ringOnlyShadow && (
                  <div
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      boxShadow: surface.ringBottomShadow
                        ? surface.ringFlavorMatch === 'soft'
                          ? 'inset 2px 2px 7px rgba(0,0,0,0.82), inset 0 -4px 7px rgba(0,0,0,0.66), inset -1px -1px 2px rgba(215,154,92,0.12)'
                          : surface.ringFlavorMatch
                          ? 'inset 3px 3px 10px rgba(0,0,0,0.9), inset 0 -6px 10px rgba(0,0,0,0.76), inset -1px -1px 2px rgba(215,154,92,0.1)'
                          : 'inset 2px 2px 5px rgba(0,0,0,0.72), inset 0 -3px 5px rgba(0,0,0,0.58), inset -1px -1px 2px rgba(215,154,92,0.14)'
                        : 'inset 2px 2px 5px rgba(0,0,0,0.72), inset -1px -1px 2px rgba(215,154,92,0.16)',
                      WebkitMask: `radial-gradient(circle, transparent 0 calc(50% - ${rimInnerInset}px), #000 calc(50% - ${rimInnerInset}px) 100%)`,
                      mask: `radial-gradient(circle, transparent 0 calc(50% - ${rimInnerInset}px), #000 calc(50% - ${rimInnerInset}px) 100%)`
                    }}
                  />
                )}
                {surface.ringSeatBevel && (
                  <>
                    <div
                      className="absolute inset-0 rounded-full pointer-events-none"
                      style={{
                        boxShadow: surface.ringFlavorMatch
                          ? surface.ringFlavorMatch === 'soft'
                            ? 'inset 0 0 0 1px rgba(24,12,6,0.88), inset 0 0 0 2px rgba(79,44,22,0.62), inset 0 0 0 3px rgba(173,111,58,0.18), inset 0 0 0 4px rgba(255,220,160,0.045)'
                            : 'inset 0 0 0 2px rgba(14,7,3,0.92), inset 0 0 0 4px rgba(63,34,16,0.72), inset 0 0 0 5px rgba(173,111,58,0.16), inset 0 0 0 6px rgba(255,220,160,0.035)'
                          : 'inset 0 0 0 1px rgba(43,23,11,0.78), inset 0 0 0 2px rgba(120,80,42,0.48), inset 0 0 0 3px rgba(255,220,160,0.06)',
                        WebkitMask: `radial-gradient(circle, transparent 0 calc(50% - ${rimInnerInset}px), #000 calc(50% - ${rimInnerInset}px) 100%)`,
                        mask: `radial-gradient(circle, transparent 0 calc(50% - ${rimInnerInset}px), #000 calc(50% - ${rimInnerInset}px) 100%)`
                      }}
                    />
                    <div
                      className="absolute rounded-full pointer-events-none"
                      style={{
                        inset: rimInnerInset,
                        boxShadow: surface.ringFlavorMatch
                          ? surface.ringFlavorMatch === 'soft'
                            ? '0 0 0 1px rgba(10,6,3,0.96), 0 0 0 2px rgba(61,33,16,0.72), 0 1px 0 rgba(255,205,140,0.08), 0 -1px 0 rgba(0,0,0,0.55)'
                            : '0 0 0 2px rgba(6,3,1,0.98), 0 0 0 4px rgba(42,22,10,0.82), 0 1px 0 rgba(255,205,140,0.06), 0 -1px 0 rgba(0,0,0,0.68)'
                          : '0 0 0 1px rgba(28,14,6,0.88), 0 1px 0 rgba(255,205,140,0.1), 0 -1px 0 rgba(0,0,0,0.38)'
                      }}
                    />
                  </>
                )}
              </>
            )}
            <div
              className="absolute inset-[18px] rounded-full pointer-events-none"
              style={{
                background: 'repeating-conic-gradient(from 0deg, rgba(212,175,55,0.42) 0deg 1.8deg, transparent 1.8deg 12deg)',
                WebkitMask: 'radial-gradient(circle, transparent 0 77%, #000 78% 82%, transparent 83%)',
                mask: 'radial-gradient(circle, transparent 0 77%, #000 78% 82%, transparent 83%)'
              }}
            />
            {renderGuideRing('large', 34, surface.softNocturneRings ? 'rgba(212,175,55,0.2)' : 'rgba(212,175,55,0.25)')}
            {renderGuideRing('small', 76, surface.softNocturneRings ? 'rgba(212,175,55,0.16)' : 'rgba(212,175,55,0.18)')}
            <div className="absolute inset-[104px] rounded-full border pointer-events-none" style={{ borderColor: surface.softNocturneRings ? 'rgba(212,175,55,0.11)' : 'rgba(212,175,55,0.12)' }} />
          </>
        );
      case 'smoked-glass':
        return (
          <>
            <div className="absolute inset-[14px] rounded-full border border-white/12 bg-white/[0.025] shadow-[inset_0_2px_14px_rgba(255,255,255,0.08),inset_0_-14px_24px_rgba(0,0,0,0.42)] pointer-events-none" />
            <div className="absolute left-[20%] top-[10%] h-[68px] w-[150px] rotate-[-18deg] rounded-full bg-white/[0.075] blur-[10px] pointer-events-none" />
            <div className="absolute inset-[52px] rounded-full border border-[#f4ead6]/10 pointer-events-none" />
            <div className="absolute inset-[92px] rounded-full border border-[#799e7c]/16 pointer-events-none" />
          </>
        );
      case 'carbon-weave':
        return (
          <>
            <div
              className="absolute inset-0 rounded-full opacity-35 pointer-events-none"
              style={{
                backgroundImage: 'repeating-linear-gradient(45deg, rgba(212,175,55,0.11) 0px, rgba(212,175,55,0.11) 2px, transparent 2px, transparent 8px), repeating-linear-gradient(-45deg, rgba(0,0,0,0.42) 0px, rgba(0,0,0,0.42) 2px, transparent 2px, transparent 8px)'
              }}
            />
            <div className="absolute inset-[18px] rounded-full border border-[#d4af37]/16 shadow-[inset_0_1px_8px_rgba(212,175,55,0.045)] pointer-events-none" />
            <div className="absolute inset-[64px] rounded-full border border-[#d4af37]/20 pointer-events-none" />
            <div className="absolute inset-[92px] rounded-full border border-black/65 pointer-events-none" />
          </>
        );
      case 'tape-reel':
        return (
          <>
            <div className="absolute inset-[18px] rounded-full border border-[#d4af37]/38 shadow-[inset_0_10px_18px_rgba(0,0,0,0.55),0_0_9px_rgba(212,175,55,0.08)] pointer-events-none" />
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="absolute left-1/2 top-1/2 h-9 w-5 origin-center rounded-full bg-black/38 shadow-[inset_0_3px_8px_rgba(0,0,0,0.85),0_1px_0_rgba(255,255,255,0.05)] pointer-events-none" style={{ transform: `translate(-50%, -50%) rotate(${i * 60}deg) translateY(-103px)` }} />
            ))}
          </>
        );
      case 'bakelite-halo':
        return (
          <>
            <div className="absolute inset-[12px] rounded-full border border-[#5a331d]/50 shadow-[inset_0_4px_12px_rgba(255,178,102,0.06),inset_0_-14px_24px_rgba(0,0,0,0.58)] pointer-events-none" />
            <div
              className="absolute inset-[30px] rounded-full pointer-events-none"
              style={{
                background: 'repeating-conic-gradient(from 4deg, rgba(212,175,55,0.34) 0deg 7deg, transparent 7deg 28deg)',
                WebkitMask: 'radial-gradient(circle, transparent 0 74%, #000 75% 80%, transparent 81%)',
                mask: 'radial-gradient(circle, transparent 0 74%, #000 75% 80%, transparent 81%)'
              }}
            />
            <div className="absolute inset-[76px] rounded-full border border-[#d4af37]/18 pointer-events-none" />
          </>
        );
      case 'patina-night':
        return (
          <>
            <div className="absolute inset-0 rounded-full opacity-20 mix-blend-overlay pointer-events-none" style={{ backgroundImage: RUBBER_MATTE_NOISE }} />
            <div className="absolute left-[12%] top-[23%] h-[72px] w-[120px] rotate-[-18deg] rounded-full bg-[#7aa678]/10 blur-[14px] pointer-events-none" />
            <div className="absolute right-[10%] bottom-[18%] h-[92px] w-[124px] rotate-[16deg] rounded-full bg-[#d4af37]/8 blur-[18px] pointer-events-none" />
            <div className="absolute inset-[20px] rounded-full border border-[#7aa678]/20 pointer-events-none" />
            <div className="absolute inset-[58px] rounded-full border border-[#d4af37]/14 pointer-events-none" />
            <div className="absolute inset-[94px] rounded-full border border-[#7aa678]/14 pointer-events-none" />
          </>
        );
      case 'broadcast-radar':
        return (
          <>
            <div className="absolute inset-[20px] rounded-full border border-[#799e7c]/20 pointer-events-none" />
            <div className="absolute inset-[50px] rounded-full border border-[#799e7c]/14 pointer-events-none" />
            <div className="absolute inset-[82px] rounded-full border border-[#d4af37]/12 pointer-events-none" />
            <div
              className="center-radar-sweep absolute inset-0 rounded-full pointer-events-none opacity-40"
              style={{
                background: 'conic-gradient(from 0deg, transparent 0deg, rgba(121,158,124,0.16) 18deg, transparent 42deg)',
                WebkitMask: 'radial-gradient(circle, transparent 0 36%, #000 37% 91%, transparent 92%)',
                mask: 'radial-gradient(circle, transparent 0 36%, #000 37% 91%, transparent 92%)'
              }}
            />
            {Array.from({ length: 16 }).map((_, i) => (
              <span key={i} className="absolute left-1/2 top-1/2 h-[6px] w-px origin-center bg-[#799e7c]/30 pointer-events-none" style={{ transform: `translate(-50%, -50%) rotate(${i * 22.5}deg) translateY(-136px)` }} />
            ))}
          </>
        );
      default:
        return null;
    }
  };

  const originalMiddleKnobBackground = `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.1) 20%, rgba(0,0,0,0.4) 80%, rgba(0,0,0,0.8) 100%), conic-gradient(from 180deg at 50% 50%, ${originalCopperTuning.darkMetalColor} 0deg, ${originalCopperTuning.lightMetalColor} 45deg, ${originalCopperTuning.darkMetalColor} 90deg, ${originalCopperTuning.lightMetalColor} 135deg, ${originalCopperTuning.darkMetalColor} 180deg, ${originalCopperTuning.lightMetalColor} 225deg, ${originalCopperTuning.darkMetalColor} 270deg, ${originalCopperTuning.lightMetalColor} 315deg, ${originalCopperTuning.darkMetalColor} 360deg)`;
  const tunedOriginalMiddleKnobShadow = `15px 15px 30px rgba(0,0,0,${originalCopperTuning.baseOuterShadowOpacity}), inset 2px 2px 5px rgba(255,255,255,${originalCopperTuning.baseInnerHighlightOpacity}), inset -4px -4px 8px rgba(0,0,0,${originalCopperTuning.baseInnerShadowOpacity})`;
  const tunedOriginalMiddleKnobOverlayBackground = `linear-gradient(135deg, rgba(0,0,0,${originalCopperTuning.overlayDarkOpacity}) 0%, rgba(255,255,255,${originalCopperTuning.overlayLightOpacity}) 100%)`;
  const tunedOriginalMiddleKnobOverlayShadow = `inset 2px 2px 6px rgba(0,0,0,${originalCopperTuning.overlayInnerShadowOpacity}), 0 1px 1px rgba(255,255,255,${originalCopperTuning.overlayOuterHighlightOpacity})`;
  const originalMiddleKnobShadow = tunedOriginalMiddleKnobShadow;
  const middleKnobBackground = activeMiddleKnobStyle.useOriginalBackground ? originalMiddleKnobBackground : activeMiddleKnobStyle.background || originalMiddleKnobBackground;
  const middleKnobShadow = activeMiddleKnobStyle.shadow || originalMiddleKnobShadow;
  const middleKnobIsOriginal = !activeMiddleKnobStyle.background;
  const originalMiddleKnobOverlayInset = activeMiddleKnobStyle.name === 'Original Copper'
    ? `${originalCopperTuning.ringInset}px`
    : (activeMiddleKnobStyle.originalInset ?? '8px');

  const renderOuterRingScale = () => {
    const style = OUTER_RING_SCALES[outerRingScaleStyle] || OUTER_RING_SCALES[0];
    if (style.type === 'none') return null;

    const isOutside = style.position === 'outside';
    const isInside = style.position === 'inside';
    const scaleRadius = isOutside ? (outerSize / 2) + 8 : (isInside ? (outerSize / 2) - rimInnerInset - 6 : (outerSize / 2) - (rimInnerInset / 2));
    const marks = [];
    const count = style.count || 11;
    const stepAngle = 270 / (count - 1);
    
    for (let i = 0; i < count; i++) {
      const angle = -135 + i * stepAngle;
      const isCenter = Math.abs(angle) < 0.1;
      const isMajor = style.type.startsWith('alternating') && i % 5 === 0;
      const color = style.highlight && isCenter ? style.highlight : style.color;
      
      let markElement = null;
      if (style.type === 'dots' || style.type === 'dots-inner' || style.type === 'studs') {
        let r = style.radius || 1.5;
        if (style.highlightCenter && isCenter) r *= 1.4;
        const cy = style.type === 'dots-inner' ? (outerSize / 2) - rimInnerInset + r + 2 : scaleRadius;
        
        markElement = <circle cx="0" cy={-cy} r={r} fill={color} />;
      } else if (style.type === 'lines' || style.type === 'lines-outer' || style.type === 'graduated') {
        let len = style.length || 6;
        if (style.type === 'graduated') {
          len = i % 2 === 0 ? 6 : 4;
          if (isCenter) len = 8;
        }
        const w = style.width || 1.5;
        const y1 = style.type === 'lines-outer' ? (outerSize / 2) - len : scaleRadius - len / 2;
        const y2 = style.type === 'lines-outer' ? (outerSize / 2) : scaleRadius + len / 2;
        
        markElement = <line x1="0" y1={-y1} x2="0" y2={-y2} stroke={color} strokeWidth={w} strokeLinecap="round" />;
      } else if (style.type === 'sparse-tape-scale') {
        const len = i % 2 === 0 ? 6 : 3.5;
        const w = i % 2 === 0 ? 1.2 : 0.85;
        const y1 = scaleRadius - len / 2;
        const y2 = scaleRadius + len / 2;
        markElement = <line x1="0" y1={-y1} x2="0" y2={-y2} stroke={color} strokeWidth={w} strokeLinecap="round" />;
      } else if (style.type === 'alternating-dots') {
        const r = isMajor ? (style.radiusL || 2) : (style.radiusS || 1);
        markElement = <circle cx="0" cy={-scaleRadius} r={r} fill={color} />;
      } else if (style.type === 'alternating-lines') {
        const len = isMajor ? (style.lengthL || 6) : (style.lengthS || 3);
        const w = style.width || 1.5;
        markElement = <line x1="0" y1={-scaleRadius + len/2} x2="0" y2={-scaleRadius - len/2} stroke={color} strokeWidth={w} strokeLinecap="round" />;
      } else if (style.type === 'diamonds') {
        const r = style.radius || 1.5;
        markElement = <polygon points={`0,${-scaleRadius-r} ${r},${-scaleRadius} 0,${-scaleRadius+r} ${-r},${-scaleRadius}`} fill={color} />;
      } else if (style.type === 'dashes') {
        const len = style.length || 3;
        const w = style.width || 0.5;
        markElement = <line x1={-len/2} y1={-scaleRadius} x2={len/2} y2={-scaleRadius} stroke={color} strokeWidth={w} strokeLinecap="round" />;
      } else if (style.type === 'double-dots') {
        const r = style.radius || 0.8;
        const spacing = 1.5;
        markElement = (
          <>
            <circle cx={-spacing} cy={-scaleRadius} r={r} fill={color} />
            <circle cx={spacing} cy={-scaleRadius} r={r} fill={color} />
          </>
        );
      } else if (style.type === 'wedges') {
        const r = style.radius || 2;
        markElement = <polygon points={`${-r},${-scaleRadius-r} ${r},${-scaleRadius-r} 0,${-scaleRadius+r}`} fill={color} />;
      } else if (style.type === 'sub-dial-arc') {
        const r = style.radius || 1;
        markElement = <circle cx="0" cy={-scaleRadius} r={r} fill={color} />;
      } else if (style.type === 'flutter-arcs') {
        const w = style.width || 1;
        const seed = Math.sin(i * 12.9898) * 43758.5453;
        const rand = seed - Math.floor(seed);
        const length = 4 + rand * 4;
        const sway = (rand - 0.5) * 4;
        markElement = <path d={`M 0,${-scaleRadius - length/2} Q ${sway},${-scaleRadius} 0,${-scaleRadius + length/2}`} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" />;
      } else if (style.type === 'wabi-sabi-flow') {
        const seed = Math.cos(i * 4.2) * 234.1;
        const rand = seed - Math.floor(seed);
        const r = (style.radius || 1.5) + (rand - 0.5) * 0.8;
        markElement = <path d={`M 0,${-scaleRadius-r*1.5} C ${r},${-scaleRadius-r} ${r},${-scaleRadius+r} 0,${-scaleRadius+r} C ${-r},${-scaleRadius+r} ${-r},${-scaleRadius-r} 0,${-scaleRadius-r*1.5}`} fill={color} />;
      } else if (style.type === 'unstable-clusters') {
        const seed1 = Math.sin(i * 1.1);
        const seed2 = Math.cos(i * 2.2);
        const seed3 = Math.sin(i * 3.3);
        const r = style.radius || 0.6;
        markElement = (
          <>
            <circle cx={seed1 * 1.5} cy={-scaleRadius + seed2 * 1.5} r={r} fill={color} />
            <circle cx={seed2 * 2} cy={-scaleRadius - seed1 * 2} r={r * 0.8} fill={color} opacity={0.8} />
            {(seed3 > 0) && <circle cx={seed3 * -2} cy={-scaleRadius + seed3 * 2} r={r * 1.2} fill={color} opacity={0.6} />}
          </>
        );
      } else if (style.type === 'cinematic-embers') {
        const seed = Math.sin(i * 5.5);
        const r = style.radius || 1.2;
        const opacity = 0.4 + Math.abs(seed) * 0.6;
        const isDiamond = seed > 0;
        markElement = isDiamond ? 
          <polygon points={`0,${-scaleRadius-r} ${r},${-scaleRadius} 0,${-scaleRadius+r} ${-r},${-scaleRadius}`} fill={color} opacity={opacity} /> :
          <circle cx="0" cy={-scaleRadius} r={r} fill={color} opacity={opacity} />;
      } else if (style.type === 'magnetic-bleed') {
        const w = style.width || 2;
        markElement = (
          <>
            <line x1="0" y1={-scaleRadius-2} x2="0" y2={-scaleRadius+2} stroke={color} strokeWidth={w} strokeLinecap="round" />
            <line x1="1.5" y1={-scaleRadius-1.5} x2="1.5" y2={-scaleRadius+1.5} stroke={color} strokeWidth={w*0.8} opacity={0.5} strokeLinecap="round" />
            <line x1="3" y1={-scaleRadius-1} x2="3" y2={-scaleRadius+1} stroke={color} strokeWidth={w*0.5} opacity={0.2} strokeLinecap="round" />
          </>
        );
      } else if (style.type === 'divots') {
        const r = style.radius || 2;
        markElement = <circle cx="0" cy={-scaleRadius} r={r} fill={color} />;
      }

      if (markElement) {
        marks.push(
          <g key={i} style={{ transform: `rotate(${angle}deg)` }}>
            {markElement}
          </g>
        );
      }
    }

    if (style.type === 'sub-dial-arc') {
      const startAngle = -135 * (Math.PI / 180);
      const endAngle = 135 * (Math.PI / 180);
      const x1 = Math.sin(startAngle) * scaleRadius;
      const y1 = -Math.cos(startAngle) * scaleRadius;
      const x2 = Math.sin(endAngle) * scaleRadius;
      const y2 = -Math.cos(endAngle) * scaleRadius;
      // SVG path: Move to start, Draw Arc (rx ry x-axis-rotation large-arc-flag sweep-flag x y)
      // Large arc flag = 1 (270 degrees is > 180), sweep flag = 1 (clockwise)
      marks.push(
        <g key="arc" style={{ transform: `rotate(0deg)` }}>
          <path d={`M ${x1},${y1} A ${scaleRadius} ${scaleRadius} 0 1 1 ${x2},${y2}`} fill="none" stroke={style.color} strokeWidth="0.5" opacity="0.5" />
        </g>
      );
    }

    const filterId = `outerScaleGlow-${outerRingScaleStyle}`;
    const filterIdEngraved = `outerScaleEngraved-${outerRingScaleStyle}`;
    
    const svgSize = 380;
    
    return (
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none z-30" 
        viewBox={`-${svgSize/2} -${svgSize/2} ${svgSize} ${svgSize}`}
      >
        <defs>
          {style.glow && (
            <filter id={filterId} x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="1" stdDeviation="0.35" floodColor="#000000" floodOpacity="0.9" />
            </filter>
          )}
          {style.engraved && (
            <filter id={filterIdEngraved} x="-50%" y="-50%" width="200%" height="200%">
              {/* Highlight catching the bottom inner lip of the cut */}
              <feDropShadow dx="0" dy="1" stdDeviation="0.3" floodColor="rgba(255,255,255,0.25)" floodOpacity="1" />
              {/* Slight dark blur to soften the top edge of the cut */}
              <feDropShadow dx="0" dy="-0.5" stdDeviation="0.5" floodColor="#000000" floodOpacity="0.35" />
            </filter>
          )}
        </defs>
        <g 
          filter={style.glow ? `url(#${filterId})` : (style.engraved ? `url(#${filterIdEngraved})` : undefined)}
          opacity={style.opacity ?? 1}
          style={style.glow ? { paintOrder: 'stroke', stroke: 'rgba(38,22,12,0.26)', strokeWidth: 0.65 } : undefined}
        >
          {marks}
        </g>
      </svg>
    );
  };

  return (
    <div className="relative flex justify-center items-center z-20" style={{ width: 380, height: 380 }}>
      <div className="absolute rounded-full cursor-ns-resize flex justify-center items-center group z-10 overflow-visible" style={{ width: outerSize, height: outerSize, backgroundColor: surface.outerRim ? (surface.rimBackgroundColor || rimFillColor) : surface.backgroundColor || '#1f1e1d', backgroundImage: surface.outerRim ? (surface.outerRimTexture ? surface.rimBackgroundImage : `radial-gradient(circle, transparent 0 calc(50% - ${rimInnerInset}px), ${rimFillColor} calc(50% - ${rimInnerInset}px) 100%)`) : surface.backgroundImage || CENTER_DIAL_SURFACES[0].backgroundImage, backgroundSize: surface.outerRimTexture ? surface.rimBackgroundSize : undefined, backgroundPosition: surface.outerRimTexture ? 'center' : undefined, backgroundBlendMode: surface.outerRimTexture ? 'normal, normal' : surface.backgroundBlendMode, boxShadow: guardedOuterShadow }}
        onPointerDown={handleSpreadDown} onPointerMove={handleSpreadMove} onPointerUp={handleSpreadUp} onPointerCancel={handleSpreadUp} onDoubleClick={onDoubleClickSpread}>
        {surface.outerRim && (
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              inset: rimInnerInset,
              backgroundColor: surface.backgroundColor || '#1f1e1d',
              backgroundImage: surface.backgroundImage || CENTER_DIAL_SURFACES[0].backgroundImage,
              backgroundBlendMode: surface.backgroundBlendMode
            }}
          />
        )}
        {(!surface.hideGenericGrooves || surface.allowGrooveOverlay) && grooveStyle && grooveStyle.backgroundImage !== 'none' && (
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              inset: surface.outerRim ? rimInnerInset : 0,
              backgroundImage: grooveStyle.backgroundImage,
              opacity: grooveStyle.opacity ?? 1,
              mixBlendMode: 'multiply'
            }}
          />
        )}
        {renderSurfaceDecoration()}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 ${outerSize} ${outerSize}`}>
          {renderDialMarkStyle()}
          {renderDialNumberStyle()}
          {renderDialLabels()}
        </svg>
        <div className={`absolute inset-0 pointer-events-none ${isDraggingSpread ? 'transition-transform duration-[45ms] ease-out' : 'transition-transform duration-300'}`} style={{ transform: `rotate(${spreadRot}deg)` }}>
          {renderSpreadPointer()}
        </div>
        <WobblyAura drift={drift} spread={spread} active={auraActive} rate={DRIFT_VISUAL_FIXED_RATE} mode={mode} animationStyle={animationStyle} knobFlutterFilledColors={knobFlutterFilledColors} />
        <CenterDepthShadowLayer
          settings={centerDepthModel}
          canvasSize={outerSize}
          centerX={outerSize / 2}
          centerY={outerSize / 2}
          className="absolute inset-0 z-[18] h-full w-full pointer-events-none overflow-visible"
        />
          <div className="absolute rounded-full cursor-ns-resize flex justify-center items-center hover:brightness-105 transition-all z-20" style={{ width: 140, height: 140, background: middleKnobBackground, boxShadow: middleKnobShadow }}
          onPointerDown={handleDriftDown} onPointerMove={handleDriftMove} onPointerUp={handleDriftUp} onPointerCancel={handleDriftUp} onDoubleClick={onDoubleClickDrift}>
          {middleKnobIsOriginal && (
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                inset: originalMiddleKnobOverlayInset,
                background: tunedOriginalMiddleKnobOverlayBackground,
                boxShadow: tunedOriginalMiddleKnobOverlayShadow
              }}
            />
          )}
          {!middleKnobIsOriginal && (
            <>
              {activeMiddleKnobStyle.centerDiscInset && (
                <div
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    inset: activeMiddleKnobStyle.centerDiscInset,
                    background: activeMiddleKnobStyle.centerDiscBackground || middleKnobBackground,
                    boxShadow: activeMiddleKnobStyle.centerDiscShadow || 'inset 1px 1px 2px rgba(255,255,255,0.18), inset -2px -2px 4px rgba(0,0,0,0.42)'
                  }}
                />
              )}
              {activeMiddleKnobStyle.originalCenterOverlay && (
                <div
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    inset: activeMiddleKnobStyle.originalCenterOverlayInset ?? 2,
                    background: 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(255,255,255,0.2) 100%)',
                    boxShadow: activeMiddleKnobStyle.originalCenterOverlayBoxShadow || 'inset 2px 2px 6px rgba(0,0,0,0.8), 0 1px 1px rgba(255,255,255,0.5)',
                    opacity: activeMiddleKnobStyle.originalCenterOverlayOpacity ?? 1
                  }}
                />
              )}
              {activeMiddleKnobStyle.outerBackground && (
                <div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    background: activeMiddleKnobStyle.outerBackground,
                    WebkitMask: activeMiddleKnobStyle.outerMask,
                    mask: activeMiddleKnobStyle.outerMask
                  }}
                />
              )}
              <div
                className="absolute rounded-full pointer-events-none"
                style={{
                  inset: activeMiddleKnobStyle.edgeInset ?? 5,
                  border: activeMiddleKnobStyle.edgeBorder,
                  boxShadow: activeMiddleKnobStyle.edgeShadow
                }}
              />
              {activeMiddleKnobStyle.edgeTexture && (
                <div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    background: activeMiddleKnobStyle.edgeTexture,
                    opacity: activeMiddleKnobStyle.edgeOpacity ?? 0.42,
                    WebkitMask: activeMiddleKnobStyle.edgeMask,
                    mask: activeMiddleKnobStyle.edgeMask,
                    mixBlendMode: activeMiddleKnobStyle.edgeBlendMode || 'screen'
                  }}
                />
              )}
              {activeMiddleKnobStyle.centerTexture && (
                <div
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    inset: activeMiddleKnobStyle.centerTextureInset ?? 0,
                    background: activeMiddleKnobStyle.centerTexture,
                    opacity: activeMiddleKnobStyle.centerOpacity ?? 0.4,
                    WebkitMask: activeMiddleKnobStyle.centerMask,
                    mask: activeMiddleKnobStyle.centerMask,
                    mixBlendMode: activeMiddleKnobStyle.centerBlendMode || 'soft-light'
                  }}
                />
              )}
              {activeMiddleKnobStyle.innerInset && (
                <div
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    inset: activeMiddleKnobStyle.innerInset,
                    border: '1px solid rgba(42,31,15,0.22)',
                    opacity: activeMiddleKnobStyle.innerOpacity ?? 0.24
                  }}
                />
              )}
              <div
                className="absolute rounded-full pointer-events-none"
                style={{
                  inset: activeMiddleKnobStyle.sheenInset ?? 13,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(0,0,0,0.13))',
                  opacity: activeMiddleKnobStyle.sheenOpacity ?? 0.34
                }}
              />
            </>
          )}
          <KnobFlutterSpillLight
            drift={drift}
            rate={DRIFT_VISUAL_FIXED_RATE}
            animationStyle={animationStyle}
            filledColors={knobFlutterFilledColors}
          />
          <div className={`absolute inset-0 pointer-events-none ${isDraggingDrift ? 'transition-transform duration-[45ms] ease-out' : 'transition-transform duration-300'}`} style={{ transform: `rotate(${driftRot}deg)` }}>
            <div
              className="absolute top-[12%] left-1/2 -translate-x-1/2 w-1.5 h-7 rounded-full opacity-95"
              style={{
                background: activeMiddleKnobStyle.pointerStyle?.background || '#1a1a1a',
                boxShadow: activeMiddleKnobStyle.pointerStyle?.boxShadow || 'inset 0 2px 4px rgba(0,0,0,0.9), 0 1px 1px rgba(255,255,255,0.4)'
              }}
            />
          </div>
        </div>
      </div>
      {renderOuterRingScale()}
      
      {/* Spread Readout */}
      <div className={`absolute bottom-[8px] left-1/2 -translate-x-1/2 pointer-events-none transition-opacity duration-300 z-50 ${isDraggingSpread ? 'opacity-100' : 'opacity-0'}`}>
        {renderReadout((KNOB_READOUT_STYLES[readoutStyleIndex] || KNOB_READOUT_STYLES[0]).type, formatKnobValue('SPREAD', spread))}
      </div>

      {/* Drift Readout */}
      <div className={`absolute top-[65%] left-1/2 -translate-x-1/2 translate-y-[31px] pointer-events-none transition-opacity duration-300 z-50 ${isDraggingDrift ? 'opacity-100' : 'opacity-0'}`}>
        {renderReadout((KNOB_READOUT_STYLES[readoutStyleIndex] || KNOB_READOUT_STYLES[0]).type, formatKnobValue('DRIFT', drift))}
      </div>
    </div>
  );
};

// --- Premium Top Preset Bar ---
const TopPresetBar = ({
  factoryPresets,
  userPresets,
  activePresetName,
  topBarStyle,
  topBarCustomStyles,
  hqMode,
  cableToneEnabled,
  onPrev,
  onNext,
  onLoadFactory,
  onLoadUser,
  onSave,
  onToggleHq,
  onToggleCable
}) => {
  const [openMenu, setOpenMenu] = useState(false);
  const [showSave, setShowSave] = useState(false);
  const [saveName, setSaveName] = useState('');
  const menuButtonRef = useRef(null);
  const menuRef = useRef(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const style = TOP_BAR_STYLES[topBarStyle] || TOP_BAR_STYLES[0];
  const customStyle = topBarCustomStyles?.[topBarStyle] || DEFAULT_TOP_BAR_CUSTOM_STYLES[topBarStyle] || DEFAULT_TOP_BAR_CUSTOM_STYLES[0];
  const defaultCustomStyle = DEFAULT_TOP_BAR_CUSTOM_STYLES[topBarStyle] || DEFAULT_TOP_BAR_CUSTOM_STYLES[0];
  const outlineWidth = Math.max(0, Math.min(4, Number(customStyle.outlineWidth) || 0));
  const outlineChanged = outlineWidth !== defaultCustomStyle.outlineWidth;
  const barColorChanged = customStyle.barColor !== defaultCustomStyle.barColor;
  const outlineColorChanged = customStyle.outlineColor !== defaultCustomStyle.outlineColor;
  const buttonColorChanged = customStyle.buttonColor !== defaultCustomStyle.buttonColor;
  const activeColorChanged = customStyle.activeColor !== defaultCustomStyle.activeColor;
  const copperActiveColor = customStyle.copperActiveColor || customStyle.activeColor;
  const copperActiveColorChanged = copperActiveColor !== defaultCustomStyle.copperActiveColor;
  const mutedTextChanged = customStyle.mutedTextColor !== defaultCustomStyle.mutedTextColor;
  const dropdownColorChanged = customStyle.dropdownColor !== defaultCustomStyle.dropdownColor;
  const engravedSurfaceShadow = topBarStyle === 1
    ? 'inset 0 1px 0 rgba(255,255,255,0.16), inset 0 -1px 0 rgba(78,52,28,0.18)'
    : 'inset 0 1px 0 rgba(225,246,240,0.045), inset 0 -1px 0 rgba(0,0,0,0.42)';
  const engravedControlShadow = topBarStyle === 1
    ? 'inset 0 1px 1px rgba(255,255,255,0.18), inset 0 -1px 1px rgba(76,50,26,0.22)'
    : 'inset 0 1px 1px rgba(230,255,250,0.045), inset 0 -1px 1px rgba(0,0,0,0.48)';
  const shellStyle = {
    ...(style.surfaceStyle || {}),
    boxShadow: engravedSurfaceShadow,
    ...(barColorChanged ? { background: customStyle.barColor } : {}),
    ...(outlineColorChanged ? { borderColor: customStyle.outlineColor } : {}),
    ...(outlineChanged ? { borderWidth: `${outlineWidth}px` } : {})
  };
  const menuInlineStyle = {
    ...(style.menuStyle || {}),
    boxShadow: engravedControlShadow,
    ...(dropdownColorChanged ? { background: customStyle.dropdownColor } : {}),
    ...(outlineColorChanged ? { borderColor: customStyle.outlineColor } : {}),
    ...(outlineChanged ? { borderWidth: `${outlineWidth}px` } : {}),
    '--preset-option-hover-bg': customStyle.hoverRowColor,
    '--preset-option-hover-text': customStyle.hoverTextColor,
    '--preset-option-selected-text': customStyle.selectedTextColor
  };
  const buttonInlineStyle = {
    boxShadow: engravedControlShadow,
    ...(buttonColorChanged ? { backgroundColor: customStyle.buttonColor } : {}),
    ...(outlineColorChanged ? { borderColor: customStyle.outlineColor } : {}),
    ...(outlineChanged ? { borderWidth: `${outlineWidth}px` } : {}),
    ...(mutedTextChanged ? { color: customStyle.mutedTextColor } : {})
  };
  const activeButtonInlineStyle = {
    ...(activeColorChanged ? {
      backgroundColor: `${customStyle.activeColor}30`,
      borderColor: customStyle.activeColor
    } : {}),
    boxShadow: engravedControlShadow,
    ...(outlineChanged ? { borderWidth: `${outlineWidth}px` } : {}),
    color: customStyle.textColor,
  };
  const copperActiveButtonInlineStyle = {
    ...activeButtonInlineStyle,
    ...(copperActiveColorChanged ? {
      backgroundColor: `${copperActiveColor}34`,
      borderColor: copperActiveColor
    } : {})
  };
  const handleSave = () => { if (saveName.trim()) { onSave(saveName.trim()); setShowSave(false); setSaveName(''); } };

  useEffect(() => {
    if (!openMenu) return;
    const updateAnchor = () => {
      const rect = menuButtonRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMenuAnchor({ left: rect.left + rect.width / 2, top: rect.bottom + 7, width: rect.width });
    };
    updateAnchor();
    window.addEventListener('resize', updateAnchor);
    window.addEventListener('scroll', updateAnchor, true);
    return () => {
      window.removeEventListener('resize', updateAnchor);
      window.removeEventListener('scroll', updateAnchor, true);
    };
  }, [openMenu]);

  useEffect(() => {
    if (!openMenu) return;
    const handlePointerDown = (event) => {
      if (menuRef.current?.contains(event.target) || menuButtonRef.current?.contains(event.target)) return;
      setOpenMenu(false);
    };
    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, [openMenu]);

  const OptionButton = ({ children, active, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className={`top-preset-option w-full px-3 py-2 text-left text-[9px] font-black uppercase tracking-[0.16em] transition-colors ${active ? 'top-preset-option-active' : ''}`}
      style={{
        color: active ? customStyle.selectedTextColor : customStyle.mutedTextColor,
        backgroundColor: 'transparent'
      }}
    >
      {children}
    </button>
  );

  const renderMenu = () => {
    if (!openMenu || !menuAnchor) return null;
    return createPortal(
      <div
        ref={menuRef}
        className={`fixed z-[9999] max-h-[300px] w-[236px] -translate-x-1/2 overflow-hidden rounded-[18px] border shadow-[0_18px_34px_rgba(0,0,0,0.45)] backdrop-blur-2xl ${style.menu}`}
        style={{ left: menuAnchor.left, top: menuAnchor.top, ...menuInlineStyle }}
      >
        <div className="max-h-[310px] overflow-y-auto py-2 lfo-scrollbar">
          <div className={`px-3 pb-1 pt-1 text-[7px] font-black uppercase tracking-[0.28em] ${style.muted}`} style={{ color: customStyle.mutedTextColor }}>Factory Presets</div>
          <OptionButton active={activePresetName === '— Init —'} onClick={() => { onLoadFactory(-1); setOpenMenu(false); }}>— Init —</OptionButton>
          {factoryPresets.map((preset, index) => (
            <OptionButton key={preset} active={activePresetName === preset} onClick={() => { onLoadFactory(index); setOpenMenu(false); }}>
              {preset}
            </OptionButton>
          ))}
          <div className="my-2 h-px bg-white/10" />
          <div className={`px-3 pb-1 pt-1 text-[7px] font-black uppercase tracking-[0.28em] ${style.muted}`} style={{ color: customStyle.mutedTextColor }}>User Presets</div>
          {userPresets.length === 0 ? (
            <div className={`px-3 py-2 text-[9px] font-bold tracking-[0.08em] ${style.muted}`} style={{ color: customStyle.mutedTextColor }}>No user presets yet</div>
          ) : userPresets.map((preset) => (
            <OptionButton key={preset.id} active={activePresetName === preset.name} onClick={() => { onLoadUser(preset.id); setOpenMenu(false); }}>
              {preset.name}
            </OptionButton>
          ))}
        </div>
      </div>,
      document.body
    );
  };

  return (
    <div
      className={`absolute -top-[53px] left-1/2 z-30 flex h-[42px] w-[872px] -translate-x-1/2 items-center gap-2 border px-4 ${style.shell}`}
      style={shellStyle}
    >
      {renderMenu()}
      <div className="pointer-events-none absolute inset-0" style={{ background: style.shine }} />
      <div className="absolute left-4 top-1/2 flex min-w-[120px] -translate-y-1/2 items-center gap-1">
        <span className={`text-[11px] font-black uppercase tracking-[0.22em] ${style.brand}`} style={{ color: customStyle.brandColor }}>Satura</span>
        <span className={`text-[11px] font-black uppercase tracking-[0.18em] ${style.muted}`} style={{ color: customStyle.mutedTextColor }}>Audio</span>
      </div>
      <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-[7px]">
        <button type="button" onClick={onPrev} className={`flex h-7 w-7 items-center justify-center rounded-full border text-[15px] font-black transition-all ${style.button}`} style={buttonInlineStyle}>
          <span className="relative -top-px leading-none">‹</span>
        </button>
        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setOpenMenu(open => !open)}
          className={`flex h-8 min-w-[218px] items-center justify-between rounded-[14px] border px-3 transition-all ${style.button}`}
          style={buttonInlineStyle}
        >
          <span className={`truncate text-[10px] font-black uppercase tracking-[0.18em] ${style.text}`} style={{ color: customStyle.textColor }}>{activePresetName}</span>
          <span className={`ml-2 text-[9px] ${style.muted}`} style={{ color: customStyle.mutedTextColor }}>▼</span>
        </button>
        <button type="button" onClick={onNext} className={`flex h-7 w-7 items-center justify-center rounded-full border text-[15px] font-black transition-all ${style.button}`} style={buttonInlineStyle}>
          <span className="relative -top-px leading-none">›</span>
        </button>
        <button type="button" onClick={() => { setSaveName(activePresetName === '— Init —' ? 'My Preset' : activePresetName); setShowSave(true); }} className={`h-8 rounded-[13px] border px-3 text-[8px] font-black uppercase tracking-[0.18em] transition-all ${style.button}`} style={buttonInlineStyle}>Save</button>
      </div>
      <div className="absolute right-4 top-1/2 flex min-w-[208px] -translate-y-1/2 justify-end gap-[7px]">
        <button type="button" onClick={onToggleCable} className={`h-8 rounded-[13px] border px-3 text-[8px] font-black uppercase tracking-[0.18em] transition-all ${cableToneEnabled ? style.active : style.button}`} style={cableToneEnabled ? copperActiveButtonInlineStyle : buttonInlineStyle}>Copper</button>
        <button type="button" onClick={onToggleHq} className={`h-8 rounded-[13px] border px-3 text-[8px] font-black uppercase tracking-[0.18em] transition-all ${hqMode ? style.active : style.button}`} style={hqMode ? activeButtonInlineStyle : buttonInlineStyle}>HQ</button>
        <div
          className={`flex h-8 overflow-hidden rounded-full border transition-all ${style.button}`}
          style={buttonInlineStyle}
        >
          <button
            type="button"
            aria-label="Settings"
            className="flex h-full w-9 items-center justify-center transition-colors hover:bg-white/5"
          >
            <Settings size={15} strokeWidth={2.4} style={{ color: customStyle.mutedTextColor }} />
          </button>
          <div className="h-full w-px bg-white/10" />
          <button
            type="button"
            aria-label="Help"
            className="flex h-full w-9 items-center justify-center transition-colors hover:bg-white/5"
          >
            <HelpCircle size={16} strokeWidth={2.2} style={{ color: customStyle.mutedTextColor }} />
          </button>
        </div>
      </div>
      {showSave && (
        <div
          className={`absolute left-1/2 top-[48px] z-50 min-w-[240px] -translate-x-1/2 rounded-[18px] border p-4 shadow-2xl backdrop-blur-2xl ${style.menu}`}
          style={menuInlineStyle}
        >
          <div className={`mb-2 text-[9px] font-black uppercase tracking-[0.2em] ${style.text}`} style={{ color: customStyle.textColor }}>Save User Preset</div>
          <input value={saveName} onChange={e => setSaveName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSave()} className={`mb-3 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-[11px] font-bold outline-none ${style.text}`} style={{ color: customStyle.textColor }} placeholder="Preset name..." autoFocus />
          <div className="flex gap-2">
            <button onClick={handleSave} className="flex-1 rounded-lg py-1.5 text-[9px] font-bold uppercase tracking-wider text-white" style={{ backgroundColor: customStyle.activeColor }}>Save</button>
            <button onClick={() => setShowSave(false)} className={`flex-1 rounded-lg border py-1.5 text-[9px] font-bold uppercase tracking-wider ${style.button}`} style={buttonInlineStyle}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

const TopBarThemeEditor = ({ title, value, defaults, onChange, onReset }) => {
  const theme = { ...defaults, ...value };
  const fields = [
    ['barColor', 'Bar'],
    ['dropdownColor', 'Menu'],
    ['outlineColor', 'Outline'],
    ['textColor', 'Text'],
    ['selectedTextColor', 'Selected Text'],
    ['hoverTextColor', 'Hover Text'],
    ['hoverRowColor', 'Hover Row'],
    ['mutedTextColor', 'Muted'],
    ['brandColor', 'Logo'],
    ['buttonColor', 'Buttons'],
    ['activeColor', 'Active'],
    ['copperActiveColor', 'Copper Active']
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-black/15 p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-[9px] font-black uppercase tracking-[0.18em] text-white/55">{title}</span>
        <button type="button" onClick={onReset} className="rounded-full border border-white/10 px-2 py-1 text-[7px] font-black uppercase tracking-widest text-white/35 transition-colors hover:text-white/70">Reset</button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {fields.map(([key, label]) => (
          <label key={key} className="flex flex-col gap-1.5">
            <span className="text-[8px] font-black uppercase tracking-[0.16em] text-white/38">{label}</span>
            <div className="relative h-9 overflow-hidden rounded-lg border border-white/10 bg-white/5" style={{ backgroundColor: theme[key] }}>
              <input
                type="color"
                value={theme[key]}
                onChange={e => onChange({ [key]: e.target.value })}
                className="absolute -inset-2 h-[calc(100%+16px)] w-[calc(100%+16px)] cursor-pointer border-none bg-transparent"
                aria-label={`${title} ${label} color`}
              />
            </div>
            <span className="font-mono text-[8px] uppercase tracking-wide text-white/30">{theme[key]}</span>
          </label>
        ))}
      </div>
      <label className="mt-3 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[8px] font-black uppercase tracking-[0.16em] text-white/38">Outline Thickness</span>
          <span className="font-mono text-[9px] text-[#edd39a]">{theme.outlineWidth}px</span>
        </div>
        <input
          type="range"
          min="0"
          max="4"
          step="1"
          value={theme.outlineWidth}
          onChange={e => onChange({ outlineWidth: Number(e.target.value) })}
          className="w-full accent-[#edd39a]"
        />
      </label>
    </div>
  );
};

const DesignGridOverlay = ({ mode }) => {
  if (mode === 'off') return null;
  const isDetailed = mode === 'detail';
  return (
    <div
      className="absolute inset-0 z-[95] pointer-events-none rounded-[4rem]"
      style={{
        backgroundImage: isDetailed
          ? [
              'linear-gradient(rgba(255,255,255,0.16) 1px, transparent 1px)',
              'linear-gradient(90deg, rgba(255,255,255,0.16) 1px, transparent 1px)',
              'linear-gradient(rgba(230,106,83,0.38) 1px, transparent 1px)',
              'linear-gradient(90deg, rgba(230,106,83,0.38) 1px, transparent 1px)',
              'linear-gradient(rgba(237,211,154,0.64) 2px, transparent 2px)',
              'linear-gradient(90deg, rgba(237,211,154,0.64) 2px, transparent 2px)'
            ].join(', ')
          : [
              'linear-gradient(rgba(237,211,154,0.56) 1px, transparent 1px)',
              'linear-gradient(90deg, rgba(237,211,154,0.56) 1px, transparent 1px)',
              'linear-gradient(rgba(230,106,83,0.62) 2px, transparent 2px)',
              'linear-gradient(90deg, rgba(230,106,83,0.62) 2px, transparent 2px)'
            ].join(', '),
        backgroundSize: isDetailed
          ? '10px 10px, 10px 10px, 50px 50px, 50px 50px, 425px 425px, 425px 425px'
          : '50px 50px, 50px 50px, 425px 425px, 425px 425px',
        boxShadow: 'inset 0 0 0 1px rgba(237,211,154,0.38)',
        opacity: isDetailed ? 0.82 : 0.72,
        mixBlendMode: 'multiply'
      }}
    />
  );
};

// ===================================================================
// MAIN APP — All controls with local state, no JUCE bridge
// ===================================================================
//
// PARAMETER REFERENCE (for wiring back to JUCE later):
//   input        (0-100, maps to -24 to +24 dB)
//   output       (0-100, maps to -24 to +24 dB)
//   drift        (0-100, maps to detune 0-1)
//   spread       (0-100, maps to driftSpread 0-1)
//   character    (0-100, maps to character 0-1)    — labeled "Filter"
//   sweeten      (0-100, maps to sweeten 0-1)
//   biasHF       (0-100, maps to biasHF 0-1)       — labeled "Sat"
//   noise        (0-100, maps to noise 0-1)
//   rate         (0-100, maps to lfoRate 0.05-8 Hz)
//   depth        (0-100, maps to lfoDepth 0-1)
//   stereoPhase  (0-100, maps to lfoStereoPhase 0-180°)
//   mode         ('calm'=0, 'vintage'=1, 'unstable'=2, 'dream'=3)
//   mix          (0-100, maps to dry/wet mix 0-1)
//   lfoEnabled   (true/false)
//   lfoSync      (true/false)
//   lfoShape     (0=Sine, 1=Triangle, 2=Drift)
//   lfoSyncDiv   (0-13, index into SYNC_DIVS array)
//   power        (true/false, UI-only bypass)
//

const SHAPES = ['Sine', 'Triangle', 'Square'];
const SHAPE_BUTTON_SYMBOLS = ['∿', '△', '□'];
const SHAPE_BUTTON_SYMBOL_STYLES = [
  { fontSize: 31, fontWeight: 400, fontFamily: 'Georgia, serif', transform: 'translateY(-5px) scaleX(1.14)' },
  { fontSize: 19, fontWeight: 400, fontFamily: 'Arial, sans-serif', transform: 'translateY(-1px) scaleX(1.02)' },
  { fontSize: 27, fontWeight: 700, fontFamily: 'Arial, sans-serif', transform: 'translateY(-3px)' }
];
const SYNC_DIVS = ['4/1', '2/1', '1/1', '1/2', '1/4', '1/8', '1/16', '1/32', '1/4T', '1/8T', '1/16T', '1/4D', '1/8D', '1/16D'];
const DEMO_PRESETS = ['Subtle Warmth', 'Vinyl Drift', 'Tape Machine', 'Broken Cassette', 'Chorus Width', 'Slow Swirl', 'Synced Wobble', 'Sweet Dream', 'Subtle Detune', 'Broken Radio', 'Drum Saturator', 'Lush & Full'];
const TOP_BAR_STYLE_NAMES = [
  'Charcoal OLED Rail',
  'Brushed Champagne'
];

const TOP_BAR_STYLES = [
  {
    name: TOP_BAR_STYLE_NAMES[0],
    shell: 'border-[#202222] bg-[#0b0e0e]/90 shadow-[0_18px_38px_rgba(0,0,0,0.56),inset_0_1px_0_rgba(220,248,244,0.06),inset_0_-1px_0_rgba(0,0,0,0.82)] backdrop-blur-2xl',
    shine: 'radial-gradient(ellipse at 50% 0%, rgba(210,238,232,0.08), transparent 48%)',
    surfaceStyle: {
      background: 'linear-gradient(180deg, rgba(12,15,15,0.985), rgba(6,8,8,0.978))',
      borderColor: 'rgba(32,42,40,0.96)',
      boxShadow: '0 18px 38px rgba(0,0,0,0.56), inset 0 1px 0 rgba(220,248,244,0.06), inset 0 -1px 0 rgba(0,0,0,0.82)'
    },
    menuStyle: {
      background: 'rgba(7,10,10,0.985)',
      borderColor: 'rgba(32,42,40,0.96)'
    },
    brand: 'text-[#d8f1eb]',
    text: 'text-[#f3fffb]',
    muted: 'text-[#8ca39d]',
    button: 'border-[#26302f]/90 bg-[#111817]/92 text-[#b7cfca] shadow-[inset_0_1px_0_rgba(230,255,250,0.045),0_5px_11px_rgba(0,0,0,0.42)] hover:text-[#f5fffb]',
    active: 'border-[#b8d4cc]/48 bg-[#b8d4cc]/16 text-[#f4fffb] shadow-[0_0_12px_rgba(184,212,204,0.14)]',
    menu: 'border-[#202a28] bg-[#0a0e0d]/98'
  },
  {
    name: TOP_BAR_STYLE_NAMES[1],
    shell: 'border-[#d0b990]/55 bg-[#d8c29a]/34 shadow-[0_14px_30px_rgba(64,42,20,0.2),inset_0_1px_0_rgba(255,248,225,0.35),inset_0_-1px_0_rgba(72,50,25,0.16)] backdrop-blur-xl',
    shine: 'linear-gradient(110deg, rgba(255,250,227,0.3), transparent 40%, rgba(117,76,42,0.08))',
    brand: 'text-[#6f4a2f]',
    text: 'text-[#30271e]',
    muted: 'text-[#79664b]',
    button: 'border-[#f3dfb7]/52 bg-[#fff0c9]/24 text-[#5f4b32] shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_4px_10px_rgba(64,42,20,0.14)] hover:text-[#2c2218]',
    active: 'border-[#8b5a35]/28 bg-[#8b5a35]/13 text-[#5f3a22]',
    menu: 'border-[#d0b990] bg-[#ead7b2]/96'
  }
];

const DEFAULT_TOP_BAR_CUSTOM_STYLES = [
  {
    barColor: '#070a0a',
    outlineColor: '#202a28',
    outlineWidth: 1,
    dropdownColor: '#070a0a',
    selectedRowColor: '#202624',
    hoverRowColor: '#df6f5a',
    textColor: '#f3fffb',
    selectedTextColor: '#edcf88',
    hoverTextColor: '#111111',
    mutedTextColor: '#8ca39d',
    brandColor: '#d8f1eb',
    buttonColor: '#111817',
    activeColor: '#b8d4cc',
    copperActiveColor: '#b87333'
  },
  {
    barColor: '#d8c29a',
    outlineColor: '#d0b990',
    outlineWidth: 1,
    dropdownColor: '#ead7b2',
    selectedRowColor: '#8b5a35',
    hoverRowColor: '#c87948',
    textColor: '#30271e',
    selectedTextColor: '#edcf88',
    hoverTextColor: '#fff8ea',
    mutedTextColor: '#79664b',
    brandColor: '#6f4a2f',
    buttonColor: '#fff0c9',
    activeColor: '#8b5a35',
    copperActiveColor: '#b87333'
  }
];

const normalizeTopBarStyle = (value) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return 0;
  return Math.max(0, Math.min(TOP_BAR_STYLES.length - 1, numericValue));
};

const normalizeTopBarCustomStyles = (value) => {
  const source = Array.isArray(value) ? value : [];
  return DEFAULT_TOP_BAR_CUSTOM_STYLES.map((defaults, index) => ({
    ...defaults,
    ...(source[index] || {}),
    outlineWidth: Math.max(0, Math.min(4, Number(source[index]?.outlineWidth ?? defaults.outlineWidth) || defaults.outlineWidth))
  }));
};

const MODE_STYLE_NAMES = [
  'Glassmorphism (Original)',
  'Flush Walnut (Gold)',
  'Flush Walnut (Ivory)',
  'Flush Walnut (Matte)',
  'Pearl Capsule',
  'Porcelain Tabs',
  'Linen Radio',
  'Petal Lamps',
  'Ivory Toggle',
  'Paper Dial',
  'Brass Seeds',
  'Silk Faders',
  'Flush Walnut (Matte Round)',
  'Walnut Separated Round',
  'Walnut Separated Soft'
];

const BOTTOM_SECTION_STYLE_NAMES = [
  'Reference Console',
  'Anodized Rack Rails',
  'Smoked Glass Rails',
  'Brass Slot Console',
  'Twin Recessed Dials',
  'Amber Meter Bridge',
  'Bakelite Rotary Deck',
  'Ivory Inset Rails',
  'Porcelain Dial Plate',
  'Paper Ruler Rails',
  'Cream Split Modules',
  'Walnut Brass Seat',
  'Patina Etched Plate'
];

const BACKGROUNDS = [
  { name: 'Warm Sand', color: '#c8bba6' },
  { name: 'Aged Cork', color: '#b5a895' },
  { name: 'Muted Clay', color: '#a39785' },
  { name: 'Smoked Taupe', color: '#918676' },
  { name: 'Custom Taupe', color: '#918676', custom: true },
  { name: 'Warm Charcoal', color: '#2a2826' },
  { name: 'Deep Espresso', color: '#2d2621' },
  { name: 'Dark Slate', color: '#212326' },
  { name: 'Midnight Ash', color: '#1c1c1a' }
];
const CUSTOM_BACKGROUND_INDEX = BACKGROUNDS.findIndex(background => background.custom);
const DEFAULT_CUSTOM_BACKGROUND_COLOR = BACKGROUNDS[CUSTOM_BACKGROUND_INDEX]?.color || '#918676';

const SaturationSelectorEngine = ({ mode, setMode, styleIndex, power }) => {
  const modes = ['Tape', 'Desk'];
  
  const Label = ({ m, active, colorActive, colorInactive, shadow = 'none' }) => (
    <span className="text-[9px] font-black tracking-[0.18em] uppercase transition-colors" style={{ color: active ? colorActive : colorInactive, textShadow: shadow }}>
      {m}
    </span>
  );

  switch (styleIndex) {
    case 1: // Walnut Twin Push (High Fidelity)
      return (
        <div className="flex items-center justify-center gap-4 w-[190px] h-[52px] rounded-full z-10" style={{ 
          backgroundImage: 'linear-gradient(rgba(25,10,0,0.15), rgba(15,5,0,0.25)), url("/textures/walnut.png")', 
          backgroundSize: 'cover',
          boxShadow: '0 0 0 1px #2b170b, 0 0 0 2px #78502a, inset 0 1px 2px rgba(0,0,0,0.6), inset 0 -1px 1px rgba(255,255,255,0.08)',
          border: '1px solid rgba(0,0,0,0.8)'
        }}>
          {modes.map((m, i) => {
            const ledColor = i === 0 ? '#4ade80' : '#fb923c';
            return (
              <div key={m} className="flex items-center gap-2">
                <button onClick={() => setMode(i)} className={`shrink-0 w-9 h-9 rounded-xl transition-all flex items-center justify-center border border-black
                  ${power && mode === i ? 'bg-[#111] shadow-[inset_2px_2px_5px_rgba(0,0,0,0.9)] scale-95' : 'bg-[#262626] shadow-[0_4px_6px_rgba(0,0,0,0.8),inset_1px_1px_1px_rgba(255,255,255,0.1)]'}
                `}>
                  <div 
                    className={`w-3 h-[3px] rounded-full ${!power || mode !== i ? 'bg-[#111] shadow-[inset_1px_1px_1px_rgba(0,0,0,0.5)]' : ''}`}
                    style={power && mode === i ? { backgroundColor: ledColor, boxShadow: `0 0 8px ${ledColor}` } : {}}
                  />
                </button>
                <span className="shrink-0 w-[30px] text-[9px] font-bold tracking-[0.25em] uppercase drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]" style={{ color: '#d3ba8c' }}>{m}</span>
              </div>
            );
          })}
        </div>
      );

    case 2: // Anodized Studio Rocker
      return (
        <div className="flex items-center gap-5 px-5 py-2.5 rounded-lg border border-[#111]" style={{
          background: 'linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%)',
          boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.15), 0 5px 15px rgba(0,0,0,0.6), 0 1px 3px rgba(0,0,0,0.8)'
        }}>
          <div className="text-[8px] font-black uppercase tracking-[0.2em] text-[#888] text-shadow-[0_1px_0_rgba(255,255,255,0.1)]">Sat</div>
          <div className="relative w-[100px] h-[22px] bg-[#0a0a0a] rounded-sm shadow-[inset_0_2px_6px_rgba(0,0,0,0.9)] flex items-center px-1 border border-white/5 cursor-pointer" onClick={() => setMode(mode === 0 ? 1 : 0)}>
             <div className="absolute inset-0 flex justify-between items-center px-3 pointer-events-none">
                <span className={`text-[7px] font-black tracking-widest ${mode === 0 && power ? 'text-[#e66a53] shadow-[0_0_8px_#e66a53]' : 'text-[#333]'}`}>TAPE</span>
                <span className={`text-[7px] font-black tracking-widest ${mode === 1 && power ? 'text-[#e66a53] shadow-[0_0_8px_#e66a53]' : 'text-[#333]'}`}>DESK</span>
             </div>
             <div className={`w-[44px] h-[16px] rounded-sm bg-gradient-to-b from-[#555] to-[#222] shadow-[0_2px_4px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.4),inset_0_-1px_1px_rgba(0,0,0,0.8)] border border-black transition-transform duration-200 flex items-center justify-center ${mode === 1 ? 'translate-x-[46px]' : 'translate-x-0'}`}>
                <div className="w-[30px] h-[2px] bg-black/50 rounded-full shadow-[0_1px_0_rgba(255,255,255,0.2)]" />
             </div>
          </div>
        </div>
      );

    case 3: // Ivory & Brass Strip
      return (
        <div className="flex items-center gap-4 px-4 py-2 rounded-md border border-[#c5bba8]" style={{
          background: '#e8dfcc',
          boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.9), 0 4px 8px rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.1)'
        }}>
           <div className="text-[7px] font-bold tracking-[0.25em] text-[#8a7e6b]">SATURATION</div>
           <div className="h-4 w-px bg-[#d3c8b3] mx-1" />
           <div className="flex gap-2">
             {modes.map((m, i) => (
                <button key={m} onClick={() => setMode(i)} className={`px-4 py-1.5 rounded-sm border transition-all ${power && mode === i ? 'bg-[#d8c07d] border-[#b09756] shadow-[inset_0_2px_5px_rgba(0,0,0,0.3)]' : 'bg-gradient-to-b from-[#fdfbf7] to-[#e6dfce] border-[#d4cbba] shadow-[0_2px_3px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.8)]'}`}>
                   <span className={`text-[8px] font-black tracking-widest uppercase ${power && mode === i ? 'text-[#3d2e13] drop-shadow-[0_1px_0_rgba(255,255,255,0.4)]' : 'text-[#a39682]'}`}>{m}</span>
                </button>
             ))}
           </div>
        </div>
      );

    case 4: // Solid Brass Heavy Plate
      return (
        <div className="flex items-center gap-5 px-5 py-2 rounded-sm border border-[#e8d5a6]" style={{
          background: 'linear-gradient(180deg, #c5b07b 0%, #8a6a1c 100%)',
          boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.6), inset 0 -1px 2px rgba(0,0,0,0.8), 0 6px 12px rgba(0,0,0,0.5)'
        }}>
          <div className="text-[8px] font-black uppercase tracking-[0.2em] text-[#3d2e13] drop-shadow-[0_1px_0_rgba(255,255,255,0.3)]">Sat</div>
          <div className="flex gap-4">
             {modes.map((m, i) => (
                <button key={m} onClick={() => setMode(i)} className={`relative flex items-center justify-center w-14 h-6 rounded-sm border border-black/80 transition-all ${power && mode === i ? 'bg-[#1a1410] shadow-[inset_0_3px_8px_rgba(0,0,0,0.9)] scale-[0.98]' : 'bg-gradient-to-b from-[#2a241f] to-[#110e0c] shadow-[0_2px_4px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.1)]'}`}>
                   <span className={`text-[7px] font-black tracking-widest uppercase ${power && mode === i ? 'text-[#e66a53] drop-shadow-[0_0_6px_#e66a53]' : 'text-[#554a3f]'}`}>{m}</span>
                </button>
             ))}
          </div>
        </div>
      );

    case 5: // Vintage Broadcast Red/Amber
      return (
        <div className="flex items-center gap-3 px-3 py-2 rounded border border-[#222]" style={{
           background: 'linear-gradient(180deg, #3a3a3a 0%, #222 100%)',
           boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1), 0 4px 10px rgba(0,0,0,0.4)'
        }}>
           <div className="w-[3px] h-6 bg-gradient-to-b from-[#444] to-[#111] rounded-full shadow-inner" />
           {modes.map((m, i) => {
             const activeColor = i === 0 ? '#ff3b30' : '#ff9500';
             return (
               <div key={m} className="flex flex-col items-center">
                 <button onClick={() => setMode(i)} className={`w-12 h-6 rounded-sm border border-black transition-all flex items-center justify-center ${power && mode === i ? 'scale-[0.97] shadow-[inset_0_2px_5px_rgba(0,0,0,0.5),0_0_15px_rgba(255,59,48,0.4)]' : 'shadow-[0_4px_6px_rgba(0,0,0,0.6),inset_0_2px_3px_rgba(255,255,255,0.3)]'}`} style={{ backgroundColor: power && mode === i ? activeColor : '#555' }}>
                   <span className={`text-[7px] font-black uppercase tracking-wider ${power && mode === i ? 'text-white drop-shadow-[0_0_2px_rgba(0,0,0,0.5)]' : 'text-black/40 text-shadow-[0_1px_0_rgba(255,255,255,0.2)]'}`}>{m}</span>
                 </button>
               </div>
             );
           })}
           <div className="w-[3px] h-6 bg-gradient-to-b from-[#444] to-[#111] rounded-full shadow-inner ml-1" />
        </div>
      );

    case 6: // Stealth Glass Bar
      return (
        <div className="flex items-center gap-6 px-6 py-2 rounded-full border border-white/5 backdrop-blur-xl" style={{
           background: 'rgba(20,20,20,0.6)',
           boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05), 0 8px 24px rgba(0,0,0,0.4)'
        }}>
           <div className="text-[7px] font-black tracking-[0.3em] uppercase text-white/20">SAT</div>
           <div className="flex gap-4">
             {modes.map((m, i) => (
                <button key={m} onClick={() => setMode(i)} className="group relative focus:outline-none">
                  <span className={`text-[9px] font-black tracking-widest uppercase transition-all duration-300 ${power && mode === i ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'text-white/20 group-hover:text-white/40'}`}>{m}</span>
                  {power && mode === i && <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-white rounded-full shadow-[0_0_8px_white]" />}
                </button>
             ))}
           </div>
        </div>
      );

    case 7: // Chrome Twin Switch
      return (
        <div className="flex items-center gap-6 px-6 py-3 rounded-md border border-white/40" style={{
           background: 'linear-gradient(180deg, #f5f5f5 0%, #c0c0c0 40%, #909090 100%)',
           boxShadow: 'inset 0 2px 3px rgba(255,255,255,0.9), 0 5px 15px rgba(0,0,0,0.3)'
        }}>
           <div className="text-[8px] font-black tracking-[0.2em] uppercase text-[#444] drop-shadow-[0_1px_0_rgba(255,255,255,0.8)]">SAT</div>
           <div className="flex gap-5">
              {modes.map((m, i) => (
                 <div key={m} className="flex flex-col items-center gap-1.5">
                    <button onClick={() => setMode(i)} className={`relative w-4 h-8 bg-black rounded-full shadow-inner flex flex-col justify-between items-center py-1 transition-all`}>
                       <div className={`w-2.5 h-3.5 rounded-sm bg-gradient-to-b from-[#fff] to-[#888] shadow-[0_1px_3px_rgba(0,0,0,0.8)] transition-transform duration-200 ${power && mode === i ? 'translate-y-0' : 'translate-y-[10px]'}`} />
                    </button>
                    <span className="text-[7px] font-bold tracking-widest uppercase text-[#555] drop-shadow-[0_1px_0_rgba(255,255,255,0.5)]">{m}</span>
                 </div>
              ))}
           </div>
        </div>
      );

    case 8: // Industrial Amber Matrix
      return (
        <div className="flex items-center gap-4 px-4 py-2 rounded-sm border border-[#333]" style={{
           background: '#1a1a1a',
           backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
           backgroundSize: '3px 3px',
           boxShadow: '0 4px 10px rgba(0,0,0,0.6)'
        }}>
           <div className="px-2 py-1 bg-black rounded shadow-[inset_0_0_5px_rgba(0,0,0,0.8)] border border-[#333]">
              <span className="text-[7px] font-black tracking-[0.2em] uppercase text-[#d4af37]/60">SAT</span>
           </div>
           <div className="flex gap-2">
              {modes.map((m, i) => (
                 <button key={m} onClick={() => setMode(i)} className={`relative w-14 h-6 border transition-all flex items-center justify-center ${power && mode === i ? 'bg-[#2a1e0b] border-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.3),inset_0_0_5px_rgba(212,175,55,0.2)]' : 'bg-black border-[#333] shadow-[inset_0_1px_3px_rgba(0,0,0,0.9)] hover:border-[#555]'}`}>
                    <span className={`text-[7px] font-black uppercase tracking-widest ${power && mode === i ? 'text-[#d4af37] drop-shadow-[0_0_4px_#d4af37]' : 'text-[#444]'}`}>{m}</span>
                    {power && mode === i && <div className="absolute top-0 right-0 w-1 h-1 bg-[#d4af37] shadow-[0_0_3px_#d4af37]" />}
                 </button>
              ))}
           </div>
        </div>
      );

    case 9: // Porcelain & Rose Gold
      return (
        <div className="flex items-center gap-5 px-5 py-2.5 rounded-full border border-[#f0e8dc]" style={{
           background: '#fdfbf7',
           boxShadow: 'inset 0 2px 4px rgba(255,255,255,1), 0 5px 15px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)'
        }}>
           <span className="text-[7px] font-black tracking-[0.2em] uppercase text-[#a69882]">SAT</span>
           <div className="flex gap-4">
              {modes.map((m, i) => (
                 <div key={m} className="flex items-center gap-2">
                    <button onClick={() => setMode(i)} className={`w-5 h-5 rounded-full border border-[#d4a373] transition-all flex items-center justify-center ${power && mode === i ? 'shadow-[inset_1px_2px_4px_rgba(0,0,0,0.4)] scale-95' : 'shadow-[1px_2px_4px_rgba(0,0,0,0.2),inset_1px_1px_2px_rgba(255,255,255,0.8)]'}`} style={{ background: 'linear-gradient(135deg, #e2b48a 0%, #c18753 100%)' }}>
                       {power && mode === i && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_4px_white]" />}
                    </button>
                    <Label m={m} active={power && mode === i} colorActive="#c18753" colorInactive="#d3c8b3" />
                 </div>
              ))}
           </div>
        </div>
      );

    case 10: // Raw Steel Push
      return (
        <div className="flex items-center gap-4 px-4 py-2 rounded border border-[#555]" style={{
           background: 'linear-gradient(180deg, #999 0%, #777 100%)',
           boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.3), 0 4px 8px rgba(0,0,0,0.5)'
        }}>
           <div className="text-[8px] font-black uppercase tracking-[0.2em] text-[#333] drop-shadow-[0_1px_0_rgba(255,255,255,0.2)]">SAT</div>
           <div className="w-[2px] h-6 bg-[#555] rounded-full shadow-[0_1px_0_rgba(255,255,255,0.2)]" />
           <div className="flex gap-2">
              {modes.map((m, i) => (
                 <button key={m} onClick={() => setMode(i)} className={`w-14 h-7 rounded-sm border border-black/80 flex items-center justify-center transition-all ${power && mode === i ? 'bg-gradient-to-b from-[#e63946] to-[#b81d28] shadow-[inset_0_2px_4px_rgba(0,0,0,0.4),0_0_12px_rgba(230,57,70,0.5)] scale-[0.98]' : 'bg-gradient-to-b from-[#4a1c1f] to-[#2d1113] shadow-[0_3px_5px_rgba(0,0,0,0.6),inset_0_1px_2px_rgba(255,255,255,0.15)]'}`}>
                    <span className={`text-[8px] font-black tracking-widest uppercase ${power && mode === i ? 'text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]' : 'text-[#884444]'}`}>{m}</span>
                 </button>
              ))}
           </div>
        </div>
      );

    default:
      return null;
  }
};

const ModeSelectorEngine = ({ mode, setMode, styleIndex, power, isMovable = false }) => {
  const modes = ['calm', 'vintage', 'unstable'];
  const tone = {
    calm: { color: '#7aa678', glow: 'rgba(122,166,120,0.38)', bg: '#dce8d0' },
    vintage: { color: '#d49b4f', glow: 'rgba(212,155,79,0.42)', bg: '#efe0bb' },
    unstable: { color: '#d96f5d', glow: 'rgba(217,111,93,0.42)', bg: '#efc2b8' }
  };
  const label = (m, active, extra = '') => (
    <span className={`text-[8px] font-black tracking-[0.18em] uppercase transition-colors ${extra}`} style={{ color: active ? tone[m].color : '#8a7e6b' }}>{m}</span>
  );
  const unstableLedFlicker = (m) => power && mode === m && m === 'unstable' ? 'anim-unstable-led-flicker' : '';
  const vintageLedFlicker = (m) => power && mode === m && m === 'vintage' ? 'anim-vintage-led-flicker' : '';
  const modeLedFlicker = (m) => `${unstableLedFlicker(m)} ${vintageLedFlicker(m)}`;
  const FlavorLabel = () => (
    <div
      className="absolute left-[calc(50%+4px)] top-[-28px] -translate-x-1/2 text-[11px] font-black uppercase tracking-[0.14em]"
      style={{
        color: 'rgba(52, 48, 41, 0.58)',
        textShadow: PANEL_TEXT_DEPTH_SHADOW
      }}
    >
      FLAVOR
    </div>
  );

  const baseClass = isMovable ? "flex flex-col z-10" : "absolute top-[48%] left-[8%] translate-x-[10px] -translate-y-1/2 flex flex-col z-10";
  
  switch (styleIndex) {
    case 0: // Glassmorphism (Original)
      return (
        <div className={`${baseClass} gap-4 p-4 rounded-[2rem] bg-white/20 backdrop-blur-md border border-white/40 shadow-xl`}>
          {modes.map(m => (
            <div key={m} className="flex flex-col items-center gap-2 z-10">
              <button onClick={() => setMode(m)} className="relative w-8 h-8 rounded-full outline-none flex items-center justify-center transition-transform active:scale-95" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', boxShadow: power && mode === m ? '5px 5px 15px rgba(0,0,0,0.15), 0 0 12px rgba(212,175,55,0.3), inset 0 0 8px rgba(255,255,255,0.5)' : '5px 5px 15px rgba(0,0,0,0.1)' }}>
                <div className="rounded-full transition-all duration-300" style={{ width: 12, height: 12, backgroundColor: power && mode === m ? '#d4af37' : 'rgba(0,0,0,0.2)', boxShadow: power && mode === m ? '0 0 8px #d4af37' : 'inset 0 1px 2px rgba(0,0,0,0.3)' }} />
              </button>
              <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-[#7a7465]">{m}</span>
            </div>
          ))}
        </div>
      );

    case 1: // Flush Walnut (Gold)
      return (
        <div className={`${baseClass} gap-5 p-4 rounded-full`} style={{ 
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.4)), url("/textures/walnut.png")', 
          backgroundSize: 'cover',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.6), inset 0 -1px 1px rgba(255,255,255,0.08), 0 1px 1px rgba(255,255,255,0.45), 0 -1px 1px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.8)'
        }}>
          {modes.map(m => (
            <div key={m} className="flex flex-col items-center gap-2">
              <button onClick={() => setMode(m)} className={`w-8 h-8 rounded-full transition-all border border-[#111] flex items-center justify-center
                ${power && mode === m ? 'shadow-[inset_2px_2px_5px_rgba(0,0,0,0.9)] scale-95' : 'shadow-[3px_4px_6px_rgba(0,0,0,0.6),inset_1px_1px_2px_rgba(255,255,255,0.4)]'}
              `} style={{ background: 'linear-gradient(135deg, #d4af37 0%, #8a6a1c 100%)' }}>
                 <div className={`w-1.5 h-1.5 rounded-full ${power && mode === m ? 'bg-[#e66a53] shadow-[0_0_5px_#e66a53]' : 'bg-[#33250a] shadow-inner'}`} />
              </button>
              <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-[#d4af37] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">{m}</span>
            </div>
          ))}
        </div>
      );

    case 2: // Flush Walnut (Ivory)
      return (
        <div className={`${baseClass} gap-5 p-4 rounded-full`} style={{ 
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.4)), url("/textures/walnut.png")', 
          backgroundSize: 'cover',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.6), inset 0 -1px 1px rgba(255,255,255,0.08), 0 1px 1px rgba(255,255,255,0.45), 0 -1px 1px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.8)'
        }}>
          {modes.map(m => (
            <div key={m} className="flex flex-col items-center gap-2">
              <button onClick={() => setMode(m)} className={`w-9 h-9 rounded-full transition-all flex items-center justify-center border border-[#111]
                ${power && mode === m ? 'bg-[#dcd5c4] shadow-[inset_2px_4px_8px_rgba(0,0,0,0.4)] scale-95' : 'bg-gradient-to-br from-[#ffffff] to-[#e8e0cc] shadow-[0_4px_6px_rgba(0,0,0,0.7),inset_1px_1px_2px_white]'}
              `}>
                <div className={`w-2 h-2 rounded-full border border-black/10 transition-all ${power && mode === m ? 'bg-[#e66a53] shadow-[0_0_8px_#e66a53,inset_1px_1px_2px_rgba(255,255,255,0.5)]' : 'bg-[#d2c9b4] shadow-inner'}`} />
              </button>
              <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-[#e8e0cc] drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]">{m}</span>
            </div>
          ))}
        </div>
      );

    case 3: // Flush Walnut (Matte)
      return (
        <div className="absolute top-[48%] left-[8%] translate-x-[10px] -translate-y-1/2 flex flex-col gap-5 px-[13px] py-4 rounded-[2rem] z-10" style={{ 
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.06), rgba(0,0,0,0.12)), url("/textures/walnut.png")', 
          backgroundSize: 'cover',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.6), inset 0 -1px 1px rgba(255,255,255,0.08), 0 1px 1px rgba(255,255,255,0.45), 0 -1px 1px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.8)'
        }}>
          <FlavorLabel />
          {modes.map(m => {
            const ledColor = m === 'calm' ? '#4ade80' : m === 'vintage' ? '#fb923c' : '#ef4444';
            return (
              <div key={m} className="flex flex-col items-center gap-2">
                <button onClick={() => setMode(m)} className={`w-9 h-9 rounded-xl transition-all flex items-center justify-center border border-black
                  ${power && mode === m ? 'bg-[#111] shadow-[inset_2px_2px_5px_rgba(0,0,0,0.9)] scale-95' : 'bg-[#262626] shadow-[0_4px_6px_rgba(0,0,0,0.8),inset_1px_1px_1px_rgba(255,255,255,0.1)]'}
                `}>
                  <div 
                    className={`w-3 h-[3px] rounded-full ${modeLedFlicker(m)} ${!power || mode !== m ? 'bg-[#111] shadow-[inset_1px_1px_1px_rgba(0,0,0,0.5)]' : ''}`}
                    style={power && mode === m ? { backgroundColor: ledColor, boxShadow: `0 0 9px ${ledColor}` } : {}}
                  />
                </button>
                <span className="text-[9px] font-bold tracking-[0.25em] uppercase drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]" style={{ color: '#d3ba8c' }}>{m}</span>
              </div>
            );
          })}
        </div>
      );

    case 4:
      return (
        <div className="absolute top-[48%] left-[8%] translate-x-[10px] -translate-y-1/2 z-10 flex flex-col gap-3 rounded-[30px] border border-[#fff7e8]/80 bg-[#f7edd8]/78 px-3 py-4 shadow-[10px_18px_28px_rgba(81,57,38,0.18),inset_1px_1px_2px_rgba(255,255,255,0.9)]">
          {modes.map(m => {
            const active = power && mode === m;
            return (
              <button key={m} onClick={() => setMode(m)} className="group flex w-[72px] flex-col items-center gap-1.5 rounded-[22px] px-2 py-2 transition-all active:scale-95" style={{ background: active ? `linear-gradient(145deg, #fff9ed, ${tone[m].bg})` : 'linear-gradient(145deg, rgba(255,250,237,0.74), rgba(228,213,188,0.35))', boxShadow: active ? `0 0 0 1px rgba(255,255,255,0.9), 0 9px 18px ${tone[m].glow}, inset 1px 1px 2px rgba(255,255,255,0.95)` : 'inset 1px 1px 2px rgba(255,255,255,0.65), 4px 7px 12px rgba(89,68,48,0.1)' }}>
                <span className="h-5 w-5 rounded-full transition-all" style={{ background: active ? tone[m].color : '#d8cbb4', boxShadow: active ? `0 0 14px ${tone[m].glow}` : 'inset 1px 1px 3px rgba(99,72,48,0.22)' }} />
                {label(m, active)}
              </button>
            );
          })}
        </div>
      );
    case 5:
      return (
        <div className="absolute top-[48%] left-[5.5%] translate-x-[10px] -translate-y-1/2 z-10 flex rounded-[24px] border border-white/75 bg-[#f3e6cb]/82 p-1.5 shadow-[8px_14px_24px_rgba(71,50,33,0.17),inset_0_1px_2px_rgba(255,255,255,0.9)]">
          {modes.map(m => {
            const active = power && mode === m;
            return (
              <button key={m} onClick={() => setMode(m)} className="relative flex h-[82px] w-[38px] flex-col items-center justify-between rounded-[18px] px-1.5 py-2 transition-all active:scale-95" style={{ background: active ? '#fff6e5' : 'transparent', boxShadow: active ? `0 8px 18px ${tone[m].glow}, inset 1px 1px 2px rgba(255,255,255,0.95)` : 'none' }}>
                <span className="h-8 w-3 rounded-full border border-white/60 transition-all" style={{ background: active ? `linear-gradient(180deg, #fffdf5, ${tone[m].color})` : 'linear-gradient(180deg, #eadfc9, #cab99b)', boxShadow: active ? `0 0 12px ${tone[m].glow}` : 'inset 0 1px 3px rgba(83,61,42,0.18)' }} />
                <span className="origin-center rotate-[-90deg] whitespace-nowrap text-[8px] font-black uppercase tracking-[0.16em]" style={{ color: active ? tone[m].color : '#8b7d68' }}>{m}</span>
              </button>
            );
          })}
        </div>
      );
    case 6:
      return (
        <div className="absolute top-[48%] left-[7%] translate-x-[10px] -translate-y-1/2 z-10 flex flex-col gap-2 rounded-[18px] border border-[#fff7ea]/70 bg-[#eee1c6]/82 p-2 shadow-[8px_14px_22px_rgba(79,55,35,0.16)]" style={{ backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.38), rgba(255,255,255,0)), repeating-linear-gradient(90deg, rgba(120,92,62,0.035) 0px, rgba(120,92,62,0.035) 1px, transparent 1px, transparent 5px)' }}>
          {modes.map(m => {
            const active = power && mode === m;
            return (
              <button key={m} onClick={() => setMode(m)} className="flex w-[86px] items-center gap-2 rounded-[13px] px-2 py-1.5 transition-all active:scale-95" style={{ background: active ? 'rgba(255,249,235,0.92)' : 'rgba(255,255,255,0.22)', boxShadow: active ? `0 7px 16px ${tone[m].glow}, inset 1px 1px 2px rgba(255,255,255,0.9)` : 'inset 0 1px 1px rgba(255,255,255,0.45)' }}>
                <span className="relative h-6 w-6 rounded-full border border-white/80" style={{ background: active ? tone[m].bg : '#d7c8ad' }}>
                  <span className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: active ? tone[m].color : '#a99a80', boxShadow: active ? `0 0 10px ${tone[m].glow}` : 'none' }} />
                </span>
                {label(m, active, 'text-left')}
              </button>
            );
          })}
        </div>
      );
    case 7:
      return (
        <div className="absolute top-[48%] left-[8%] translate-x-[10px] -translate-y-1/2 z-10 flex flex-col gap-4 rounded-[999px] border border-white/80 bg-[#f5e9d1]/78 px-3 py-4 shadow-[8px_14px_26px_rgba(73,53,35,0.16),inset_0_1px_2px_rgba(255,255,255,0.86)]">
          {modes.map(m => {
            const active = power && mode === m;
            return (
              <div key={m} className="flex flex-col items-center gap-1.5">
                <button onClick={() => setMode(m)} className="relative h-10 w-10 rounded-full border border-white/75 transition-all active:scale-95" style={{ background: active ? `radial-gradient(circle at 35% 28%, #fffaf0, ${tone[m].bg} 72%)` : 'radial-gradient(circle at 35% 28%, #fff8e7, #d9c8aa)', boxShadow: active ? `0 0 0 4px rgba(255,255,255,0.26), 0 0 16px ${tone[m].glow}, inset 1px 1px 3px rgba(255,255,255,0.85)` : '4px 6px 12px rgba(80,58,38,0.14), inset 1px 1px 3px rgba(255,255,255,0.72)' }}>
                  <span className="absolute inset-[13px] rounded-full" style={{ background: tone[m].color, opacity: active ? 1 : 0.38, boxShadow: active ? `0 0 12px ${tone[m].glow}` : 'none' }} />
                </button>
                {label(m, active)}
              </div>
            );
          })}
        </div>
      );
    case 8:
      return (
        <div className="absolute top-[48%] left-[6%] translate-x-[10px] -translate-y-1/2 z-10 rounded-[24px] border border-[#fff6e6]/80 bg-[#efe0c2]/82 p-2 shadow-[8px_14px_24px_rgba(74,51,34,0.16),inset_1px_1px_2px_rgba(255,255,255,0.78)]">
          <div className="flex flex-col gap-1.5">
            {modes.map(m => {
              const active = power && mode === m;
              return (
                <button key={m} onClick={() => setMode(m)} className="flex h-8 w-[92px] items-center justify-between rounded-[18px] px-2 transition-all active:scale-95" style={{ background: active ? 'rgba(255,248,232,0.96)' : 'rgba(255,255,255,0.22)', boxShadow: active ? `inset 0 0 0 1px rgba(255,255,255,0.8), 0 7px 15px ${tone[m].glow}` : 'inset 0 1px 1px rgba(255,255,255,0.42)' }}>
                  {label(m, active)}
                  <span className="h-5 w-9 rounded-full p-[3px]" style={{ background: active ? tone[m].bg : '#dccdb0', boxShadow: 'inset 1px 1px 3px rgba(92,66,42,0.18)' }}>
                    <span className="block h-full w-3.5 rounded-full transition-transform duration-300" style={{ background: active ? tone[m].color : '#b9a98e', transform: active ? 'translateX(15px)' : 'translateX(0)', boxShadow: active ? `0 0 10px ${tone[m].glow}` : 'none' }} />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      );
    case 9:
      return (
        <div className="absolute top-[48%] left-[7.5%] translate-x-[10px] -translate-y-1/2 z-10 flex flex-col items-center gap-2 rounded-[22px] border border-white/80 bg-[#f3e4ca]/80 px-2.5 py-3 shadow-[8px_14px_24px_rgba(78,55,36,0.15)]">
          {modes.map((m, index) => {
            const active = power && mode === m;
            return (
              <button key={m} onClick={() => setMode(m)} className="relative h-[42px] w-[68px] rounded-[16px] transition-all active:scale-95" style={{ background: active ? `linear-gradient(135deg, #fff9ec, ${tone[m].bg})` : 'linear-gradient(135deg, rgba(255,248,232,0.72), rgba(221,206,178,0.58))', boxShadow: active ? `0 9px 18px ${tone[m].glow}, inset 1px 1px 2px rgba(255,255,255,0.88)` : 'inset 1px 1px 2px rgba(255,255,255,0.6), 3px 5px 10px rgba(80,56,36,0.1)' }}>
                <span className="absolute left-2 top-2 text-[8px] font-black tracking-[0.18em]" style={{ color: active ? tone[m].color : '#8a7e6b' }}>{String(index + 1).padStart(2, '0')}</span>
                <span className="absolute bottom-2 left-2 text-[8px] font-black uppercase tracking-[0.16em]" style={{ color: active ? tone[m].color : '#8a7e6b' }}>{m}</span>
                <span className="absolute right-2 top-1/2 h-5 w-1.5 -translate-y-1/2 rounded-full" style={{ background: active ? tone[m].color : '#cdbd9f', boxShadow: active ? `0 0 10px ${tone[m].glow}` : 'none' }} />
              </button>
            );
          })}
        </div>
      );
    case 10:
      return (
        <div className="absolute top-[48%] left-[7.5%] translate-x-[10px] -translate-y-1/2 z-10 flex flex-col gap-3 rounded-[999px] border border-white/75 bg-[#f5e7ce]/78 px-3 py-4 shadow-[8px_14px_24px_rgba(74,52,34,0.15)]">
          {modes.map(m => {
            const active = power && mode === m;
            return (
              <button key={m} onClick={() => setMode(m)} className="flex flex-col items-center gap-1 transition-transform active:scale-95">
                <span className="relative flex h-9 w-9 items-center justify-center rounded-full" style={{ background: active ? '#fff7e7' : '#e2d2b5', boxShadow: active ? `0 8px 18px ${tone[m].glow}, inset 1px 1px 2px rgba(255,255,255,0.9)` : 'inset 1px 1px 3px rgba(255,255,255,0.55), 3px 5px 10px rgba(80,58,38,0.1)' }}>
                  {[0, 1, 2].map(i => <span key={i} className="absolute h-1.5 w-1.5 rounded-full" style={{ background: active ? tone[m].color : '#b8a78a', transform: `rotate(${i * 120}deg) translateY(-8px)`, boxShadow: active ? `0 0 8px ${tone[m].glow}` : 'none' }} />)}
                </span>
                {label(m, active)}
              </button>
            );
          })}
        </div>
      );
    case 11:
      return (
        <div className="absolute top-[48%] left-[6%] translate-x-[10px] -translate-y-1/2 z-10 flex flex-col gap-2 rounded-[20px] border border-white/75 bg-[#f2e4c8]/78 p-2 shadow-[8px_14px_24px_rgba(75,53,35,0.15),inset_1px_1px_2px_rgba(255,255,255,0.78)]">
          {modes.map(m => {
            const active = power && mode === m;
            return (
              <button key={m} onClick={() => setMode(m)} className="flex w-[88px] items-center gap-2 rounded-[14px] px-2 py-2 transition-all active:scale-95" style={{ background: active ? '#fff7e7' : 'rgba(255,255,255,0.18)', boxShadow: active ? `0 8px 16px ${tone[m].glow}, inset 1px 1px 2px rgba(255,255,255,0.85)` : 'inset 0 1px 1px rgba(255,255,255,0.4)' }}>
                <span className="h-7 w-2 rounded-full" style={{ background: active ? tone[m].color : '#ccb99b', boxShadow: active ? `0 0 12px ${tone[m].glow}` : 'inset 1px 1px 2px rgba(85,62,40,0.18)' }} />
                <span className="flex flex-col items-start gap-1">
                  {label(m, active, 'text-left')}
                  <span className="h-[3px] w-9 rounded-full" style={{ background: active ? tone[m].color : '#d4c4a7', opacity: active ? 0.7 : 0.45 }} />
                </span>
              </button>
            );
          })}
        </div>
      );
    case 12: // Flush Walnut (Matte Round)
      return (
        <div className="absolute top-[48%] left-[8%] translate-x-[10px] -translate-y-1/2 flex flex-col gap-5 px-[13px] pt-5 pb-[22px] rounded-full z-10" style={{ 
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.06), rgba(0,0,0,0.12)), url("/textures/walnut.png")', 
          backgroundSize: 'cover',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.6), inset 0 -1px 1px rgba(255,255,255,0.08), 0 1px 1px rgba(255,255,255,0.45), 0 -1px 1px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.8)'
        }}>
          <FlavorLabel />
          {modes.map(m => {
            const ledColor = m === 'calm' ? '#4ade80' : m === 'vintage' ? '#fb923c' : '#ef4444';
            return (
              <div key={m} className="flex flex-col items-center gap-2">
                <button onClick={() => setMode(m)} className={`w-9 h-9 rounded-xl transition-all flex items-center justify-center border border-black
                  ${power && mode === m ? 'bg-[#111] shadow-[inset_2px_2px_5px_rgba(0,0,0,0.9)] scale-95' : 'bg-[#262626] shadow-[0_4px_6px_rgba(0,0,0,0.8),inset_1px_1px_1px_rgba(255,255,255,0.1)]'}
                `}>
                  <div 
                    className={`w-3 h-[3px] rounded-full ${modeLedFlicker(m)} ${!power || mode !== m ? 'bg-[#111] shadow-[inset_1px_1px_1px_rgba(0,0,0,0.5)]' : ''}`}
                    style={power && mode === m ? { backgroundColor: ledColor, boxShadow: `0 0 9px ${ledColor}` } : {}}
                  />
                </button>
                <span className="text-[9px] font-bold tracking-[0.25em] uppercase drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]" style={{ color: '#d3ba8c' }}>{m}</span>
              </div>
            );
          })}
        </div>
      );
    case 13: // Walnut Separated Round
      return (
        <div className="absolute top-[48%] left-[8%] translate-x-[10px] -translate-y-1/2 flex flex-col gap-5 px-[14px] py-[15px] rounded-[2.4rem] z-10" style={{ 
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.05), rgba(0,0,0,0.12)), url("/textures/walnut.png")', 
          backgroundSize: 'cover',
          boxShadow: '0 0 0 1px #2b170b, 0 0 0 2px #78502a, inset 0 1px 2px rgba(0,0,0,0.6), inset 0 -1px 1px rgba(255,255,255,0.08)',
          border: '1px solid rgba(0,0,0,0.8)'
        }}>
          <FlavorLabel />
          {modes.map(m => {
            const ledColor = m === 'calm' ? '#4ade80' : m === 'vintage' ? '#fb923c' : '#ef4444';
            return (
              <div key={m} className="flex flex-col items-center gap-2">
                <button onClick={() => setMode(m)} className={`w-9 h-9 rounded-xl transition-all flex items-center justify-center border border-black
                  ${power && mode === m ? 'bg-[#111] shadow-[inset_2px_2px_5px_rgba(0,0,0,0.9)] scale-95' : 'bg-[#262626] shadow-[0_4px_6px_rgba(0,0,0,0.8),inset_1px_1px_1px_rgba(255,255,255,0.1)]'}
                `}>
                  <div 
                    className={`w-3 h-[3px] rounded-full ${modeLedFlicker(m)} ${!power || mode !== m ? 'bg-[#111] shadow-[inset_1px_1px_1px_rgba(0,0,0,0.5)]' : ''}`}
                    style={power && mode === m ? { backgroundColor: ledColor, boxShadow: `0 0 9px ${ledColor}` } : {}}
                  />
                </button>
                <span className={`text-[10px] font-bold ${m === 'unstable' ? 'tracking-[0.12em]' : 'tracking-[0.15em]'} uppercase drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]`} style={{ color: '#d3ba8c' }}>{m}</span>
              </div>
            );
          })}
        </div>
      );
    case 14: // Walnut Separated Soft
      return (
        <div className="absolute top-[48%] left-[8%] translate-x-[10px] -translate-y-1/2 flex flex-col gap-5 px-[13px] py-4 rounded-[1.15rem] z-10" style={{ 
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.06), rgba(0,0,0,0.12)), url("/textures/walnut.png")', 
          backgroundSize: 'cover',
          boxShadow: '0 0 0 1px #2b170b, 0 0 0 2px #78502a, inset 0 1px 2px rgba(0,0,0,0.6), inset 0 -1px 1px rgba(255,255,255,0.08)',
          border: '1px solid rgba(0,0,0,0.8)'
        }}>
          <FlavorLabel />
          {modes.map(m => {
            const ledColor = m === 'calm' ? '#4ade80' : m === 'vintage' ? '#fb923c' : '#ef4444';
            return (
              <div key={m} className="flex flex-col items-center gap-2">
                <button onClick={() => setMode(m)} className={`w-9 h-9 rounded-xl transition-all flex items-center justify-center border border-black
                  ${power && mode === m ? 'bg-[#111] shadow-[inset_2px_2px_5px_rgba(0,0,0,0.9)] scale-95' : 'bg-[#262626] shadow-[0_4px_6px_rgba(0,0,0,0.8),inset_1px_1px_1px_rgba(255,255,255,0.1)]'}
                `}>
                  <div 
                    className={`w-3 h-[3px] rounded-full ${modeLedFlicker(m)} ${!power || mode !== m ? 'bg-[#111] shadow-[inset_1px_1px_1px_rgba(0,0,0,0.5)]' : ''}`}
                    style={power && mode === m ? { backgroundColor: ledColor, boxShadow: `0 0 9px ${ledColor}` } : {}}
                  />
                </button>
                <span className="text-[9px] font-bold tracking-[0.25em] uppercase drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]" style={{ color: '#d3ba8c' }}>{m}</span>
              </div>
            );
          })}
        </div>
      );
    default: return null;
  }
};

const FRAMES = [
  { name: 'Oiled Walnut - Double Join Heavy Warm Highlight', inset: '-inset-5', panelInset: 'inset-1', radius: '4.5rem', panelRadius: '3.9rem',
    style: {
      backgroundImage: 'url("/textures/walnut.png")',
      backgroundSize: '200px',
      boxShadow: 'inset 0 4px 9px rgba(244,205,151,0.082), inset 0 -8px 20px rgba(0,0,0,0.5), 10px 15px 35px rgba(0,0,0,0.6)',
      border: '1px solid #111'
    },
    panelStyle: {
      boxShadow: '0 40px 80px rgba(0,0,0,0.4), 0 20px 30px rgba(0,0,0,0.2), 0 0 0 1px #2b170b, 0 0 0 2px #78502a'
    }
  },
  { name: 'Oiled Walnut - Double Join Heavy Varnish Roll', inset: '-inset-5', panelInset: 'inset-1', radius: '4.5rem', panelRadius: '3.9rem',
    style: {
      backgroundImage: `
        linear-gradient(180deg, rgba(255,219,166,0.12) 0%, rgba(146,82,37,0.045) 7%, rgba(33,17,8,0.09) 18%, transparent 38%),
        url("/textures/walnut.png")
      `,
      backgroundSize: '100% 100%, 200px',
      backgroundBlendMode: 'soft-light, normal',
      boxShadow: 'inset 0 1px 0 rgba(255,236,198,0.16), inset 0 7px 15px rgba(160,95,47,0.09), inset 0 -10px 22px rgba(0,0,0,0.52), 10px 15px 35px rgba(0,0,0,0.6)',
      border: '1px solid #111'
    },
    panelStyle: {
      boxShadow: '0 40px 80px rgba(0,0,0,0.4), 0 20px 30px rgba(0,0,0,0.2), 0 0 0 1px #2b170b, 0 0 0 2px #78502a'
    }
  },
  { name: 'Oiled Walnut - Double Join Heavy Studio Sweep', inset: '-inset-5', panelInset: 'inset-1', radius: '4.5rem', panelRadius: '3.9rem',
    style: {
      backgroundImage: `
        radial-gradient(ellipse at 18% 0%, rgba(255,224,177,0.18) 0%, rgba(183,112,55,0.07) 18%, transparent 42%),
        linear-gradient(100deg, rgba(255,217,160,0.07) 0%, rgba(120,67,30,0.02) 28%, rgba(0,0,0,0.13) 100%),
        url("/textures/walnut.png")
      `,
      backgroundSize: '100% 62%, 100% 100%, 200px',
      backgroundRepeat: 'no-repeat, no-repeat, repeat',
      backgroundBlendMode: 'screen, soft-light, normal',
      boxShadow: 'inset 0 2px 3px rgba(255,226,185,0.11), inset -9px 0 18px rgba(0,0,0,0.18), inset 0 -9px 21px rgba(0,0,0,0.5), 10px 15px 35px rgba(0,0,0,0.6)',
      border: '1px solid #111'
    },
    panelStyle: {
      boxShadow: '0 40px 80px rgba(0,0,0,0.4), 0 20px 30px rgba(0,0,0,0.2), 0 0 0 1px #2b170b, 0 0 0 2px #78502a'
    }
  },
  { name: 'Oiled Walnut - Double Join Heavy Oil Depth Balanced', inset: '-inset-5', panelInset: 'inset-1', radius: '4.5rem', panelRadius: '3.9rem',
    style: {
      backgroundImage: `
        radial-gradient(ellipse at 50% -8%, rgba(255,232,190,0.085) 0%, rgba(190,121,61,0.036) 20%, rgba(0,0,0,0.052) 58%, transparent 82%),
        url("/textures/walnut.png")
      `,
      backgroundSize: '100% 78%, 200px',
      backgroundRepeat: 'no-repeat, repeat',
      backgroundBlendMode: 'soft-light, normal',
      filter: 'saturate(1.018) contrast(1.025)',
      boxShadow: 'inset 0 2px 2px rgba(255,225,180,0.06), inset 0 8px 18px rgba(95,54,25,0.095), inset 0 -8px 20px rgba(0,0,0,0.45), 10px 15px 35px rgba(0,0,0,0.6)',
      border: '1px solid #111'
    },
    panelStyle: {
      boxShadow: '0 40px 80px rgba(0,0,0,0.4), 0 20px 30px rgba(0,0,0,0.2), 0 0 0 1px #2b170b, 0 0 0 2px #78502a'
    }
  }
];

const BALANCED_WALNUT_FRAME_STYLE_INDEX = 3;
const normalizeFrameStyle = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return BALANCED_WALNUT_FRAME_STYLE_INDEX;
  if (numeric === 20) return BALANCED_WALNUT_FRAME_STYLE_INDEX;
  if (numeric === 5) return BALANCED_WALNUT_FRAME_STYLE_INDEX;
  const normalized = Math.trunc(numeric);
  if (normalized < 0 || normalized >= FRAMES.length) return BALANCED_WALNUT_FRAME_STYLE_INDEX;
  return normalized;
};

const PANEL_DEPTH_STYLES = [
  {
    name: 'None',
    style: null
  },
  {
    name: 'Soft Recess',
    style: {
      opacity: 0.74,
      background: 'radial-gradient(ellipse at 44% 42%, transparent 0%, transparent 58%, rgba(52,31,17,0.028) 82%, rgba(52,31,17,0.06) 100%)',
      boxShadow: 'inset 5px 6px 14px rgba(42,24,13,0.045), inset -4px -4px 16px rgba(255,248,232,0.018)',
      mixBlendMode: 'multiply'
    }
  },
  {
    name: 'Top Left Rim',
    style: {
      opacity: 0.68,
      background: 'linear-gradient(135deg, rgba(42,24,13,0.05) 0%, rgba(42,24,13,0.018) 10%, transparent 26%)',
      boxShadow: 'inset 4px 5px 12px rgba(42,24,13,0.052), inset -2px -2px 12px rgba(255,248,232,0.014)',
      mixBlendMode: 'multiply'
    }
  },
  {
    name: 'Deep Face Feather',
    style: {
      opacity: 0.62,
      background: 'radial-gradient(ellipse at 50% 48%, transparent 0%, transparent 48%, rgba(46,27,15,0.024) 75%, rgba(46,27,15,0.07) 100%)',
      boxShadow: 'inset 0 0 30px rgba(42,24,13,0.045), inset 7px 8px 20px rgba(42,24,13,0.034)',
      mixBlendMode: 'multiply'
    }
  },
  {
    name: 'Studio Corner Falloff',
    style: {
      opacity: 0.7,
      background: 'radial-gradient(circle at 22% 18%, rgba(255,248,232,0.018) 0%, transparent 24%), radial-gradient(ellipse at 82% 86%, rgba(42,24,13,0.055) 0%, rgba(42,24,13,0.02) 36%, transparent 68%)',
      boxShadow: 'inset 4px 5px 13px rgba(42,24,13,0.04), inset -5px -5px 18px rgba(42,24,13,0.022)',
      mixBlendMode: 'multiply'
    }
  }
];

const OBJECT_CONTACT_SHADOW_STYLES = [
  { name: 'None', opacity: 0 },
  { name: 'Soft Contact', opacity: 0.78, contact: 1, cast: 0.55, distance: 1, blur: 1 },
  { name: 'Studio Cast', opacity: 0.86, contact: 0.95, cast: 0.9, distance: 1.35, blur: 1.1 },
  { name: 'Raised Hardware', opacity: 0.92, contact: 1.18, cast: 1.05, distance: 1.65, blur: 1.22 },
  { name: 'Deep Mounted', opacity: 0.96, contact: 1.28, cast: 1.28, distance: 1.95, blur: 1.35 }
];

const PANEL_LIGHTING_STYLES = [
  { name: 'None', style: null },
  {
    name: 'Gentle Studio',
    style: {
      opacity: 0.72,
      background: 'radial-gradient(circle at 18% 15%, rgba(255,248,232,0.045) 0%, rgba(255,248,232,0.018) 26%, transparent 54%), radial-gradient(ellipse at 86% 88%, rgba(56,31,18,0.04) 0%, rgba(56,31,18,0.018) 38%, transparent 70%)',
      mixBlendMode: 'soft-light'
    }
  },
  {
    name: 'Warm Top Left',
    style: {
      opacity: 0.76,
      background: 'linear-gradient(135deg, rgba(255,235,196,0.055) 0%, rgba(255,235,196,0.018) 30%, transparent 52%), radial-gradient(ellipse at 88% 86%, rgba(48,27,16,0.048) 0%, transparent 70%)',
      mixBlendMode: 'soft-light'
    }
  },
  {
    name: 'Dim Console',
    style: {
      opacity: 0.82,
      background: 'radial-gradient(circle at 22% 14%, rgba(255,246,226,0.03) 0%, transparent 34%), linear-gradient(135deg, transparent 0%, transparent 46%, rgba(38,22,14,0.055) 100%)',
      mixBlendMode: 'multiply'
    }
  },
  {
    name: 'Soft Diagonal',
    style: {
      opacity: 0.7,
      background: 'linear-gradient(135deg, rgba(255,248,232,0.038) 0%, transparent 38%, rgba(44,25,15,0.034) 100%)',
      mixBlendMode: 'soft-light'
    }
  }
];

const PANEL_SURFACE_TEXTURE_STYLES = [
  { name: 'None', style: null },
  {
    name: 'Fine Matte',
    style: {
      opacity: 0.34,
      backgroundImage: textureDataUrl('<svg viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="1.15" numOctaves="2" seed="73" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 0.12"/></feComponentTransfer></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>'),
      backgroundSize: '170px 170px',
      mixBlendMode: 'multiply'
    }
  },
  {
    name: 'Paper Grain',
    style: {
      opacity: 0.42,
      backgroundImage: `${textureDataUrl('<svg viewBox="0 0 260 260" xmlns="http://www.w3.org/2000/svg"><filter id="p"><feTurbulence type="fractalNoise" baseFrequency="0.82 0.24" numOctaves="4" seed="19" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#p)" opacity="0.42"/></svg>')}, repeating-linear-gradient(18deg, rgba(82,58,38,0.018) 0px, rgba(82,58,38,0.018) 1px, transparent 1px, transparent 11px)`,
      backgroundSize: '230px 230px, 100% 100%',
      mixBlendMode: 'multiply'
    }
  },
  {
    name: 'Subtle Speckle',
    style: {
      opacity: 0.26,
      backgroundImage: textureDataUrl('<svg viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg"><filter id="s"><feTurbulence type="fractalNoise" baseFrequency="1.9" numOctaves="2" seed="41" stitchTiles="stitch"/><feComponentTransfer><feFuncA type="discrete" tableValues="0 0 0.18 0"/></feComponentTransfer></filter><rect width="100%" height="100%" filter="url(#s)"/></svg>'),
      backgroundSize: '120px 120px',
      mixBlendMode: 'multiply'
    }
  },
  {
    name: 'Warm Mottle',
    style: {
      opacity: 0.36,
      backgroundImage: textureDataUrl('<svg viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg"><filter id="m"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="5" seed="11"/><feGaussianBlur stdDeviation="1.1"/><feColorMatrix type="matrix" values="0 0 0 0 0.36 0 0 0 0 0.24 0 0 0 0 0.14 0 0 0 0.28 0"/></filter><rect width="100%" height="100%" filter="url(#m)"/></svg>'),
      backgroundSize: '420px 420px',
      mixBlendMode: 'multiply'
    }
  }
];

const DEFAULT_DEPTH_MODEL = {
  enabled: true,
  preset: 1,
  shadowAngle: 45,
  lightHeight: 62,
  heightScale: 100,
  contactStrength: 38,
  castStrength: 34,
  softness: 58,
  opacity: 100,
  heights: {
    smallKnobs: 8,
    bigDial: 7,
    modules: 5,
    slabs: 3,
    buttons: 5
  }
};

const DEFAULT_CENTER_DEPTH_MODEL = {
  enabled: false,
  shadowAngle: 45,
  height: 4,
  distance: 34,
  contactStrength: 18,
  castStrength: 16,
  softness: 70,
  opacity: 100,
  size: 78,
  x: 0,
  y: 1
};

const DEPTH_MODEL_PRESETS = [
  { name: 'None', patch: { enabled: false } },
  { name: 'Natural Low', patch: { enabled: true, shadowAngle: 45, lightHeight: 70, heightScale: 72, contactStrength: 28, castStrength: 22, softness: 68 } },
  { name: 'Studio Realism', patch: { enabled: true, shadowAngle: 45, lightHeight: 58, heightScale: 96, contactStrength: 38, castStrength: 34, softness: 58 } },
  { name: 'Raised Hardware', patch: { enabled: true, shadowAngle: 47, lightHeight: 48, heightScale: 118, contactStrength: 46, castStrength: 42, softness: 52 } },
  { name: 'Long Soft Cast', patch: { enabled: true, shadowAngle: 43, lightHeight: 38, heightScale: 112, contactStrength: 30, castStrength: 52, softness: 78 } }
];

const normalizeDepthModel = (settings = {}) => ({
  ...DEFAULT_DEPTH_MODEL,
  ...(settings || {}),
  heights: {
    ...DEFAULT_DEPTH_MODEL.heights,
    ...(settings?.heights || {})
  }
});
CODE_DEFAULT_DESIGN.depthModel = DEFAULT_DEPTH_MODEL;

const normalizeCenterDepthModel = (settings = {}) => ({
  ...DEFAULT_CENTER_DEPTH_MODEL,
  ...(settings || {})
});
CODE_DEFAULT_DESIGN.centerDepthModel = DEFAULT_CENTER_DEPTH_MODEL;

const DEPTH_MODEL_OBJECT_OFFSETS = {
  input: { x: -78, y: -15 },
  output: { x: 78, y: -15 },
  noise: { x: -13, y: 0 },
  sweeten: { x: -13, y: 0 },
  sat: { x: -13, y: 0 },
  filter: { x: -13, y: 0 },
  rate: { x: 0, y: -18 },
  mix: { x: 0, y: -14 },
  center: { x: 0, y: 1 },
  flavor: { x: 0, y: 0 },
  display: { x: 0, y: 0 },
  lfo: { x: 0, y: 0 }
};

const RIGHT_KNOB_POSITIONS = {
  noise: { x: 647, y: 342 },
  sweeten: { x: 740, y: 342 },
  sat: { x: 647, y: 452 },
  filter: { x: 740, y: 452 }
};

const IO_SCALE_NAMES = [
  "None", 
  "Classic Dots", 
  "Studio Ticks", 
  "Minimalist Arcs", 
  "Vintage Continuous",
  "Modern Percent",
  "Bold Industrial",
  "Japandi Radial",
  "Decibel Arcs",
  "Radar Sweep",
  "Broadcast Ring",
  "Precision Diamond",
  "Double Arc",
  "Compass Rose"
];

const KnobScaleRing = ({ styleIndex, size = 55 }) => {
  if (styleIndex === 0) return null;
  
  const r = size / 2 + 25; // Increased radius for scale to prevent clipping
  const vBox = `-${r} -${r} ${r*2} ${r*2}`;
  const ringStyle = { 
    width: r*2, 
    height: r*2, 
    top: size / 2, 
    left: '50%', 
    transform: 'translate(-50%, -50%)' 
  };
  const svgClass = "absolute pointer-events-none overflow-visible";

  switch (styleIndex) {
    case 1:
      return (
        <svg viewBox={vBox} className={svgClass} style={ringStyle}>
          {[...Array(11)].map((_, i) => {
            const angle = -140 + (i * 28);
            const rad = (angle - 90) * (Math.PI / 180);
            return <circle key={i} cx={Math.cos(rad) * (r-14)} cy={Math.sin(rad) * (r-14)} r="1.8" fill="#5a5549" opacity="0.8" />;
          })}
          <text x={0} y={-r + 9} textAnchor="middle" fill="#3a352d" fontSize="10" fontWeight="bold" opacity="0.9">0</text>
          <text x={-r + 14} y={r - 16} textAnchor="end" fill="#5a5549" fontSize="9" fontWeight="bold" opacity="0.8">-24</text>
          <text x={r - 14} y={r - 16} textAnchor="start" fill="#5a5549" fontSize="9" fontWeight="bold" opacity="0.8">+12</text>
        </svg>
      );
    case 2:
      return (
        <svg viewBox={vBox} className={svgClass} style={ringStyle}>
          {[...Array(10)].map((_, i) => {
            const angle = -140 + (i * 31.11);
            return <line key={i} x1="0" y1={-r + 11} x2="0" y2={-r + 17} stroke="#5a5549" strokeWidth="1.2" opacity="0.8" transform={`rotate(${angle})`} />;
          })}
          <text x={-r + 15} y={r - 13} textAnchor="end" fill="#5a5549" fontSize="7" fontWeight="bold" opacity="0.7">1</text>
          <text x={r - 15} y={r - 13} textAnchor="start" fill="#5a5549" fontSize="7" fontWeight="bold" opacity="0.7">10</text>
        </svg>
      );
    case 3:
      return (
        <svg viewBox={vBox} className={svgClass} style={ringStyle}>
          <path d={`M ${Math.cos(-230 * Math.PI/180)*(r-13)} ${Math.sin(-230 * Math.PI/180)*(r-13)} A ${r-13} ${r-13} 0 0 1 ${Math.cos(-95 * Math.PI/180)*(r-13)} ${Math.sin(-95 * Math.PI/180)*(r-13)}`} fill="none" stroke="#5a5549" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          <path d={`M ${Math.cos(-85 * Math.PI/180)*(r-13)} ${Math.sin(-85 * Math.PI/180)*(r-13)} A ${r-13} ${r-13} 0 0 1 ${Math.cos(50 * Math.PI/180)*(r-13)} ${Math.sin(50 * Math.PI/180)*(r-13)}`} fill="none" stroke="#3a352d" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
        </svg>
      );
    case 4:
      return (
        <svg viewBox={vBox} className={svgClass} style={ringStyle}>
          <path d={`M ${Math.cos(-230 * Math.PI/180)*(r-13)} ${Math.sin(-230 * Math.PI/180)*(r-13)} A ${r-13} ${r-13} 0 0 1 ${Math.cos(50 * Math.PI/180)*(r-13)} ${Math.sin(50 * Math.PI/180)*(r-13)}`} fill="none" stroke="#5a5549" strokeWidth="3" opacity="0.4" />
          {[...Array(21)].map((_, i) => {
            const angle = -140 + (i * 14);
            const isMajor = i % 5 === 0;
            return <line key={i} x1="0" y1={-r + 9} x2="0" y2={-r + 15} stroke="#5a5549" strokeWidth={isMajor ? 1.5 : 0.8} opacity="0.8" transform={`rotate(${angle})`} />;
          })}
        </svg>
      );
    case 5:
      return (
        <svg viewBox={vBox} className={svgClass} style={ringStyle}>
          {[...Array(31)].map((_, i) => {
            const angle = -140 + (i * 9.33);
            const rad = (angle - 90) * (Math.PI / 180);
            return <circle key={i} cx={Math.cos(rad) * (r-13)} cy={Math.sin(rad) * (r-13)} r="0.8" fill="#3a352d" opacity={0.4 + (i/30)*0.6} />;
          })}
          <text x={-r + 9} y={r - 9} textAnchor="end" fill="#5a5549" fontSize="6" opacity="0.8">0%</text>
          <text x={r - 9} y={r - 9} textAnchor="start" fill="#3a352d" fontSize="6" opacity="1.0">100%</text>
        </svg>
      );
    case 6:
      return (
        <svg viewBox={vBox} className={svgClass} style={ringStyle}>
          {[0, 1, 2, 3, 4].map((i) => {
            const angle = -140 + (i * 70);
            return <line key={i} x1="0" y1={-r + 11} x2="0" y2={-r + 17} stroke="#3a352d" strokeWidth="3" strokeLinecap="square" transform={`rotate(${angle})`} />;
          })}
          {[0, 1, 2, 3, 4].map((i) => {
            const angle = -140 + (i * 70);
            return <line key={`i-${i}`} x1="0" y1={-r + 12} x2="0" y2={-r + 16} stroke="#8b7b65" strokeWidth="1.5" strokeLinecap="square" opacity="0.9" transform={`rotate(${angle})`} />;
          })}
        </svg>
      );
    case 7:
      return (
        <svg viewBox={vBox} className={svgClass} style={ringStyle}>
          <path d={`M ${Math.cos(-230 * Math.PI/180)*(r-15)} ${Math.sin(-230 * Math.PI/180)*(r-15)} A ${r-15} ${r-15} 0 0 1 ${Math.cos(50 * Math.PI/180)*(r-15)} ${Math.sin(50 * Math.PI/180)*(r-15)}`} fill="none" stroke="#5a5549" strokeWidth="0.8" strokeDasharray="2 4" opacity="0.7" />
          <path d={`M ${Math.cos(-230 * Math.PI/180)*(r-9)} ${Math.sin(-230 * Math.PI/180)*(r-9)} A ${r-9} ${r-9} 0 0 1 ${Math.cos(50 * Math.PI/180)*(r-9)} ${Math.sin(50 * Math.PI/180)*(r-9)}`} fill="none" stroke="#5a5549" strokeWidth="0.4" strokeDasharray="1 3" opacity="0.5" />
          <circle cx={Math.cos(-90 * Math.PI/180)*(r-15)} cy={Math.sin(-90 * Math.PI/180)*(r-15)} r="2" fill="#3a352d" opacity="1.0" />
        </svg>
      );
    case 8: // Decibel Arcs
      return (
        <svg viewBox={vBox} className={svgClass} style={ringStyle}>
          <path d={`M ${Math.cos(-230 * Math.PI/180)*(r-14)} ${Math.sin(-230 * Math.PI/180)*(r-14)} A ${r-14} ${r-14} 0 0 1 ${Math.cos(50 * Math.PI/180)*(r-14)} ${Math.sin(50 * Math.PI/180)*(r-14)}`} fill="none" stroke="#5a5549" strokeWidth="0.5" opacity="0.3" />
          <text x={0} y={-r + 9} textAnchor="middle" fill="#3a352d" fontSize="9" fontWeight="bold">0</text>
          <text x={-r + 14} y={r - 16} textAnchor="end" fill="#5a5549" fontSize="8" fontWeight="bold">-12</text>
          <text x={r - 14} y={r - 16} textAnchor="start" fill="#5a5549" fontSize="8" fontWeight="bold">+12</text>
          {[0, 1, 2].map(i => {
            const a = -140 + (i * 140);
            return <circle key={i} cx={Math.cos((a-90)*Math.PI/180)*(r-14)} cy={Math.sin((a-90)*Math.PI/180)*(r-14)} r="2" fill="#3a352d" />;
          })}
        </svg>
      );
    case 9: // Radar Sweep
      return (
        <svg viewBox={vBox} className={svgClass} style={ringStyle}>
          {[...Array(20)].map((_, i) => {
            const angle = -140 + (i * 14.7);
            const rad = (angle - 90) * (Math.PI / 180);
            return <circle key={i} cx={Math.cos(rad)*(r-13)} cy={Math.sin(rad)*(r-13)} r={1 + i*0.1} fill="#5a5549" opacity={0.1 + i*0.04} />;
          })}
        </svg>
      );
    case 10: // Broadcast Ring
      return (
        <svg viewBox={vBox} className={svgClass} style={ringStyle}>
          {[...Array(6)].map((_, i) => {
            const angle = -140 + (i * 56);
            return <line key={i} x1="0" y1={-r + 12} x2="0" y2={-r + 19} stroke="#5a5549" strokeWidth="4" strokeLinecap="round" opacity="0.8" transform={`rotate(${angle})`} />;
          })}
          <circle cx="0" cy="0" r={r-15} fill="none" stroke="#5a5549" strokeWidth="1" strokeDasharray="2 10" opacity="0.2" />
        </svg>
      );
    case 11: // Precision Diamond
      return (
        <svg viewBox={vBox} className={svgClass} style={ringStyle}>
          {[...Array(11)].map((_, i) => {
            const angle = -140 + (i * 28);
            return <rect key={i} x="-2" y={-r + 13} width="4" height="4" fill="#3a352d" opacity="0.8" transform={`rotate(${angle})`} />;
          })}
        </svg>
      );
    case 12: // Double Arc
      return (
        <svg viewBox={vBox} className={svgClass} style={ringStyle}>
          <path d={`M ${Math.cos(-230 * Math.PI/180)*(r-15)} ${Math.sin(-230 * Math.PI/180)*(r-15)} A ${r-15} ${r-15} 0 0 1 ${Math.cos(50 * Math.PI/180)*(r-15)} ${Math.sin(50 * Math.PI/180)*(r-15)}`} fill="none" stroke="#3a352d" strokeWidth="2" opacity="0.8" />
          <path d={`M ${Math.cos(-230 * Math.PI/180)*(r-10)} ${Math.sin(-230 * Math.PI/180)*(r-10)} A ${r-10} ${r-10} 0 0 1 ${Math.cos(50 * Math.PI/180)*(r-10)} ${Math.sin(50 * Math.PI/180)*(r-10)}`} fill="none" stroke="#5a5549" strokeWidth="1" strokeDasharray="1 3" opacity="0.5" />
        </svg>
      );
    case 13: // Compass Rose
      return (
        <svg viewBox={vBox} className={svgClass} style={ringStyle}>
          {[0, 90, 180, 270].map(a => (
            <g key={a} transform={`rotate(${a - 45})`}>
              <line x1="0" y1={-r + 10} x2="0" y2={-r + 20} stroke="#3a352d" strokeWidth="1.5" />
              <line x1="-5" y1={-r + 15} x2="5" y2={-r + 15} stroke="#3a352d" strokeWidth="0.5" />
            </g>
          ))}
          <circle cx="0" cy="0" r={r-15} fill="none" stroke="#5a5549" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.3" />
        </svg>
      );
    default: return null;
  }
};

export default function App({ websiteMode = false }) {
  const pluginStageRef = useRef(null);
  const savedDesignDefaults = useRef(websiteMode ? {} : loadSavedDesignDefaults()).current;
  const initial = (key, fallback) => savedDesignDefaults[key] ?? fallback;
  const [power, setPower] = useState(() => initial('power', CODE_DEFAULT_DESIGN.power));
  const [input, setInput] = useState(() => initial('input', CODE_DEFAULT_DESIGN.input));
  const [output, setOutput] = useState(() => initial('output', CODE_DEFAULT_DESIGN.output));
  const [ioLinkStyle, setIoLinkStyle] = useState(() => initial('ioLinkStyle', CODE_DEFAULT_DESIGN.ioLinkStyle));
  const [ioLinked, setIoLinked] = useState(() => initial('ioLinked', CODE_DEFAULT_DESIGN.ioLinked));
  const [isInputDragging, setIsInputDragging] = useState(false);
  const [isOutputDragging, setIsOutputDragging] = useState(false);
  const [outerRingScaleStyle, setOuterRingScaleStyle] = useState(() => initial('outerRingScaleStyle', CODE_DEFAULT_DESIGN.outerRingScaleStyle));
  const [showWabiSabi, setShowWabiSabi] = useState(() => initial('showWabiSabi', CODE_DEFAULT_DESIGN.showWabiSabi));
  const [readoutStyleIndex, setReadoutStyleIndex] = useState(() => initial('readoutStyleIndex', CODE_DEFAULT_DESIGN.readoutStyleIndex));
  const [topBarStyle, setTopBarStyle] = useState(() => normalizeTopBarStyle(initial('topBarStyle', CODE_DEFAULT_DESIGN.topBarStyle ?? 0)));
  const [topBarCustomStyles, setTopBarCustomStyles] = useState(() => normalizeTopBarCustomStyles(initial('topBarCustomStyles', CODE_DEFAULT_DESIGN.topBarCustomStyles)));
  const [globalMastering, setGlobalMastering] = useState(() => normalizeGlobalMastering(initial('globalMastering', CODE_DEFAULT_DESIGN.globalMastering || DEFAULT_GLOBAL_MASTERING)));
  const [depthModel, setDepthModel] = useState(() => normalizeDepthModel(initial('depthModel', CODE_DEFAULT_DESIGN.depthModel || DEFAULT_DEPTH_MODEL)));
  const [centerDepthModel, setCenterDepthModel] = useState(() => normalizeCenterDepthModel(initial('centerDepthModel', CODE_DEFAULT_DESIGN.centerDepthModel || DEFAULT_CENTER_DEPTH_MODEL)));
  const [hqMode, setHqMode] = useState(() => initial('hqMode', CODE_DEFAULT_DESIGN.hqMode ?? false));
  const [cableToneEnabled, setCableToneEnabled] = useState(() => initial('cableToneEnabled', CODE_DEFAULT_DESIGN.cableToneEnabled ?? true));
  const [userPresets, setUserPresets] = useState(() => websiteMode ? [] : loadUserPresets());
  const [currentUserPresetId, setCurrentUserPresetId] = useState(null);
  const [activeDisplayParam, setActiveDisplayParam] = useState('drift');
  const [displayAnimationTime, setDisplayAnimationTime] = useState(0);
  const isIoDragging = isInputDragging || isOutputDragging;
  const inputValueRef = useRef(input);
  const outputValueRef = useRef(output);
  const [drift, setDrift] = useState(() => initial('drift', CODE_DEFAULT_DESIGN.drift));
  const [spread, setSpread] = useState(() => initial('spread', CODE_DEFAULT_DESIGN.spread));
  const [character, setCharacter] = useState(() => initial('character', CODE_DEFAULT_DESIGN.character));
  const [sweeten, setSweeten] = useState(() => initial('sweeten', CODE_DEFAULT_DESIGN.sweeten));
  const [biasHF, setBiasHF] = useState(() => initial('biasHF', CODE_DEFAULT_DESIGN.biasHF));
  const [noise, setNoise] = useState(() => initial('noise', CODE_DEFAULT_DESIGN.noise));
  const [rate, setRate] = useState(() => initial('rate', CODE_DEFAULT_DESIGN.rate));
  const [depth, setDepth] = useState(() => initial('depth', CODE_DEFAULT_DESIGN.depth));
  const [stereoPhase, setStereoPhase] = useState(() => initial('stereoPhase', CODE_DEFAULT_DESIGN.stereoPhase));
  const [depthDisplayStyle, setDepthDisplayStyle] = useState(() => normalizeDepthDisplayAnimationStyle(initial('depthDisplayStyle', CODE_DEFAULT_DESIGN.depthDisplayStyle ?? 0)));
  const [phaseDisplayStyle, setPhaseDisplayStyle] = useState(() => normalizePhaseDisplayAnimationStyle(initial('phaseDisplayStyle', CODE_DEFAULT_DESIGN.phaseDisplayStyle ?? 0)));
  const [spreadDisplayStyle, setSpreadDisplayStyle] = useState(() => normalizeSpreadDisplayAnimationStyle(initial('spreadDisplayStyle', CODE_DEFAULT_DESIGN.spreadDisplayStyle ?? 0)));
  const [noiseDisplayStyle, setNoiseDisplayStyle] = useState(() => normalizeNoiseDisplayAnimationStyle(initial('noiseDisplayStyle', CODE_DEFAULT_DESIGN.noiseDisplayStyle ?? 0)));
  const [mode, setMode] = useState(() => initial('mode', CODE_DEFAULT_DESIGN.mode));
  const [mix, setMix] = useState(() => initial('mix', CODE_DEFAULT_DESIGN.mix ?? 50));
  const [lfoEnabled, setLfoEnabled] = useState(() => initial('lfoEnabled', CODE_DEFAULT_DESIGN.lfoEnabled));
  const [lfoSync, setLfoSync] = useState(() => initial('lfoSync', CODE_DEFAULT_DESIGN.lfoSync));
  const [lfoShape, setLfoShape] = useState(() => initial('lfoShape', CODE_DEFAULT_DESIGN.lfoShape));
  const [lfoSyncDiv, setLfoSyncDiv] = useState(() => initial('lfoSyncDiv', CODE_DEFAULT_DESIGN.lfoSyncDiv));
  const [saturationMode, setSaturationMode] = useState(() => initial('saturationMode', CODE_DEFAULT_DESIGN.saturationMode));
  const [filterPole, setFilterPole] = useState(() => normalizeFilterPole(initial('filterPole', CODE_DEFAULT_DESIGN.filterPole ?? 12)));
  const [saturationStyle, setSaturationStyle] = useState(() => normalizeSaturationStyle(initial('saturationStyle', CODE_DEFAULT_DESIGN.saturationStyle)));
  const [currentPreset, setCurrentPreset] = useState(() => initial('currentPreset', CODE_DEFAULT_DESIGN.currentPreset));
  const [frameStyle, setFrameStyle] = useState(() => normalizeFrameStyle(initial('frameStyle', CODE_DEFAULT_DESIGN.frameStyle)));
  const [panelDepthStyle, setPanelDepthStyle] = useState(() => initial('panelDepthStyle', CODE_DEFAULT_DESIGN.panelDepthStyle ?? 1));
  const [objectContactShadowStyle, setObjectContactShadowStyle] = useState(() => initial('objectContactShadowStyle', CODE_DEFAULT_DESIGN.objectContactShadowStyle ?? 1));
  const [panelLightingStyle, setPanelLightingStyle] = useState(() => initial('panelLightingStyle', CODE_DEFAULT_DESIGN.panelLightingStyle ?? 1));
  const [panelSurfaceTextureStyle, setPanelSurfaceTextureStyle] = useState(() => initial('panelSurfaceTextureStyle', CODE_DEFAULT_DESIGN.panelSurfaceTextureStyle ?? 1));
  const [modeStyle, setModeStyle] = useState(() => initial('modeStyle', CODE_DEFAULT_DESIGN.modeStyle));
  const [knobStyle, setKnobStyle] = useState(() => initial('knobStyle', CODE_DEFAULT_DESIGN.knobStyle));
  const [mixKnobStyle, setMixKnobStyle] = useState(() => initial('mixKnobStyle', CODE_DEFAULT_DESIGN.mixKnobStyle ?? 0));
  const [smallKnobRingEnabled, setSmallKnobRingEnabled] = useState(() => initial('smallKnobRingEnabled', CODE_DEFAULT_DESIGN.smallKnobRingEnabled ?? true));
  const activeKnobStyleIndex = Math.max(0, Math.min(KNOB_STYLES.length - 1, Number(knobStyle) || 0));
  const activeKnobStyle = KNOB_STYLES[activeKnobStyleIndex];
  const activeMixKnobStyleIndex = Math.max(0, Math.min(MIX_KNOB_STYLES.length - 1, Number(mixKnobStyle) || 0));
  const activeMixKnobStyle = MIX_KNOB_STYLES[activeMixKnobStyleIndex];
  const [centerDialStyle, setCenterDialStyle] = useState(() => initial('centerDialStyle', CODE_DEFAULT_DESIGN.centerDialStyle));
  const [middleKnobStyle, setMiddleKnobStyle] = useState(() => normalizeMiddleKnobStyle(initial('middleKnobStyle', CODE_DEFAULT_DESIGN.middleKnobStyle)));
  const [centerDialSurfaceStyle, setCenterDialSurfaceStyle] = useState(() => initial('centerDialSurfaceStyle', CODE_DEFAULT_DESIGN.centerDialSurfaceStyle));
  const [centerDialGrooveStyle, setCenterDialGrooveStyle] = useState(() => initial('centerDialGrooveStyle', CODE_DEFAULT_DESIGN.centerDialGrooveStyle));
  const [centerDialMarkStyle, setCenterDialMarkStyle] = useState(() => initial('centerDialMarkStyle', CODE_DEFAULT_DESIGN.centerDialMarkStyle));
  const [centerDialNumberStyle, setCenterDialNumberStyle] = useState(() => initial('centerDialNumberStyle', CODE_DEFAULT_DESIGN.centerDialNumberStyle));
  const [centerDialCirclesEnabled, setCenterDialCirclesEnabled] = useState(() => initial('centerDialCirclesEnabled', CODE_DEFAULT_DESIGN.centerDialCirclesEnabled));
  const [centerDialNumbersEnabled, setCenterDialNumbersEnabled] = useState(() => initial('centerDialNumbersEnabled', CODE_DEFAULT_DESIGN.centerDialNumbersEnabled));
  const [centerDialGuideRings, setCenterDialGuideRings] = useState(() => initial('centerDialGuideRings', CENTER_DIAL_GUIDE_RING_DEFAULTS));
  const [spreadPointerStyle, setSpreadPointerStyle] = useState(() => normalizeSpreadPointerStyle(initial('spreadPointerStyle', CODE_DEFAULT_DESIGN.spreadPointerStyle)));
  const [driftAnimation, setDriftAnimation] = useState(() => normalizeDriftAnimationStyle(initial('driftAnimation', CODE_DEFAULT_DESIGN.driftAnimation)));
  const [bgIndex, setBgIndex] = useState(() => initial('bgIndex', CODE_DEFAULT_DESIGN.bgIndex));
  const [customBackgroundColor, setCustomBackgroundColor] = useState(() => initial('customBackgroundColor', CODE_DEFAULT_DESIGN.customBackgroundColor || DEFAULT_CUSTOM_BACKGROUND_COLOR));
  const [showOutputs, setShowOutputs] = useState(() => initial('showOutputs', CODE_DEFAULT_DESIGN.showOutputs));
  const [parallelCables, setParallelCables] = useState(() => initial('parallelCables', CODE_DEFAULT_DESIGN.parallelCables));
  const [showStems, setShowStems] = useState(() => initial('showStems', CODE_DEFAULT_DESIGN.showStems));
  const [showFerns, setShowFerns] = useState(() => initial('showFerns', CODE_DEFAULT_DESIGN.showFerns));
  const [faceTextureEnabled, setFaceTextureEnabled] = useState(() => initial('faceTextureEnabled', CODE_DEFAULT_DESIGN.faceTextureEnabled));
  const [faceTextureStyle, setFaceTextureStyle] = useState(() => initial('faceTextureStyle', CODE_DEFAULT_DESIGN.faceTextureStyle));
  const [faceTextureOpacity, setFaceTextureOpacity] = useState(() => initial('faceTextureOpacity', CODE_DEFAULT_DESIGN.faceTextureOpacity));
  const [faceTextureBlendMode, setFaceTextureBlendMode] = useState(() => normalizeFaceTextureBlendMode(initial('faceTextureBlendMode', CODE_DEFAULT_DESIGN.faceTextureBlendMode || FACE_TEXTURE_BLEND_MODES[0])));
  const [faceTextureScale, setFaceTextureScale] = useState(() => initial('faceTextureScale', CODE_DEFAULT_DESIGN.faceTextureScale ?? DEFAULT_FACE_TEXTURE_SCALE));
  const [panelFaceColor, setPanelFaceColor] = useState(() => initial('panelFaceColor', CODE_DEFAULT_DESIGN.panelFaceColor));
  const [useDefaultPanelFaceColor, setUseDefaultPanelFaceColor] = useState(() => initial('useDefaultPanelFaceColor', CODE_DEFAULT_DESIGN.useDefaultPanelFaceColor));
  const [brandTextStyle, setBrandTextStyle] = useState(() => normalizeBrandTextStyle(initial('brandTextStyle', CODE_DEFAULT_DESIGN.brandTextStyle)));
  const [vintageLogoColor, setVintageLogoColor] = useState(() => initial('vintageLogoColor', CODE_DEFAULT_DESIGN.vintageLogoColor || DEFAULT_VINTAGE_LOGO_COLOR));
  const [polarisLogoColor, setPolarisLogoColor] = useState(() => initial('polarisLogoColor', CODE_DEFAULT_DESIGN.polarisLogoColor || DEFAULT_POLARIS_LOGO_COLOR));
  const [knobFlutterFilledColors, setKnobFlutterFilledColors] = useState(() => ({
    ...DEFAULT_KNOB_FLUTTER_FILLED_COLORS,
    ...(initial('knobFlutterFilledColors', CODE_DEFAULT_DESIGN.knobFlutterFilledColors || DEFAULT_KNOB_FLUTTER_FILLED_COLORS) || {})
  }));
  const [originalCopperTuning, setOriginalCopperTuning] = useState(() => normalizeOriginalCopperTuning(initial('originalCopperTuning', CODE_DEFAULT_DESIGN.originalCopperTuning || DEFAULT_ORIGINAL_COPPER_TUNING)));
  const [agedChampagneBrassTuning, setAgedChampagneBrassTuning] = useState(() => normalizeAgedChampagneBrassTuning(initial('agedChampagneBrassTuning', CODE_DEFAULT_DESIGN.agedChampagneBrassTuning || DEFAULT_AGED_CHAMPAGNE_BRASS_TUNING)));
  const [smokedChampagneBoldCleanTuning, setSmokedChampagneBoldCleanTuning] = useState(() => normalizeSmokedChampagneBoldCleanTuning(initial('smokedChampagneBoldCleanTuning', CODE_DEFAULT_DESIGN.smokedChampagneBoldCleanTuning || DEFAULT_SMOKED_CHAMPAGNE_BOLD_CLEAN_TUNING)));
  const [powerSwitchTuning, setPowerSwitchTuning] = useState(() => normalizePowerSwitchTuning(initial('powerSwitchTuning', CODE_DEFAULT_DESIGN.powerSwitchTuning || DEFAULT_POWER_SWITCH_TUNING)));
  const [screwsEnabled, setScrewsEnabled] = useState(() => initial('screwsEnabled', CODE_DEFAULT_DESIGN.screwsEnabled));
  const [screwStyle, setScrewStyle] = useState(() => initial('screwStyle', CODE_DEFAULT_DESIGN.screwStyle));
  const [lfoImageState, setLfoImageState] = useState(() => initial('lfoImageState', CODE_DEFAULT_DESIGN.lfoImageState));
  const [sakuraImageState, setSakuraImageState] = useState(() => initial('sakuraImageState', CODE_DEFAULT_DESIGN.sakuraImageState));
  const [decorativeCircles, setDecorativeCircles] = useState(() => initial('decorativeCircles', CODE_DEFAULT_DESIGN.decorativeCircles));
  const [hardwarePositions, setHardwarePositions] = useState(() => initial('hardwarePositions', CODE_DEFAULT_DESIGN.hardwarePositions));
  const [selectedHardwareSection, setSelectedHardwareSection] = useState(null);
  const [selectedCircle, setSelectedCircle] = useState(null);
  const [auraShapes, setAuraShapes] = useState(() => initial('auraShapes', createDefaultAuraShapes()));
  const [selectedAuraShape, setSelectedAuraShape] = useState(null);
  const [ioScaleStyle, setIoScaleStyle] = useState(() => initial('ioScaleStyle', CODE_DEFAULT_DESIGN.ioScaleStyle));
  const [bottomSectionStyle, setBottomSectionStyle] = useState(() => initial('bottomSectionStyle', CODE_DEFAULT_DESIGN.bottomSectionStyle));
  const [defaultSaveMessage, setDefaultSaveMessage] = useState('');
  const [designGridMode, setDesignGridMode] = useState('off');
  const sakuraImageSettings = {
    sakura: { ...SAKURA_IMAGE_PRESETS.sakura, ...sakuraImageState.sakura },
    sakura2: { ...SAKURA_IMAGE_PRESETS.sakura2, ...sakuraImageState.sakura2 },
    sakura3: { ...SAKURA_IMAGE_PRESETS.sakura3, ...sakuraImageState.sakura3 }
  };
  const decorativeCircleSettings = Object.fromEntries(
    Object.entries(DECORATIVE_CIRCLE_PRESETS).map(([id, preset]) => [id, { ...preset, ...decorativeCircles[id] }])
  );
  const selectedFaceTexture = FACE_TEXTURES[faceTextureStyle] || FACE_TEXTURES[0];
  const scaledFaceTextureBackgroundSize = (() => {
    const size = selectedFaceTexture.backgroundSize;
    const scale = (Number(faceTextureScale) || DEFAULT_FACE_TEXTURE_SCALE) / 100;
    if (!size || scale === 1) return size;
    return String(size)
      .split(',')
      .map(part => part.trim().replace(/(-?\d*\.?\d+)px/g, (_, value) => `${Number(value) * scale}px`))
      .join(', ');
  })();
  const activePanelFaceColor = useDefaultPanelFaceColor ? DEFAULT_PANEL_FACE_COLOR : panelFaceColor;
  const activePanelDepthStyle = PANEL_DEPTH_STYLES[panelDepthStyle] || PANEL_DEPTH_STYLES[0];
  const activePanelLightingStyle = PANEL_LIGHTING_STYLES[panelLightingStyle] || PANEL_LIGHTING_STYLES[0];
  const activePanelSurfaceTextureStyle = PANEL_SURFACE_TEXTURE_STYLES[panelSurfaceTextureStyle] || PANEL_SURFACE_TEXTURE_STYLES[0];
  const activeBrandTextStyle = BRAND_TEXT_STYLES[normalizeBrandTextStyle(brandTextStyle)] || BRAND_TEXT_STYLES[0];
  const lfoImageSettings = { ...LFO_IMAGE_PRESET, ...lfoImageState };
  useEffect(() => {
    const animatedDepthDisplay = activeDisplayParam === 'depth' && normalizeDepthDisplayAnimationStyle(depthDisplayStyle) >= 9;
    if (!animatedDepthDisplay) return undefined;
    let frameId;
    let lastFrame = 0;
    const tick = (now) => {
      if (now - lastFrame > 40) {
        setDisplayAnimationTime(now / 1000);
        lastFrame = now;
      }
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [activeDisplayParam, depthDisplayStyle]);
  const displaySignal = { input, output, mode, rate, waveShape: lfoShape, driftAnimation, filterPole, lfoSync, lfoSyncDiv, displayTime: displayAnimationTime, depthDisplayStyle, phaseDisplayStyle, spreadDisplayStyle, noiseDisplayStyle };
  const displayParameters = {
    input: createDisplayParameter('input', input, displaySignal),
    output: createDisplayParameter('output', output, displaySignal),
    noise: createDisplayParameter('noise', noise, displaySignal),
    sweeten: createDisplayParameter('sweeten', sweeten, displaySignal),
    sat: createDisplayParameter('sat', biasHF, displaySignal),
    filter: createDisplayParameter('filter', character, displaySignal),
    drift: createDisplayParameter('drift', drift, displaySignal),
    spread: createDisplayParameter('spread', spread, displaySignal),
    rate: createDisplayParameter('rate', rate, displaySignal),
    depth: createDisplayParameter('depth', depth, displaySignal),
    phase: createDisplayParameter('phase', stereoPhase, displaySignal),
    mix: createDisplayParameter('mix', mix, displaySignal)
  };
  const activeDisplayData = displayParameters[activeDisplayParam] || displayParameters.sat;
  const markDisplayParam = (id) => setActiveDisplayParam(id);
  const updateOriginalCopperTuning = (patch) => {
    setOriginalCopperTuning(current => normalizeOriginalCopperTuning({ ...current, ...patch }));
  };
  const resetOriginalCopperTuning = () => {
    setOriginalCopperTuning(normalizeOriginalCopperTuning(DEFAULT_ORIGINAL_COPPER_TUNING));
  };
  const resetOriginalCopperTuningColors = () => {
    setOriginalCopperTuning(current => normalizeOriginalCopperTuning({
      ...current,
      darkMetalColor: DEFAULT_ORIGINAL_COPPER_TUNING.darkMetalColor,
      lightMetalColor: DEFAULT_ORIGINAL_COPPER_TUNING.lightMetalColor
    }));
  };
  const updateAgedChampagneBrassTuning = (patch) => {
    setAgedChampagneBrassTuning(current => normalizeAgedChampagneBrassTuning({ ...current, ...patch }));
  };
  const resetAgedChampagneBrassTuning = () => {
    setAgedChampagneBrassTuning(normalizeAgedChampagneBrassTuning(DEFAULT_AGED_CHAMPAGNE_BRASS_TUNING));
  };
  const resetAgedChampagneBrassTuningColors = () => {
    setAgedChampagneBrassTuning(current => normalizeAgedChampagneBrassTuning({
      ...current,
      darkMetalColor: DEFAULT_AGED_CHAMPAGNE_BRASS_TUNING.darkMetalColor,
      midMetalColor: DEFAULT_AGED_CHAMPAGNE_BRASS_TUNING.midMetalColor,
      lightMetalColor: DEFAULT_AGED_CHAMPAGNE_BRASS_TUNING.lightMetalColor
    }));
  };
  const updateSmokedChampagneBoldCleanTuning = (patch) => {
    setSmokedChampagneBoldCleanTuning(current => normalizeSmokedChampagneBoldCleanTuning({ ...current, ...patch }));
  };
  const resetSmokedChampagneBoldCleanTuning = () => {
    setSmokedChampagneBoldCleanTuning(normalizeSmokedChampagneBoldCleanTuning(DEFAULT_SMOKED_CHAMPAGNE_BOLD_CLEAN_TUNING));
  };
  const resetSmokedChampagneBoldCleanTuningColors = () => {
    setSmokedChampagneBoldCleanTuning(current => normalizeSmokedChampagneBoldCleanTuning({
      ...current,
      darkMetalColor: DEFAULT_SMOKED_CHAMPAGNE_BOLD_CLEAN_TUNING.darkMetalColor,
      midMetalColor: DEFAULT_SMOKED_CHAMPAGNE_BOLD_CLEAN_TUNING.midMetalColor,
      lightMetalColor: DEFAULT_SMOKED_CHAMPAGNE_BOLD_CLEAN_TUNING.lightMetalColor
    }));
  };
  const updatePowerSwitchTuning = (patch) => {
    setPowerSwitchTuning(current => normalizePowerSwitchTuning({ ...current, ...patch }));
  };
  const resetPowerSwitchTuning = () => {
    setPowerSwitchTuning(normalizePowerSwitchTuning(DEFAULT_POWER_SWITCH_TUNING));
  };
  const resetPowerSwitchTuningColors = () => {
    setPowerSwitchTuning(current => normalizePowerSwitchTuning({
      ...current,
      insertTopColor: DEFAULT_POWER_SWITCH_TUNING.insertTopColor,
      insertBottomColor: DEFAULT_POWER_SWITCH_TUNING.insertBottomColor
    }));
  };

  const updateGlobalMasteringRoot = (patch) => {
    setGlobalMastering(current => normalizeGlobalMastering({ ...current, ...patch }));
  };
  const updateGlobalMasteringSection = (section, patch) => {
    setGlobalMastering(current => {
      const normalized = normalizeGlobalMastering(current);
      return normalizeGlobalMastering({
        ...normalized,
        [section]: {
          ...normalized[section],
          ...patch
        }
      });
    });
  };
  const applyGlobalMasteringPreset = (presetId) => {
    setGlobalMastering(normalizeGlobalMastering(GLOBAL_MASTERING_PRESETS[presetId] || DEFAULT_GLOBAL_MASTERING));
  };
  const resetGlobalMastering = () => {
    setGlobalMastering(normalizeGlobalMastering(DEFAULT_GLOBAL_MASTERING));
  };
  const updateDepthModel = (patch) => {
    setDepthModel(current => normalizeDepthModel({ ...current, ...patch }));
  };
  const updateCenterDepthModel = (patch) => {
    setCenterDepthModel(current => normalizeCenterDepthModel({ ...current, ...patch }));
  };
  const applyDepthModelPreset = (presetIndex) => {
    const preset = DEPTH_MODEL_PRESETS[presetIndex] || DEPTH_MODEL_PRESETS[0];
    setDepthModel(current => normalizeDepthModel({
      ...current,
      ...preset.patch,
      preset: presetIndex
    }));
  };

  const updateSakuraImage = (id, patch) => {
    setSakuraImageState(current => ({
      ...SAKURA_IMAGE_PRESETS,
      ...current,
      [id]: { ...SAKURA_IMAGE_PRESETS[id], ...current[id], ...patch }
    }));
  };
  const updateLfoImage = (patch) => {
    setLfoImageState(current => ({ ...LFO_IMAGE_PRESET, ...current, ...patch }));
  };
  const updateCenterDialGuideRing = (ringKey, patch) => {
    setCenterDialGuideRings(current => ({
      ...CENTER_DIAL_GUIDE_RING_DEFAULTS,
      ...current,
      [ringKey]: {
        ...CENTER_DIAL_GUIDE_RING_DEFAULTS[ringKey],
        ...(current?.[ringKey] || {}),
        ...patch
      }
    }));
  };
  const updateDecorativeCircle = (id, patch) => {
    setDecorativeCircles(current => ({
      ...DECORATIVE_CIRCLE_PRESETS,
      ...current,
      [id]: { ...DECORATIVE_CIRCLE_PRESETS[id], ...current[id], ...patch }
    }));
  };

  const updateHardwarePosition = (id, patch) => {
    setHardwarePositions(current => ({
      ...current,
      [id]: { ...current[id], ...patch }
    }));
  };
  const updateAllDecorativeCircles = (patch) => {
    setDecorativeCircles(current => {
      const merged = { ...DECORATIVE_CIRCLE_PRESETS, ...current };
      return Object.fromEntries(Object.entries(merged).map(([id, circle]) => [id, { ...circle, ...patch }]));
    });
  };

  const clampControlValue = (value) => Math.max(0, Math.min(100, value));
  const handleInputChange = (nextInput) => {
    markDisplayParam('input');
    const previousInput = inputValueRef.current;
    const inputDelta = nextInput - previousInput;
    inputValueRef.current = nextInput;
    setInput(nextInput);
    if (ioLinked && ioLinkStyle !== 'none') {
      setOutput(currentOutput => {
        const nextOutput = clampControlValue(currentOutput - inputDelta);
        outputValueRef.current = nextOutput;
        return nextOutput;
      });
    }
  };
  const handleOutputChange = (nextOutput) => {
    markDisplayParam('output');
    outputValueRef.current = nextOutput;
    setOutput(nextOutput);
  };
  const handleInputReset = () => {
    markDisplayParam('input');
    const previousInput = inputValueRef.current;
    const inputDelta = 50 - previousInput;
    inputValueRef.current = 50;
    setInput(50);
    if (ioLinked && ioLinkStyle !== 'none') {
      setOutput(currentOutput => {
        const nextOutput = clampControlValue(currentOutput - inputDelta);
        outputValueRef.current = nextOutput;
        return nextOutput;
      });
    }
  };
  const handleOutputReset = () => {
    markDisplayParam('output');
    outputValueRef.current = 50;
    setOutput(50);
  };
  const handleDriftChange = (nextValue) => { markDisplayParam('drift'); setDrift(nextValue); };
  const handleSpreadChange = (nextValue) => { markDisplayParam('spread'); setSpread(nextValue); };
  const handleNoiseChange = (nextValue) => { markDisplayParam('noise'); setNoise(nextValue); };
  const handleSweetenChange = (nextValue) => { markDisplayParam('sweeten'); setSweeten(nextValue); };
  const handleSatChange = (nextValue) => { markDisplayParam('sat'); setBiasHF(nextValue); };
  const handleFilterChange = (nextValue) => { markDisplayParam('filter'); setCharacter(nextValue); };
  const handleRateChange = (nextValue) => { markDisplayParam('rate'); setRate(nextValue); };
  const handleDepthChange = (nextValue) => { markDisplayParam('depth'); setDepth(nextValue); };
  const handlePhaseChange = (nextValue) => { markDisplayParam('phase'); setStereoPhase(nextValue); };
  const handleLfoShapeChange = (nextValue) => { markDisplayParam('rate'); setLfoShape(nextValue); };
  const handleLfoSyncChange = (nextValue) => { markDisplayParam('rate'); setLfoSync(nextValue); };
  const handleLfoSyncDivChange = (nextValue) => { markDisplayParam('rate'); setLfoSyncDiv(nextValue); };
  const handleMixChange = (nextValue) => { markDisplayParam('mix'); setMix(nextValue); };
  const handleIOLinkStyleChange = (nextStyle) => {
    setIoLinkStyle(nextStyle);
    if (nextStyle === 'none') setIoLinked(false);
  };
  const updateTopBarCustomStyle = (index, patch) => {
    setTopBarCustomStyles(styles => {
      const next = normalizeTopBarCustomStyles(styles);
      next[index] = {
        ...next[index],
        ...patch,
        outlineWidth: 'outlineWidth' in patch
          ? Math.max(0, Math.min(4, Number(patch.outlineWidth) || 0))
          : next[index].outlineWidth
      };
      return next;
    });
  };
  const resetTopBarCustomStyle = (index) => {
    setTopBarCustomStyles(styles => {
      const next = normalizeTopBarCustomStyles(styles);
      next[index] = { ...DEFAULT_TOP_BAR_CUSTOM_STYLES[index] };
      return next;
    });
  };

  const addAuraShape = () => {
    const newShape = {
      id: `aura-${Date.now()}`,
      enabled: true,
      locked: false,
      x: 425,
      y: 425,
      size: 350,
      rotate: Math.random() * 360,
      opacity: 0.45,
      blur: 60,
      color1: ['#e66a53', '#edd39a', '#b04a4a', '#a63c3c', '#d4af37'][Math.floor(Math.random() * 5)],
      color2: ['#edd39a', '#e66a53', '#d4af37', '#b04a4a', '#7aa678'][Math.floor(Math.random() * 5)],
      gradientAngle: Math.floor(Math.random() * 360),
      isAnimated: true,
      blobRadius: generateRandomBlob(),
      outlineEnabled: false,
      outlineColor: '#e66a53',
      outlineWidth: 0,
      outlineOpacity: 1,
      outlineBlur: 0
    };
    setAuraShapes(prev => [...prev, newShape]);
    setSelectedAuraShape(newShape.id);
  };

  const morphAllAuraShapes = () => {
    setAuraShapes(prev => prev.map(s => ({
      ...s,
      blobRadius: generateRandomBlob(),
      gradientAngle: Math.floor(Math.random() * 360),
      rotate: Math.random() * 360
    })));
  };

  const updateAuraShape = (id, patch) => {
    setAuraShapes(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
  };

  const moveAuraShape = (id, direction) => {
    setAuraShapes(prev => {
      const index = prev.findIndex(shape => shape.id === id);
      if (index < 0) return prev;
      const next = [...prev];
      const [shape] = next.splice(index, 1);
      let targetIndex = index;
      if (direction === 'back') targetIndex = 0;
      if (direction === 'down') targetIndex = Math.max(0, index - 1);
      if (direction === 'up') targetIndex = Math.min(next.length, index + 1);
      if (direction === 'front') targetIndex = next.length;
      next.splice(targetIndex, 0, shape);
      return next;
    });
    setSelectedAuraShape(id);
  };

  const duplicateAuraShape = (id) => {
    const shape = auraShapes.find(s => s.id === id);
    if (!shape) return;
    const duplicate = {
      ...shape,
      id: `aura-${Date.now()}`,
      locked: false
    };
    setAuraShapes(prev => {
      const index = prev.findIndex(s => s.id === id);
      const next = [...prev];
      next.splice(index + 1, 0, duplicate);
      return next;
    });
    setSelectedAuraShape(duplicate.id);
  };

  const removeAuraShape = (id) => {
    setAuraShapes(prev => prev.filter(s => s.id !== id));
    if (selectedAuraShape === id) setSelectedAuraShape(null);
  };

  const buildCurrentSettings = () => ({
      power,
      input,
      output,
      ioLinkStyle,
      ioLinked,
      outerRingScaleStyle,
      showWabiSabi,
      drift,
      spread,
      character,
      sweeten,
      biasHF,
      noise,
      mix,
      rate,
      depth,
      stereoPhase,
      depthDisplayStyle,
      phaseDisplayStyle,
      spreadDisplayStyle,
      noiseDisplayStyle,
      mode,
      lfoEnabled,
      lfoSync,
      lfoShape,
      lfoSyncDiv,
      currentPreset,
      frameStyle,
      panelDepthStyle,
      objectContactShadowStyle,
      panelLightingStyle,
      panelSurfaceTextureStyle,
      modeStyle,
      knobStyle,
      mixKnobStyle,
      smallKnobRingEnabled,
      centerDialStyle,
      middleKnobStyle,
      centerDialSurfaceStyle,
      centerDialGrooveStyle,
      centerDialMarkStyle,
      centerDialNumberStyle,
      centerDialCirclesEnabled,
      centerDialNumbersEnabled,
      centerDialGuideRings,
      spreadPointerStyle,
      driftAnimation,
      bgIndex,
      customBackgroundColor,
      showOutputs,
      parallelCables,
      showStems,
      showFerns,
      faceTextureEnabled,
      faceTextureStyle,
      faceTextureOpacity,
      faceTextureBlendMode,
      faceTextureScale,
      panelFaceColor,
      useDefaultPanelFaceColor,
      brandTextStyle,
      vintageLogoColor,
      polarisLogoColor,
      knobFlutterFilledColors,
      originalCopperTuning,
      agedChampagneBrassTuning,
      smokedChampagneBoldCleanTuning,
      powerSwitchTuning,
      screwsEnabled,
      screwStyle,
      lfoImageState,
      sakuraImageState,
      decorativeCircles,
      hardwarePositions,
      auraShapes,
      ioScaleStyle,
      bottomSectionStyle,
      readoutStyleIndex,
      topBarStyle,
      topBarCustomStyles,
      globalMastering,
      depthModel,
      centerDepthModel,
      hqMode,
      cableToneEnabled,
      filterPole,
      saturationMode,
      saturationStyle
  });

  const applyPresetSettings = (settings = {}) => {
    if ('power' in settings) setPower(settings.power);
    if ('input' in settings) { setInput(settings.input); inputValueRef.current = settings.input; }
    if ('output' in settings) { setOutput(settings.output); outputValueRef.current = settings.output; }
    if ('ioLinkStyle' in settings) setIoLinkStyle(settings.ioLinkStyle);
    if ('ioLinked' in settings) setIoLinked(settings.ioLinked);
    if ('outerRingScaleStyle' in settings) setOuterRingScaleStyle(settings.outerRingScaleStyle);
    if ('showWabiSabi' in settings) setShowWabiSabi(settings.showWabiSabi);
    if ('drift' in settings) setDrift(settings.drift);
    if ('spread' in settings) setSpread(settings.spread);
    if ('character' in settings) setCharacter(settings.character);
    if ('sweeten' in settings) setSweeten(settings.sweeten);
    if ('biasHF' in settings) setBiasHF(settings.biasHF);
    if ('noise' in settings) setNoise(settings.noise);
    if ('mix' in settings) setMix(settings.mix);
    if ('rate' in settings) setRate(settings.rate);
    if ('depth' in settings) setDepth(settings.depth);
    if ('stereoPhase' in settings) setStereoPhase(settings.stereoPhase);
    if ('depthDisplayStyle' in settings) setDepthDisplayStyle(normalizeDepthDisplayAnimationStyle(settings.depthDisplayStyle));
    if ('phaseDisplayStyle' in settings) setPhaseDisplayStyle(normalizePhaseDisplayAnimationStyle(settings.phaseDisplayStyle));
    if ('spreadDisplayStyle' in settings) setSpreadDisplayStyle(normalizeSpreadDisplayAnimationStyle(settings.spreadDisplayStyle));
    if ('noiseDisplayStyle' in settings) setNoiseDisplayStyle(normalizeNoiseDisplayAnimationStyle(settings.noiseDisplayStyle));
    if ('mode' in settings) setMode(settings.mode);
    if ('lfoEnabled' in settings) setLfoEnabled(settings.lfoEnabled);
    if ('lfoSync' in settings) setLfoSync(settings.lfoSync);
    if ('lfoShape' in settings) setLfoShape(settings.lfoShape);
    if ('lfoSyncDiv' in settings) setLfoSyncDiv(settings.lfoSyncDiv);
    if ('currentPreset' in settings) setCurrentPreset(settings.currentPreset);
    if ('frameStyle' in settings) setFrameStyle(normalizeFrameStyle(settings.frameStyle));
    if ('panelDepthStyle' in settings) setPanelDepthStyle(settings.panelDepthStyle);
    if ('objectContactShadowStyle' in settings) setObjectContactShadowStyle(settings.objectContactShadowStyle);
    if ('panelLightingStyle' in settings) setPanelLightingStyle(settings.panelLightingStyle);
    if ('panelSurfaceTextureStyle' in settings) setPanelSurfaceTextureStyle(settings.panelSurfaceTextureStyle);
    if ('modeStyle' in settings) setModeStyle(settings.modeStyle);
    if ('knobStyle' in settings) setKnobStyle(settings.knobStyle);
    if ('mixKnobStyle' in settings) setMixKnobStyle(settings.mixKnobStyle);
    if ('smallKnobRingEnabled' in settings) setSmallKnobRingEnabled(settings.smallKnobRingEnabled);
    if ('centerDialStyle' in settings) setCenterDialStyle(settings.centerDialStyle);
    if ('middleKnobStyle' in settings) setMiddleKnobStyle(normalizeMiddleKnobStyle(settings.middleKnobStyle));
    if ('centerDialSurfaceStyle' in settings) setCenterDialSurfaceStyle(settings.centerDialSurfaceStyle);
    if ('centerDialGrooveStyle' in settings) setCenterDialGrooveStyle(settings.centerDialGrooveStyle);
    if ('centerDialMarkStyle' in settings) setCenterDialMarkStyle(settings.centerDialMarkStyle);
    if ('centerDialNumberStyle' in settings) setCenterDialNumberStyle(settings.centerDialNumberStyle);
    if ('centerDialCirclesEnabled' in settings) setCenterDialCirclesEnabled(settings.centerDialCirclesEnabled);
    if ('centerDialNumbersEnabled' in settings) setCenterDialNumbersEnabled(settings.centerDialNumbersEnabled);
    if ('centerDialGuideRings' in settings) setCenterDialGuideRings(settings.centerDialGuideRings);
    if ('spreadPointerStyle' in settings) setSpreadPointerStyle(normalizeSpreadPointerStyle(settings.spreadPointerStyle));
    if ('driftAnimation' in settings) setDriftAnimation(normalizeDriftAnimationStyle(settings.driftAnimation));
    if ('bgIndex' in settings) setBgIndex(settings.bgIndex);
    if ('customBackgroundColor' in settings) setCustomBackgroundColor(settings.customBackgroundColor);
    if ('showOutputs' in settings) setShowOutputs(settings.showOutputs);
    if ('parallelCables' in settings) setParallelCables(settings.parallelCables);
    if ('showStems' in settings) setShowStems(settings.showStems);
    if ('showFerns' in settings) setShowFerns(settings.showFerns);
    if ('faceTextureEnabled' in settings) setFaceTextureEnabled(settings.faceTextureEnabled);
    if ('faceTextureStyle' in settings) setFaceTextureStyle(settings.faceTextureStyle);
    if ('faceTextureOpacity' in settings) setFaceTextureOpacity(settings.faceTextureOpacity);
    if ('faceTextureBlendMode' in settings) setFaceTextureBlendMode(normalizeFaceTextureBlendMode(settings.faceTextureBlendMode));
    if ('faceTextureScale' in settings) setFaceTextureScale(settings.faceTextureScale);
    if ('panelFaceColor' in settings) setPanelFaceColor(settings.panelFaceColor);
    if ('useDefaultPanelFaceColor' in settings) setUseDefaultPanelFaceColor(settings.useDefaultPanelFaceColor);
    if ('brandTextStyle' in settings) setBrandTextStyle(normalizeBrandTextStyle(settings.brandTextStyle));
    if ('vintageLogoColor' in settings) setVintageLogoColor(settings.vintageLogoColor);
    if ('polarisLogoColor' in settings) setPolarisLogoColor(settings.polarisLogoColor);
    if ('knobFlutterFilledColors' in settings) setKnobFlutterFilledColors(settings.knobFlutterFilledColors);
    if ('originalCopperTuning' in settings) setOriginalCopperTuning(normalizeOriginalCopperTuning(settings.originalCopperTuning));
    if ('agedChampagneBrassTuning' in settings) setAgedChampagneBrassTuning(normalizeAgedChampagneBrassTuning(settings.agedChampagneBrassTuning));
    if ('smokedChampagneBoldCleanTuning' in settings) setSmokedChampagneBoldCleanTuning(normalizeSmokedChampagneBoldCleanTuning(settings.smokedChampagneBoldCleanTuning));
    if ('powerSwitchTuning' in settings) setPowerSwitchTuning(normalizePowerSwitchTuning(settings.powerSwitchTuning));
    if ('screwsEnabled' in settings) setScrewsEnabled(settings.screwsEnabled);
    if ('screwStyle' in settings) setScrewStyle(settings.screwStyle);
    if ('lfoImageState' in settings) setLfoImageState(settings.lfoImageState);
    if ('sakuraImageState' in settings) setSakuraImageState(settings.sakuraImageState);
    if ('decorativeCircles' in settings) setDecorativeCircles(settings.decorativeCircles);
    if ('hardwarePositions' in settings) setHardwarePositions(settings.hardwarePositions);
    if ('auraShapes' in settings) setAuraShapes(settings.auraShapes);
    if ('ioScaleStyle' in settings) setIoScaleStyle(settings.ioScaleStyle);
    if ('bottomSectionStyle' in settings) setBottomSectionStyle(settings.bottomSectionStyle);
    if ('readoutStyleIndex' in settings) setReadoutStyleIndex(settings.readoutStyleIndex);
    if ('topBarStyle' in settings) setTopBarStyle(normalizeTopBarStyle(settings.topBarStyle));
    if ('topBarCustomStyles' in settings) setTopBarCustomStyles(normalizeTopBarCustomStyles(settings.topBarCustomStyles));
    if ('globalMastering' in settings) setGlobalMastering(normalizeGlobalMastering(settings.globalMastering));
    if ('depthModel' in settings) setDepthModel(normalizeDepthModel(settings.depthModel));
    if ('centerDepthModel' in settings) setCenterDepthModel(normalizeCenterDepthModel(settings.centerDepthModel));
    if ('hqMode' in settings) setHqMode(settings.hqMode);
    if ('cableToneEnabled' in settings) setCableToneEnabled(settings.cableToneEnabled);
    if ('filterPole' in settings) setFilterPole(normalizeFilterPole(settings.filterPole));
    if ('saturationMode' in settings) setSaturationMode(settings.saturationMode);
    if ('saturationStyle' in settings) setSaturationStyle(normalizeSaturationStyle(settings.saturationStyle));
  };

  const handleSaveCurrentAsDefault = () => {
    const saved = saveDesignDefaults(buildCurrentSettings());
    setDefaultSaveMessage(saved ? 'Saved as default' : 'Could not save');
    window.setTimeout(() => setDefaultSaveMessage(''), 2200);
  };

  const handleSaveUserPreset = (name) => {
    const preset = {
      id: `user-${Date.now()}`,
      name,
      settings: pickUserPresetSettings(buildCurrentSettings())
    };
    setUserPresets(current => {
      const next = [...current, preset];
      saveUserPresets(next);
      return next;
    });
    setCurrentUserPresetId(preset.id);
    setCurrentPreset(-1);
  };

  const handleLoadUserPreset = (id) => {
    const preset = userPresets.find(item => item.id === id);
    if (!preset) return;
    applyPresetSettings(pickUserPresetSettings(preset.settings));
    setCurrentUserPresetId(id);
  };

  const handleLoadFactoryPreset = (index) => {
    setCurrentPreset(index);
    setCurrentUserPresetId(null);
  };

  const presetNavItems = [
    { type: 'factory', id: -1, name: '— Init —' },
    ...DEMO_PRESETS.map((name, index) => ({ type: 'factory', id: index, name })),
    ...userPresets.map(preset => ({ type: 'user', id: preset.id, name: preset.name }))
  ];
  const activePresetName = currentUserPresetId
    ? (userPresets.find(item => item.id === currentUserPresetId)?.name || 'User Preset')
    : (currentPreset >= 0 ? DEMO_PRESETS[currentPreset] : '— Init —');
  const activePresetIndex = Math.max(0, presetNavItems.findIndex(item => (
    currentUserPresetId ? item.type === 'user' && item.id === currentUserPresetId : item.type === 'factory' && item.id === currentPreset
  )));
  const loadPresetNavItem = (item) => {
    if (item.type === 'user') handleLoadUserPreset(item.id);
    else handleLoadFactoryPreset(item.id);
  };
  const handlePrevPreset = () => {
    const next = presetNavItems[(activePresetIndex - 1 + presetNavItems.length) % presetNavItems.length];
    loadPresetNavItem(next);
  };
  const handleNextPreset = () => {
    const next = presetNavItems[(activePresetIndex + 1) % presetNavItems.length];
    loadPresetNavItem(next);
  };


  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const activeBackgroundColor = bgIndex === CUSTOM_BACKGROUND_INDEX ? customBackgroundColor : (BACKGROUNDS[bgIndex]?.color || BACKGROUNDS[0].color);
  const normalizedGlobalMastering = normalizeGlobalMastering(globalMastering);
  const curvesFilterStyle = normalizedGlobalMastering.enabled && normalizedGlobalMastering.curves.enabled
    ? { filter: `url(#${CURVES_FILTER_ID})` }
    : undefined;
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) setScale(entries[0].contentRect.width / 850);
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 font-sans overflow-hidden gap-16 lg:gap-32 xl:gap-40 flex-col lg:flex-row" style={{ backgroundColor: activeBackgroundColor, transition: 'background-color 0.5s ease' }}>
      
      {/* Plugin Area */}
      <div ref={containerRef} className="relative w-full max-w-[680px] aspect-square flex items-center justify-center flex-shrink-0">
        <GlobalCurvesFilterDefs settings={globalMastering} />
        <div className="absolute inset-0" style={curvesFilterStyle}>
        <div ref={pluginStageRef} className="absolute" style={{ width: 850, height: 850, transform: `scale(${scale})`, transformOrigin: 'center center' }}>
          
          {/* Frame Wrapper */}
          <div 
            className={`absolute ${FRAMES[frameStyle]?.inset || '-inset-6'} transition-all duration-500 pointer-events-none`} 
            style={{
              borderRadius: FRAMES[frameStyle]?.radius || '4.5rem',
              zIndex: -1,
              transform: `scale(${OUTER_PLUGIN_SCALE})`,
              transformOrigin: 'center center',
              ...FRAMES[frameStyle]?.style,
              filter: power ? FRAMES[frameStyle]?.style?.filter : 'grayscale(1) saturate(0.18) brightness(0.72)'
            }}
          >
            {FRAMES[frameStyle]?.innerStyle && (
              <div 
                className={`absolute ${FRAMES[frameStyle].innerStyle.inset || 'inset-2'} transition-all duration-500`} 
                style={{ borderRadius: FRAMES[frameStyle].innerStyle.radius || '4rem', ...FRAMES[frameStyle].innerStyle }} 
              />
            )}
            {FRAMES[frameStyle]?.overlayStyle && (
              <div 
                className="absolute inset-0 opacity-50 mix-blend-overlay pointer-events-none transition-all duration-500" 
                style={{ borderRadius: 'inherit', ...FRAMES[frameStyle].overlayStyle }} 
              />
            )}
          </div>

          <div className="absolute inset-0 pointer-events-none" style={{ transform: `scale(${OUTER_PLUGIN_SCALE})`, transformOrigin: 'center center', zIndex: -2 }}>
            <AnalogCables position="left" parallel={parallelCables} />
            {showOutputs && <AnalogCables position="right" parallel={parallelCables} />}
          </div>

          {!websiteMode && (
            <TopPresetBar
              factoryPresets={DEMO_PRESETS}
              userPresets={userPresets}
              activePresetName={activePresetName}
              topBarStyle={normalizeTopBarStyle(topBarStyle)}
              topBarCustomStyles={topBarCustomStyles}
              hqMode={hqMode}
              cableToneEnabled={cableToneEnabled}
              onPrev={handlePrevPreset}
              onNext={handleNextPreset}
              onLoadFactory={handleLoadFactoryPreset}
              onLoadUser={handleLoadUserPreset}
              onSave={handleSaveUserPreset}
              onToggleHq={() => setHqMode(current => !current)}
              onToggleCable={() => setCableToneEnabled(current => !current)}
            />
          )}

          {/* Panel Shadow and Border Wrapper */}
          <div
            className={`absolute ${FRAMES[frameStyle]?.panelInset || 'inset-0'} transition-all duration-500`}
            style={{ 
              zIndex: 8, 
              transform: `scale(${OUTER_PLUGIN_SCALE}) translateZ(0)`, 
              transformOrigin: 'center center', 
              borderRadius: FRAMES[frameStyle]?.panelRadius || '4rem',
              boxShadow: '0 40px 80px rgba(0,0,0,0.4), 0 20px 30px rgba(0,0,0,0.2)',
              ...FRAMES[frameStyle]?.panelStyle 
            }}
          >
            {/* Masked Panel Faceplate Content */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{
                borderRadius: 'inherit',
                backgroundColor: activePanelFaceColor,
                WebkitMaskImage: '-webkit-radial-gradient(white, white)',
                maskImage: 'radial-gradient(white, white)',
                isolation: 'isolate'
              }}
            >
            <div
              className="absolute inset-0 pointer-events-none z-[5] transition-all duration-300"
              style={{
                opacity: faceTextureEnabled ? faceTextureOpacity / 100 : 0,
                backgroundImage: selectedFaceTexture.backgroundImage,
                backgroundSize: scaledFaceTextureBackgroundSize,
                backgroundRepeat: selectedFaceTexture.backgroundRepeat || 'repeat',
                backgroundPosition: selectedFaceTexture.backgroundPosition || '0 0',
                backgroundBlendMode: selectedFaceTexture.backgroundBlendMode || 'normal',
                mixBlendMode: faceTextureBlendMode || selectedFaceTexture.mixBlendMode,
                maskImage: CENTER_DIAL_GRAIN_EXCLUSION_MASK,
                WebkitMaskImage: CENTER_DIAL_GRAIN_EXCLUSION_MASK
              }}
            />

            {FRAMES[frameStyle]?.panelEdgeStyle && (
              <div
                className="absolute inset-0 rounded-[4rem] pointer-events-none z-[6] transition-all duration-500"
                style={{
                  ...FRAMES[frameStyle].panelEdgeStyle,
                  mixBlendMode: 'multiply'
                }}
              />
            )}

            {activePanelDepthStyle.style && (
              <div
                className="absolute inset-0 rounded-[4rem] pointer-events-none z-[7] transition-all duration-500"
                style={activePanelDepthStyle.style}
              />
            )}

            {activePanelLightingStyle.style && (
              <div
                className="absolute inset-0 rounded-[4rem] pointer-events-none z-[8] transition-all duration-500"
                style={activePanelLightingStyle.style}
              />
            )}

            {activePanelSurfaceTextureStyle.style && (
              <div
                className="absolute inset-0 rounded-[4rem] pointer-events-none z-[9] transition-all duration-500"
                style={activePanelSurfaceTextureStyle.style}
              />
            )}

            <CornerScrews enabled={screwsEnabled} styleIndex={screwStyle} />

            <div
              className="absolute inset-0 rounded-[4rem] transition-all duration-500"
              style={{ transform: `scale(${1 / OUTER_PLUGIN_SCALE})`, transformOrigin: 'center center' }}
            >

            <EditableDecorativeCircles
              circles={decorativeCircleSettings}
              selectedId={selectedCircle}
              setSelectedId={setSelectedCircle}
              onUpdate={updateDecorativeCircle}
              stageRef={pluginStageRef}
            />

            <EditableAuraShapes
              shapes={auraShapes}
              selectedId={selectedAuraShape}
              setSelectedId={setSelectedAuraShape}
              onUpdate={updateAuraShape}
              stageRef={pluginStageRef}
            />
            <DetailedFernsRight showFerns={showFerns} />
            <SakuraImageLayer src={sakuraSrc} settings={sakuraImageSettings.sakura} alt="Sakura decorative layer" matteBacking />
            <SakuraImageLayer src={sakura2Src} settings={sakuraImageSettings.sakura2} alt="Sakura 2 decorative layer" matteBacking />
            <SakuraImageLayer src={sakura2Src} settings={sakuraImageSettings.sakura3} alt="Sakura 3 decorative layer" matteBacking />
            <EditableImageAsset
              src={lfoSrc}
              settings={lfoImageSettings}
              selected={selectedHardwareSection === 'lfoImage'}
              onSelect={() => setSelectedHardwareSection('lfoImage')}
              onUpdate={updateLfoImage}
              stageRef={pluginStageRef}
              alt="LFO image layer"
            />

            {!depthModel.enabled && <ObjectContactShadowLayer styleIndex={objectContactShadowStyle} hardwarePositions={hardwarePositions} shadowAngle={depthModel.shadowAngle} />}
            <DepthModelShadowLayer settings={depthModel} hardwarePositions={hardwarePositions} />

            <div className="absolute top-[6%] left-[calc(10.2%-2px)] z-10 flex flex-col items-start">
              <h1
                className="text-[35px] leading-none font-normal tracking-[0.021em] flex gap-3 origin-left scale-x-[0.985]"
                style={{
                  color: vintageLogoColor,
                  fontFamily: "'DrifterLogo', 'Figtree', sans-serif"
                }}
              >
                <span>VINTAGE</span>
                <span>
                  DRIF<span className="ml-[-2.5px]">TER</span>
                </span>
              </h1>
              <p
                className="text-[11px] tracking-[0.2em] font-black mt-1 translate-y-[-1px]"
                style={{
                  color: 'rgba(52, 48, 41, 0.58)'
                }}
              >
                MOTION / TONE / INSTABILITY
              </p>
            </div>

            <div className="absolute top-[calc(6%-2px)] right-[10%] z-10 flex flex-col items-center">
              <div
                className="mb-4 text-[13px] font-black tracking-[0.16em]"
                style={{
                  color: polarisLogoColor || activeBrandTextStyle.polarisColor,
                  fontFamily: "'Figtree', sans-serif",
                  fontWeight: 900,
                  WebkitTextStroke: '0.2px currentColor'
                }}
              >
                SATURA AUDIO
              </div>
              <div className="relative top-[5px] z-[100] flex flex-col items-center">
                <button
                  onClick={() => setPower(!power)}
                  className="relative z-10 w-8 h-14 bg-[#111] border border-white/10 flex justify-center items-center transition-shadow duration-200"
                  style={{
                    borderRadius: `${powerSwitchTuning.bodyRadius}px`,
                    boxShadow: `${power ? '5px 5px 5px -4px rgba(20,14,10,0.38), 19px 7px 14px -8px rgba(24,18,14,0.2)' : '5px 8px 5px -4px rgba(20,14,10,0.38), 19px 11px 15px -8px rgba(24,18,14,0.2)'}, 2px 4px 7.7px rgba(25,19,15,0.252), 0 1px 2px rgba(25,19,15,0.2), inset 0 2px 5px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.08)`
                  }}
                >
                  <div
                    className="w-3 h-8 rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.46),inset_0_1px_2px_rgba(255,255,255,0.9)] transition-transform duration-200"
                    style={{
                      background: `linear-gradient(to bottom, ${powerSwitchTuning.insertTopColor}, ${powerSwitchTuning.insertBottomColor})`,
                      transform: power ? 'translateY(-8px)' : 'translateY(8px)'
                    }}
                  />
                </button>
                <div className="mt-[10px] text-[11px] font-black tracking-[0.2em]" style={{ color: activeBrandTextStyle.powerColor }}>POWER</div>
              </div>
            </div>

            <EditableHardwareWrapper 
              id="io" 
              x={hardwarePositions.io.x} 
              y={hardwarePositions.io.y} 
              locked={hardwarePositions.io.locked}
              selected={selectedHardwareSection === 'io'}
              onSelect={setSelectedHardwareSection}
              onUpdate={updateHardwarePosition}
              stageRef={pluginStageRef}
            >
              <div className="flex items-start gap-[18px]">
                <div className="relative">
                  <KnobScaleRing styleIndex={ioScaleStyle} size={55} />
                  <MatteKnob label="Input" value={input} onChange={handleInputChange} onDoubleClick={handleInputReset} size={55} shadingStyle={activeKnobStyle} outerRingEnabled={smallKnobRingEnabled} onDraggingChange={(dragging) => { setIsInputDragging(dragging); if (dragging) markDisplayParam('input'); }} onDisplayFocus={() => markDisplayParam('input')} forceSnappy={isIoDragging} readoutOffsetY={-2} labelTextShadow="none" labelSizeClass="text-[11px]" labelTrackingClass="tracking-[0.16em]" readoutStyleIndex={readoutStyleIndex} />
                </div>
                <div className="mt-[13px] flex flex-col items-center">
                  <IOLinkButton
                    styleKey={ioLinkStyle}
                    active={ioLinked && ioLinkStyle !== 'none'}
                    onToggle={() => {
                      if (ioLinkStyle === 'none') return;
                      setIoLinked(!ioLinked);
                    }}
                  />
                </div>
                <div className="relative">
                  <KnobScaleRing styleIndex={ioScaleStyle} size={55} />
                  <MatteKnob label="Output" value={output} onChange={handleOutputChange} onDoubleClick={handleOutputReset} size={55} shadingStyle={activeKnobStyle} outerRingEnabled={smallKnobRingEnabled} onDraggingChange={(dragging) => { setIsOutputDragging(dragging); if (dragging) markDisplayParam('output'); }} onDisplayFocus={() => markDisplayParam('output')} forceSnappy={isIoDragging} readoutOffsetY={-2} labelTextShadow="none" labelSizeClass="text-[11px]" labelTrackingClass="tracking-[0.16em]" readoutStyleIndex={readoutStyleIndex} />
                </div>
              </div>
            </EditableHardwareWrapper>

            <div className="absolute top-[52%] left-[50%] z-30 -translate-x-1/2 -translate-y-1/2">
              <BotanicalCenterDial 
                drift={drift} setDrift={handleDriftChange} 
                spread={spread} setSpread={handleSpreadChange} 
                rate={rate}
                shadowStyle={CENTER_DIAL_SHADOWS[centerDialStyle].shadow}
                surfaceStyle={CENTER_DIAL_SURFACES[centerDialSurfaceStyle]}
                grooveStyle={CENTER_DIAL_GROOVES[centerDialGrooveStyle]}
                markStyleIndex={centerDialMarkStyle}
                numberStyleIndex={centerDialNumberStyle}
                circlesEnabled={centerDialCirclesEnabled}
                numbersEnabled={centerDialNumbersEnabled}
                guideRings={centerDialGuideRings}
                middleKnobStyle={middleKnobStyle}
                spreadPointerStyle={spreadPointerStyle}
                outerRingScaleStyle={outerRingScaleStyle}
                onDoubleClickDrift={() => handleDriftChange(0)}
                onDoubleClickSpread={() => handleSpreadChange(0)}
                readoutStyleIndex={readoutStyleIndex}
                animationStyle={driftAnimation}
                knobFlutterFilledColors={knobFlutterFilledColors}
                originalCopperTuning={originalCopperTuning}
                agedChampagneBrassTuning={agedChampagneBrassTuning}
                smokedChampagneBoldCleanTuning={smokedChampagneBoldCleanTuning}
                centerDepthModel={centerDepthModel}
                mode={mode}
              />
            </div>

            {/* Vertical Wabi-Sabi Text */}
            {showWabiSabi && (
              <div 
                className="absolute z-20 flex flex-col items-center pointer-events-none select-none transition-all duration-500"
                style={{
                  right: '4.5%',
                  top: '14%',
                  transform: 'translateY(-50%)',
                  opacity: 0.4,
                  color: '#7a5d49',
                  fontFamily: "'M PLUS 1p', sans-serif",
                  fontWeight: 700,
                  fontSize: '13px',
                  lineHeight: '1.4',
                  letterSpacing: '0.12em',
                  textShadow: '0 0.5px 0 rgba(255,255,255,0.3)'
                }}
              >
                <span>侘</span>
                <span>び</span>
                <span>寂</span>
                <span>び</span>
              </div>
            )}

            <EditableHardwareWrapper 
              id="mode" 
              x={hardwarePositions.mode.x} 
              y={hardwarePositions.mode.y} 
              locked={hardwarePositions.mode.locked}
              selected={selectedHardwareSection === 'mode'}
              onSelect={setSelectedHardwareSection}
              onUpdate={updateHardwarePosition}
              stageRef={pluginStageRef}
            >
              <ModeSelectorEngine mode={mode} setMode={setMode} styleIndex={modeStyle} power={power} isMovable={true} />
            </EditableHardwareWrapper>

            <div className="absolute top-[38%] right-[10%] z-30 grid grid-cols-2 gap-x-[21px] gap-y-9 justify-items-center translate-x-[6px] translate-y-[-10px]">
              <div className="relative -translate-x-[4px]">
                <MatteKnob label="Noise" value={noise} onChange={handleNoiseChange} onDoubleClick={() => handleNoiseChange(0)} size={50} shadingStyle={activeKnobStyle} outerRingEnabled={smallKnobRingEnabled} labelOffsetY={-5} readoutOffsetY={-1} labelTextShadow="none" labelSizeClass="text-[11px]" labelTrackingClass="tracking-[0.16em]" onDisplayFocus={() => markDisplayParam('noise')} readoutStyleIndex={readoutStyleIndex} />
              </div>
              <div className="relative -translate-x-[2px]">
                <MatteKnob label="Sweeten" displayLabel="Color" value={sweeten} onChange={handleSweetenChange} onDoubleClick={() => handleSweetenChange(0)} size={50} shadingStyle={activeKnobStyle} outerRingEnabled={smallKnobRingEnabled} labelOffsetY={-5} readoutOffsetY={-1} labelTextShadow="none" labelSizeClass="text-[11px]" labelTrackingClass="tracking-[0.16em]" onDisplayFocus={() => markDisplayParam('sweeten')} readoutStyleIndex={readoutStyleIndex} />
              </div>
              <div className="relative -translate-x-[4px] translate-y-[2px]">
                <MatteKnob label="Sat" value={biasHF} onChange={handleSatChange} onDoubleClick={() => handleSatChange(0)} size={50} shadingStyle={activeKnobStyle} outerRingEnabled={smallKnobRingEnabled} labelOffsetY={-5} readoutOffsetY={-1} labelTextShadow="none" labelSizeClass="text-[11px]" labelColorOverride="text-white/90" onDisplayFocus={() => markDisplayParam('sat')} readoutStyleIndex={readoutStyleIndex} />
              </div>
              <div className="relative -translate-x-[2px] translate-y-[2px]">
                <MatteKnob label="Filter" value={character} onChange={handleFilterChange} onDoubleClick={() => handleFilterChange(100)} size={50} shadingStyle={activeKnobStyle} outerRingEnabled={smallKnobRingEnabled} labelOffsetY={-5} readoutOffsetY={-1} labelTextShadow="none" labelSizeClass="text-[11px]" labelColorOverride="text-white/90" onDisplayFocus={() => markDisplayParam('filter')} readoutStyleIndex={readoutStyleIndex} />
              </div>
            </div>

            <div className="absolute right-[8.2%] top-[calc(64%+2px)] z-30 pointer-events-none">
              <ParameterDataDisplay
                parameter={activeDisplayData}
                power={power}
                saturationMode={saturationMode}
                onSaturationModeChange={(nextMode) => {
                  markDisplayParam('sat');
                  setSaturationMode(nextMode);
                }}
                filterPole={filterPole}
                onFilterPoleChange={(nextPole) => {
                  markDisplayParam('filter');
                  setFilterPole(normalizeFilterPole(nextPole));
                }}
              />
            </div>

            {!websiteMode && saturationStyle !== 0 && (
              <EditableHardwareWrapper 
                id="driftVisual" 
                x={hardwarePositions.driftVisual.x} 
                y={hardwarePositions.driftVisual.y} 
                locked={hardwarePositions.driftVisual.locked}
                selected={selectedHardwareSection === 'driftVisual'}
                onSelect={setSelectedHardwareSection}
                onUpdate={updateHardwarePosition}
                stageRef={pluginStageRef}
              >
                <div className="z-10 flex flex-col items-center translate-x-[-2px] translate-y-[12px]">
                  <SaturationSelectorEngine 
                    mode={saturationMode} 
                    setMode={setSaturationMode} 
                    styleIndex={saturationStyle} 
                    power={power} 
                  />
                  <div className="mt-2 text-center text-[10px] font-bold uppercase tracking-[0.32em] text-[#fff8eb] drop-shadow-sm">Saturation types</div>
                </div>
              </EditableHardwareWrapper>
            )}

            <EditableHardwareWrapper 
              id="rate" 
              x={hardwarePositions.rate.x} 
              y={hardwarePositions.rate.y} 
              locked={hardwarePositions.rate.locked}
              selected={selectedHardwareSection === 'rate'}
              onSelect={setSelectedHardwareSection}
              onUpdate={updateHardwarePosition}
              stageRef={pluginStageRef}
            >
              <div className="flex flex-col items-center gap-3">
                <MatteKnob label="Rate" value={rate} onChange={handleRateChange} size={68} shadingStyle={activeKnobStyle} outerRingEnabled={smallKnobRingEnabled} labelOffsetY={6} readoutOffsetY={-5} labelTextShadow="none" labelSizeClass="text-[11px]" labelTrackingClass="tracking-[0.16em]" steadyReadout indicatorActive={lfoEnabled && !lfoSync} onDisplayFocus={() => markDisplayParam('rate')} readoutStyleIndex={readoutStyleIndex} />
              </div>
            </EditableHardwareWrapper>

            <EditableHardwareWrapper 
              id="lfo" 
              x={hardwarePositions.lfo.x} 
              y={hardwarePositions.lfo.y} 
              locked={hardwarePositions.lfo.locked}
              selected={selectedHardwareSection === 'lfo'}
              onSelect={setSelectedHardwareSection}
              onUpdate={updateHardwarePosition}
              stageRef={pluginStageRef}
            >
              <OrbitalLfoControl
                active={lfoEnabled}
                setActive={setLfoEnabled}
                sync={lfoSync}
                setSync={handleLfoSyncChange}
                waveIndex={lfoShape}
                setWaveIndex={handleLfoShapeChange}
                rateIndex={lfoSyncDiv}
                setRateIndex={handleLfoSyncDivChange}
              />
            </EditableHardwareWrapper>

            <BottomSectionEngine
              depth={depth}
              setDepth={handleDepthChange}
              stereoPhase={stereoPhase}
              setStereoPhase={handlePhaseChange}
              styleIndex={bottomSectionStyle}
              lfoActive={lfoEnabled}
              readoutStyleIndex={readoutStyleIndex}
              screwStyle={screwStyle}
            />

            <EditableHardwareWrapper 
              id="autoGain" 
              x={hardwarePositions.autoGain.x} 
              y={hardwarePositions.autoGain.y} 
              locked={hardwarePositions.autoGain.locked}
              selected={selectedHardwareSection === 'autoGain'}
              onSelect={setSelectedHardwareSection}
              onUpdate={updateHardwarePosition}
              stageRef={pluginStageRef}
            >
              <MatteKnob
                label="Mix"
                value={mix}
                onChange={handleMixChange}
                onDoubleClick={() => handleMixChange(50)}
                size={68}
                shadingStyle={activeMixKnobStyle}
                outerRingEnabled={smallKnobRingEnabled}
                labelOffsetY={-4}
                labelTextShadow="none"
                labelSizeClass="text-[11px]"
                labelColorOverride="text-white/90"
                onDisplayFocus={() => markDisplayParam('mix')}
                readoutStyleIndex={readoutStyleIndex}
               
              />
            </EditableHardwareWrapper>

            <DesignGridOverlay mode={designGridMode} />

            <div
              className="absolute z-30 text-center text-[10px] font-black uppercase tracking-[0.22em]"
              style={{
                bottom: '3.4%',
                left: 'calc(22% - 18px)',
                transform: 'translateX(-50%)',
                color: 'rgba(52, 48, 41, 0.58)',
                textShadow: PANEL_TEXT_DEPTH_SHADOW
              }}
            >
              IMPERFECT BY DESIGN
            </div>

            <div
              className={`absolute inset-0 z-[90] pointer-events-none rounded-[4rem] bg-[#302d27]/50 transition-opacity duration-700 ${power ? 'opacity-0' : 'opacity-100'}`}
              style={{
                backdropFilter: 'grayscale(1) saturate(0.18) brightness(0.72)',
                WebkitBackdropFilter: 'grayscale(1) saturate(0.18) brightness(0.72)'
              }}
            />

            </div>
          </div>
        </div>
        <GlobalMasteringOverlay settings={globalMastering} scene />
      </div>
      </div>
      </div>

      {/* Sidebar Panel - Redesigned Sidebar */}
      {!websiteMode && (
      <div className="hidden lg:flex flex-col items-stretch gap-0 w-[300px] max-h-[calc(100vh-4rem)] overflow-y-auto rounded-[3rem] bg-black/30 backdrop-blur-3xl border border-white/10 shrink-0 shadow-2xl custom-scrollbar pb-12">
        <CollapsibleSection title="Depth Model" defaultOpen={true}>
          <DepthModelControls
            settings={depthModel}
            centerSettings={centerDepthModel}
            onChange={updateDepthModel}
            onCenterChange={updateCenterDepthModel}
            onPreset={applyDepthModelPreset}
          />
        </CollapsibleSection>
        
        <CollapsibleSection title="Global Mastering" defaultOpen={true}>
          <GlobalMasteringControls
            settings={globalMastering}
            onRootChange={updateGlobalMasteringRoot}
            onSectionChange={updateGlobalMasteringSection}
            onPreset={applyGlobalMasteringPreset}
            onReset={resetGlobalMastering}
          />
        </CollapsibleSection>

        {/* SECTION 1: GLOBAL STYLE */}
        <CollapsibleSection title="Master Design" defaultOpen={true}>
          <div className="grid grid-cols-1 gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-white/50 text-[9px] font-bold tracking-[0.2em] uppercase">Frame Surface</span>
              <div className="relative w-full h-11">
                <select value={frameStyle} onChange={e => setFrameStyle(normalizeFrameStyle(e.target.value))} className="absolute inset-0 w-full h-full bg-white/5 text-[#edd39a] rounded-xl border border-white/10 px-4 text-[12px] font-bold outline-none cursor-pointer appearance-none">
                  {FRAMES.map((f, i) => <option key={i} value={i}>{f.name}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">▼</div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-white/50 text-[9px] font-bold tracking-[0.2em] uppercase">Environment</span>
              <div className="relative w-full h-11">
                <select value={bgIndex} onChange={e => setBgIndex(Number(e.target.value))} className="absolute inset-0 w-full h-full bg-white/5 text-[#edd39a] rounded-xl border border-white/10 px-4 text-[12px] font-bold outline-none cursor-pointer appearance-none">
                  {BACKGROUNDS.map((bg, i) => <option key={i} value={i}>{bg.name}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">▼</div>
              </div>
              {bgIndex === CUSTOM_BACKGROUND_INDEX && (
                <>
                  <div className="relative h-11 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                    <input
                      type="color"
                      value={customBackgroundColor}
                      onChange={e => setCustomBackgroundColor(e.target.value)}
                      className="absolute -inset-2 h-[calc(100%+16px)] w-[calc(100%+16px)] cursor-pointer border-none bg-transparent"
                      aria-label="Custom environment color"
                    />
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-white/35">{customBackgroundColor}</span>
                </>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-white/50 text-[9px] font-bold tracking-[0.2em] uppercase">Panel Depth</span>
              <div className="relative w-full h-11">
                <select value={panelDepthStyle} onChange={e => setPanelDepthStyle(Number(e.target.value))} className="absolute inset-0 w-full h-full bg-white/5 text-[#edd39a] rounded-xl border border-white/10 px-4 text-[11px] font-bold outline-none cursor-pointer appearance-none">
                  {PANEL_DEPTH_STYLES.map((style, i) => <option key={i} value={i}>{style.name}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">▼</div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-white/50 text-[9px] font-bold tracking-[0.2em] uppercase">Object Contact Shadows</span>
              <div className="relative w-full h-11">
                <select value={objectContactShadowStyle} onChange={e => setObjectContactShadowStyle(Number(e.target.value))} className="absolute inset-0 w-full h-full bg-white/5 text-[#edd39a] rounded-xl border border-white/10 px-4 text-[11px] font-bold outline-none cursor-pointer appearance-none">
                  {OBJECT_CONTACT_SHADOW_STYLES.map((style, i) => <option key={i} value={i}>{style.name}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">▼</div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-white/50 text-[9px] font-bold tracking-[0.2em] uppercase">Panel Lighting</span>
              <div className="relative w-full h-11">
                <select value={panelLightingStyle} onChange={e => setPanelLightingStyle(Number(e.target.value))} className="absolute inset-0 w-full h-full bg-white/5 text-[#edd39a] rounded-xl border border-white/10 px-4 text-[11px] font-bold outline-none cursor-pointer appearance-none">
                  {PANEL_LIGHTING_STYLES.map((style, i) => <option key={i} value={i}>{style.name}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">▼</div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-white/50 text-[9px] font-bold tracking-[0.2em] uppercase">Panel Surface Texture</span>
              <div className="relative w-full h-11">
                <select value={panelSurfaceTextureStyle} onChange={e => setPanelSurfaceTextureStyle(Number(e.target.value))} className="absolute inset-0 w-full h-full bg-white/5 text-[#edd39a] rounded-xl border border-white/10 px-4 text-[11px] font-bold outline-none cursor-pointer appearance-none">
                  {PANEL_SURFACE_TEXTURE_STYLES.map((style, i) => <option key={i} value={i}>{style.name}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">▼</div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-white/50 text-[9px] font-bold tracking-[0.2em] uppercase">Bottom Section</span>
              <div className="relative w-full h-11">
                <select value={bottomSectionStyle} onChange={e => setBottomSectionStyle(Number(e.target.value))} className="absolute inset-0 w-full h-full bg-white/5 text-[#edd39a] rounded-xl border border-white/10 px-4 text-[11px] font-bold outline-none cursor-pointer appearance-none">
                  {BOTTOM_SECTION_STYLE_NAMES.map((name, i) => <option key={i} value={i}>{name}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">▼</div>
              </div>
            </div>

            <div className="flex flex-col gap-4 border-t border-white/10 pt-5">
              <span className="text-white/50 text-[9px] font-bold tracking-[0.2em] uppercase">Display Animation Audition</span>
              <div className="flex flex-col gap-2">
                <span className="text-white/35 text-[8px] font-black uppercase tracking-[0.18em]">Depth Display</span>
                <div className="relative w-full h-11">
                  <select
                    value={depthDisplayStyle}
                    onChange={e => {
                      setDepthDisplayStyle(normalizeDepthDisplayAnimationStyle(e.target.value));
                      markDisplayParam('depth');
                    }}
                    className="absolute inset-0 w-full h-full bg-white/5 text-[#edd39a] rounded-xl border border-white/10 px-4 text-[11px] font-bold outline-none cursor-pointer appearance-none"
                  >
                    {DEPTH_DISPLAY_ANIMATION_STYLES.map((name, i) => <option key={name} value={i}>{name}</option>)}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">▼</div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-white/35 text-[8px] font-black uppercase tracking-[0.18em]">Phase Display</span>
                <div className="relative w-full h-11">
                  <select
                    value={phaseDisplayStyle}
                    onChange={e => {
                      setPhaseDisplayStyle(normalizePhaseDisplayAnimationStyle(e.target.value));
                      markDisplayParam('phase');
                    }}
                    className="absolute inset-0 w-full h-full bg-white/5 text-[#edd39a] rounded-xl border border-white/10 px-4 text-[11px] font-bold outline-none cursor-pointer appearance-none"
                  >
                    {PHASE_DISPLAY_ANIMATION_STYLES.map((name, i) => <option key={name} value={i}>{name}</option>)}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">▼</div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-white/35 text-[8px] font-black uppercase tracking-[0.18em]">Spread Display</span>
                <div className="relative w-full h-11">
                  <select
                    value={spreadDisplayStyle}
                    onChange={e => {
                      setSpreadDisplayStyle(normalizeSpreadDisplayAnimationStyle(e.target.value));
                      markDisplayParam('spread');
                    }}
                    className="absolute inset-0 w-full h-full bg-white/5 text-[#edd39a] rounded-xl border border-white/10 px-4 text-[11px] font-bold outline-none cursor-pointer appearance-none"
                  >
                    {SPREAD_DISPLAY_ANIMATION_STYLES.map((name, i) => <option key={name} value={i}>{name}</option>)}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">▼</div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-white/35 text-[8px] font-black uppercase tracking-[0.18em]">Noise Display</span>
                <div className="relative w-full h-11">
                  <select
                    value={noiseDisplayStyle}
                    onChange={e => {
                      setNoiseDisplayStyle(normalizeNoiseDisplayAnimationStyle(e.target.value));
                      markDisplayParam('noise');
                    }}
                    className="absolute inset-0 w-full h-full bg-white/5 text-[#edd39a] rounded-xl border border-white/10 px-4 text-[11px] font-bold outline-none cursor-pointer appearance-none"
                  >
                    {NOISE_DISPLAY_ANIMATION_STYLES.map((name, i) => <option key={name} value={i}>{name}</option>)}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">▼</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-white/50 text-[9px] font-bold tracking-[0.2em] uppercase">Top Preset Bar</span>
              <div className="relative w-full h-11">
                <select value={normalizeTopBarStyle(topBarStyle)} onChange={e => setTopBarStyle(normalizeTopBarStyle(e.target.value))} className="absolute inset-0 w-full h-full bg-white/5 text-[#edd39a] rounded-xl border border-white/10 px-4 text-[11px] font-bold outline-none cursor-pointer appearance-none">
                  {TOP_BAR_STYLE_NAMES.map((name, i) => <option key={i} value={i}>{name}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">▼</div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-white/50 text-[9px] font-bold tracking-[0.2em] uppercase">Top Bar Colors</span>
              <TopBarThemeEditor
                title="Dark Rail"
                value={topBarCustomStyles[0]}
                defaults={DEFAULT_TOP_BAR_CUSTOM_STYLES[0]}
                onChange={patch => updateTopBarCustomStyle(0, patch)}
                onReset={() => resetTopBarCustomStyle(0)}
              />
              <TopBarThemeEditor
                title="Light Rail"
                value={topBarCustomStyles[1]}
                defaults={DEFAULT_TOP_BAR_CUSTOM_STYLES[1]}
                onChange={patch => updateTopBarCustomStyle(1, patch)}
                onReset={() => resetTopBarCustomStyle(1)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-white/50 text-[9px] font-bold tracking-[0.2em] uppercase">Drift Visual</span>
              <div className="relative w-full h-11">
                <select value={driftAnimation} onChange={e => setDriftAnimation(normalizeDriftAnimationStyle(e.target.value))} className="absolute inset-0 w-full h-full bg-white/5 text-[#edd39a] rounded-xl border border-white/10 px-4 text-[11px] font-bold outline-none cursor-pointer appearance-none">
                  {DRIFT_ANIMATION_STYLES.map((name, i) => <option key={i} value={i}>{name}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">▼</div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-white/50 text-[9px] font-bold tracking-[0.2em] uppercase">Brand Text Color</span>
              <div className="relative w-full h-11">
                <select value={brandTextStyle} onChange={e => setBrandTextStyle(normalizeBrandTextStyle(e.target.value))} className="absolute inset-0 w-full h-full bg-white/5 text-[#edd39a] rounded-xl border border-white/10 px-4 text-[11px] font-bold outline-none cursor-pointer appearance-none">
                  {BRAND_TEXT_STYLES.map((style, i) => <option key={i} value={i}>{style.name}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">▼</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <span className="text-white/50 text-[9px] font-bold tracking-[0.18em] uppercase">Vintage Color</span>
                <div className="relative h-11 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                  <input
                    type="color"
                    value={vintageLogoColor}
                    onChange={e => setVintageLogoColor(e.target.value)}
                    className="absolute -inset-2 h-[calc(100%+16px)] w-[calc(100%+16px)] cursor-pointer border-none bg-transparent"
                    aria-label="Vintage Drifter text color"
                  />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-white/35">{vintageLogoColor}</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-white/50 text-[9px] font-bold tracking-[0.18em] uppercase">Polaris Color</span>
                <div className="relative h-11 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                  <input
                    type="color"
                    value={polarisLogoColor}
                    onChange={e => setPolarisLogoColor(e.target.value)}
                    className="absolute -inset-2 h-[calc(100%+16px)] w-[calc(100%+16px)] cursor-pointer border-none bg-transparent"
                    aria-label="Polaris DSP text color"
                  />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-white/35">{polarisLogoColor}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-white/10 pt-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-white/50 text-[9px] font-bold tracking-[0.2em] uppercase">Alignment Grid</span>
                  <span className="text-white/35 text-[9px] font-bold uppercase tracking-[0.12em]">{designGridMode === 'off' ? 'Hidden' : designGridMode === 'normal' ? 'Normal' : 'Detailed'}</span>
                </div>
                <button onClick={() => setDesignGridMode(mode => mode === 'off' ? 'normal' : 'off')} className={`w-11 h-6 rounded-full border-2 border-white/20 flex items-center px-1 transition-colors ${designGridMode !== 'off' ? 'bg-[#d4af37]/40' : 'bg-black/20'}`}>
                  <div className={`w-3 h-3 rounded-full bg-white transition-transform ${designGridMode !== 'off' ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  ['off', 'Off'],
                  ['normal', 'Grid'],
                  ['detail', 'Detail']
                ].map(([mode, label]) => (
                  <button
                    key={mode}
                    onClick={() => setDesignGridMode(mode)}
                    className={`h-9 rounded-xl border text-[9px] font-black uppercase tracking-[0.14em] transition-all ${designGridMode === mode ? 'border-[#edd39a]/70 bg-[#edd39a]/18 text-[#edd39a]' : 'border-white/10 bg-white/5 text-white/45 hover:text-white/70'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-white/10 pt-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-white/50 text-[9px] font-bold tracking-[0.2em] uppercase">Panel Face Color</span>
                  <span className="text-white/35 text-[9px] font-bold uppercase tracking-[0.12em]">{useDefaultPanelFaceColor ? 'Default Cream' : panelFaceColor}</span>
                </div>
                <button
                  onClick={() => setUseDefaultPanelFaceColor(true)}
                  className={`rounded-full border px-3 py-1.5 text-[8px] font-black uppercase tracking-widest transition-all ${useDefaultPanelFaceColor ? 'border-[#edd39a]/60 bg-[#edd39a]/20 text-[#edd39a]' : 'border-white/15 bg-white/5 text-white/45 hover:text-white/70'}`}
                >
                  Default
                </button>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                <label className="relative h-10 w-10 shrink-0 cursor-pointer rounded-xl border border-white/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)]" style={{ backgroundColor: panelFaceColor }}>
                  <input
                    type="color"
                    value={panelFaceColor}
                    onChange={event => {
                      setPanelFaceColor(event.target.value);
                      setUseDefaultPanelFaceColor(false);
                    }}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    aria-label="Panel face color"
                  />
                </label>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/40">Custom Color</span>
                  <span className="font-mono text-[11px] uppercase text-[#edd39a]">{panelFaceColor}</span>
                </div>
                <button
                  onClick={() => setUseDefaultPanelFaceColor(false)}
                  className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-[8px] font-black uppercase tracking-widest text-white/50 transition-all hover:text-white/75"
                >
                  Apply
                </button>
              </div>
              <div className="h-8 rounded-xl border border-white/10 transition-colors" style={{ backgroundColor: activePanelFaceColor }} />
            </div>

            <div className="flex flex-col gap-4 border-t border-white/10 pt-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-white/50 text-[9px] font-bold tracking-[0.2em] uppercase">Face Texture</span>
                  <span className="text-white/35 text-[9px] font-bold uppercase tracking-[0.12em]">{faceTextureEnabled ? 'Enabled' : 'Disabled'}</span>
                </div>
                <button onClick={() => setFaceTextureEnabled(!faceTextureEnabled)} className={`w-11 h-6 rounded-full border-2 border-white/20 flex items-center px-1 transition-colors ${faceTextureEnabled ? 'bg-[#d4af37]/40' : 'bg-black/20'}`}>
                  <div className={`w-3 h-3 rounded-full bg-white transition-transform ${faceTextureEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <div className="relative h-14 overflow-hidden rounded-xl border border-white/10 bg-[#f4ead6]">
                  <div
                    className="absolute inset-0"
                    style={{
                      opacity: faceTextureOpacity / 100,
                      backgroundImage: selectedFaceTexture.backgroundImage,
                      backgroundSize: scaledFaceTextureBackgroundSize,
                      backgroundRepeat: selectedFaceTexture.backgroundRepeat || 'repeat',
                      backgroundPosition: selectedFaceTexture.backgroundPosition || '0 0',
                      backgroundBlendMode: selectedFaceTexture.backgroundBlendMode || 'normal',
                      mixBlendMode: faceTextureBlendMode || selectedFaceTexture.mixBlendMode
                    }}
                  />
                </div>
                <div className="relative w-full h-11">
                  <select value={faceTextureStyle} onChange={e => setFaceTextureStyle(Number(e.target.value))} className="absolute inset-0 w-full h-full bg-white/5 text-[#edd39a] rounded-xl border border-white/10 px-4 text-[11px] font-bold outline-none cursor-pointer appearance-none">
                    {FACE_TEXTURES.map((texture, i) => <option key={i} value={i}>{texture.name}</option>)}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">▼</div>
                </div>
              <div className="relative w-full h-11">
                <select value={faceTextureBlendMode} onChange={e => setFaceTextureBlendMode(normalizeFaceTextureBlendMode(e.target.value))} className="absolute inset-0 w-full h-full bg-white/5 text-[#edd39a] rounded-xl border border-white/10 px-4 text-[11px] font-bold outline-none cursor-pointer appearance-none">
                  {FACE_TEXTURE_BLEND_MODES.map(mode => <option key={mode} value={mode}>{mode}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">▼</div>
              </div>
              </div>

              <SakuraRange label="opac" value={faceTextureOpacity} min={0} max={70} onChange={setFaceTextureOpacity} />
              <SakuraRange label="size" value={faceTextureScale} min={50} max={220} onChange={setFaceTextureScale} />
            </div>

            <div className="flex flex-col gap-4 border-t border-white/10 pt-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-white/50 text-[9px] font-bold tracking-[0.2em] uppercase">Corner Screws</span>
                  <span className="text-white/35 text-[9px] font-bold uppercase tracking-[0.12em]">{screwsEnabled ? 'Enabled' : 'Disabled'}</span>
                </div>
                <button onClick={() => setScrewsEnabled(!screwsEnabled)} className={`w-11 h-6 rounded-full border-2 border-white/20 flex items-center px-1 transition-colors ${screwsEnabled ? 'bg-[#d4af37]/40' : 'bg-black/20'}`}>
                  <div className={`w-3 h-3 rounded-full bg-white transition-transform ${screwsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {SCREW_STYLES.map((style, i) => (
                  <button
                    key={style.name}
                    onClick={() => setScrewStyle(i)}
                    className={`flex h-11 items-center justify-center rounded-xl border transition-all ${screwStyle === i ? 'border-[#d4af37]/70 bg-[#d4af37]/15' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                    title={style.name}
                  >
                    <ScrewHead styleIndex={i} corner={`picker-${i}`} size={20} />
                  </button>
                ))}
              </div>

              <div className="relative w-full h-11">
                <select value={screwStyle} onChange={e => setScrewStyle(Number(e.target.value))} className="absolute inset-0 w-full h-full bg-white/5 text-[#edd39a] rounded-xl border border-white/10 px-4 text-[11px] font-bold outline-none cursor-pointer appearance-none">
                  {SCREW_STYLES.map((style, i) => <option key={i} value={i}>{style.name}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">▼</div>
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-white/10 pt-5">
              <span className="text-white/50 text-[9px] font-bold tracking-[0.2em] uppercase">Knob Readout Style</span>
              <div className="relative w-full h-11">
                <select value={readoutStyleIndex} onChange={e => setReadoutStyleIndex(Number(e.target.value))} className="absolute inset-0 w-full h-full bg-white/5 text-[#edd39a] rounded-xl border border-white/10 px-4 text-[11px] font-bold outline-none cursor-pointer appearance-none">
                  {KNOB_READOUT_STYLES.map((style, i) => <option key={i} value={i}>{style.name}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">▼</div>
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-white/10 pt-5">
              <button
                onClick={handleSaveCurrentAsDefault}
                className="w-full rounded-xl bg-[#e66a53] px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-[0_10px_24px_rgba(230,106,83,0.22)] transition-all active:scale-[0.98] hover:brightness-110"
              >
                Save Current As Default
              </button>
              <span className="min-h-[14px] text-center text-[9px] font-bold uppercase tracking-[0.16em] text-[#edd39a]/80">
                {defaultSaveMessage}
              </span>
            </div>
          </div>
        </CollapsibleSection>

        {/* SECTION 2: HARDWARE LAYOUT */}
        <CollapsibleSection title="Hardware Layout">
          <div className="flex flex-col gap-6">
            <div className={`flex flex-col gap-3 p-4 rounded-2xl border transition-all ${selectedHardwareSection === 'lfoImage' ? 'bg-white/10 border-white/30' : 'bg-white/5 border-white/10'}`}>
              <div className="flex items-center justify-between">
                <button onClick={() => setSelectedHardwareSection('lfoImage')} className="text-[10px] font-black tracking-widest text-[#edd39a] uppercase">
                  LFO Image
                </button>
                <div className="flex gap-2">
                  <button 
                    onClick={() => updateLfoImage({ enabled: !lfoImageSettings.enabled })}
                    className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border transition-all ${lfoImageSettings.enabled ? 'bg-[#d4af37]/20 border-[#d4af37]/40 text-[#edd39a]' : 'bg-white/5 border-white/20 text-white/50'}`}
                  >
                    {lfoImageSettings.enabled ? 'On' : 'Off'}
                  </button>
                  <button 
                    onClick={() => updateLfoImage({ locked: !lfoImageSettings.locked })}
                    className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border transition-all ${lfoImageSettings.locked ? 'bg-white/5 border-white/20 text-white/50' : 'bg-[#e66a53]/20 border-[#e66a53]/40 text-[#e66a53]'}`}
                  >
                    {lfoImageSettings.locked ? 'Locked' : 'Unlocked'}
                  </button>
                </div>
              </div>
              {lfoImageSettings.enabled && !lfoImageSettings.locked && (
                <div className="flex flex-col gap-2">
                  <SakuraRange label="X Pos" value={lfoImageSettings.x} min={0} max={850} onChange={v => updateLfoImage({ x: v })} />
                  <SakuraRange label="Y Pos" value={lfoImageSettings.y} min={0} max={850} onChange={v => updateLfoImage({ y: v })} />
                  <SakuraRange label="size" value={lfoImageSettings.size} min={16} max={260} onChange={v => updateLfoImage({ size: v })} />
                  <SakuraRange label="rot" value={lfoImageSettings.rotate} min={-180} max={180} onChange={v => updateLfoImage({ rotate: v })} />
                </div>
              )}
            </div>
            {Object.entries(hardwarePositions).map(([id, pos]) => (
              <div key={id} className="flex flex-col gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black tracking-widest text-[#edd39a] uppercase">
                    {id === 'io' ? 'I/O Knobs' : 
                     id === 'mode' ? 'Drift Modes' : 
                     id === 'driftVisual' ? 'Drift Visual' : 
                     id === 'rate' ? 'Rate Knob' : 
                     id === 'lfo' ? 'LFO Controls' : 
                     'Mix Knob'}
                  </span>
                  <button 
                    onClick={() => updateHardwarePosition(id, { locked: !pos.locked })}
                    className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border transition-all ${pos.locked ? 'bg-white/5 border-white/20 text-white/50' : 'bg-[#e66a53]/20 border-[#e66a53]/40 text-[#e66a53]'}`}
                  >
                    {pos.locked ? 'Locked' : 'Unlocked'}
                  </button>
                </div>
                {!pos.locked && (
                  <div className="flex flex-col gap-2">
                    <SakuraRange label="X Pos" value={pos.x} min={0} max={850} onChange={v => updateHardwarePosition(id, { x: v })} />
                    <SakuraRange label="Y Pos" value={pos.y} min={0} max={1000} onChange={v => updateHardwarePosition(id, { y: v })} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CollapsibleSection>

        {/* SECTION 3: DECORATIVE ELEMENTS */}
        <CollapsibleSection key="decor-circles-v2" title="Decor Circles" defaultOpen={true}>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-2 mb-2">
               <button onClick={() => updateAllDecorativeCircles({ enabled: true })} className="py-2 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black tracking-widest text-white/40 uppercase hover:text-white/70 transition-colors">All On</button>
               <button onClick={() => updateAllDecorativeCircles({ enabled: false })} className="py-2 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black tracking-widest text-white/40 uppercase hover:text-white/70 transition-colors">All Off</button>
            </div>
            {Object.keys(DECORATIVE_CIRCLE_LABELS).map((id, index) => {
              const settings = decorativeCircleSettings[id];
              if (!settings) return null;
              return (
                <CircleControlGroup
                  key={id} 
                  id={id} 
                  title={DECORATIVE_CIRCLE_LABELS[id]}
                  settings={settings} 
                  selected={selectedCircle === id} 
                  onSelect={() => setSelectedCircle(id)}
                  onToggle={() => updateDecorativeCircle(id, { enabled: !settings.enabled })}
                  onLockToggle={() => updateDecorativeCircle(id, { locked: !settings.locked })}
                  onUpdate={(patch) => updateDecorativeCircle(id, patch)}
                />
              );
            })}
          </div>
        </CollapsibleSection>

        {/* SECTION 3: HARDWARE STYLE */}
        <CollapsibleSection title="Hardware Build">
          <div className="grid grid-cols-1 gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-white/50 text-[9px] font-bold tracking-[0.2em] uppercase">Saturation Module</span>
              <div className="relative w-full h-11">
                <select value={saturationStyle} onChange={e => setSaturationStyle(normalizeSaturationStyle(e.target.value))} className="absolute inset-0 w-full h-full bg-white/5 text-[#edd39a] rounded-xl border border-white/10 px-4 text-[12px] font-bold outline-none cursor-pointer appearance-none">
                  {SATURATION_MODULE_STYLES.map((name, i) => <option key={i} value={i}>{name}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">▼</div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-white/50 text-[9px] font-bold tracking-[0.2em] uppercase">Mode Switch Style</span>
              <div className="relative w-full h-11">
                <select value={modeStyle} onChange={e => setModeStyle(Number(e.target.value))} className="absolute inset-0 w-full h-full bg-white/5 text-[#edd39a] rounded-xl border border-white/10 px-4 text-[11px] font-bold outline-none cursor-pointer appearance-none">
                  {MODE_STYLE_NAMES.map((name, i) => <option key={i} value={i}>{name}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">▼</div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-white/50 text-[9px] font-bold tracking-[0.2em] uppercase">Small Knob Material</span>
              <div className="relative w-full h-11">
                <select value={activeKnobStyleIndex} onChange={e => setKnobStyle(Number(e.target.value))} className="absolute inset-0 w-full h-full bg-white/5 text-[#edd39a] rounded-xl border border-white/10 px-4 text-[11px] font-bold outline-none cursor-pointer appearance-none">
                  {KNOB_STYLES.map((style, i) => <option key={i} value={i}>{style.name}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">▼</div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="flex flex-col gap-1">
                <span className="text-white/50 text-[9px] font-bold tracking-[0.2em] uppercase">Small Knob Ring</span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-white/30">{smallKnobRingEnabled ? 'Enabled' : 'Disabled'}</span>
              </div>
              <button
                type="button"
                onClick={() => setSmallKnobRingEnabled(current => !current)}
                className={`h-7 w-12 rounded-full border p-0.5 transition-all ${smallKnobRingEnabled ? 'border-[#e66a53]/50 bg-[#e66a53]/25' : 'border-white/15 bg-black/20'}`}
                aria-label="Toggle small knob ring"
              >
                <span className={`block h-5 w-5 rounded-full bg-white shadow-[0_2px_5px_rgba(0,0,0,0.45)] transition-transform ${smallKnobRingEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-white/50 text-[9px] font-bold tracking-[0.2em] uppercase">Mix Knob Style</span>
              <div className="relative w-full h-11">
                <select value={activeMixKnobStyleIndex} onChange={e => setMixKnobStyle(Number(e.target.value))} className="absolute inset-0 w-full h-full bg-white/5 text-[#edd39a] rounded-xl border border-white/10 px-4 text-[11px] font-bold outline-none cursor-pointer appearance-none">
                  {MIX_KNOB_STYLES.map((style, i) => <option key={i} value={i}>{style.name}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">▼</div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-white/50 text-[9px] font-bold tracking-[0.2em] uppercase">Center Dial Shadow</span>
              <div className="relative w-full h-11">
                <select value={centerDialStyle} onChange={e => setCenterDialStyle(Number(e.target.value))} className="absolute inset-0 w-full h-full bg-white/5 text-[#edd39a] rounded-xl border border-white/10 px-4 text-[11px] font-bold outline-none cursor-pointer appearance-none">
                  {CENTER_DIAL_SHADOWS.map((style, i) => <option key={i} value={i}>{style.name}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">▼</div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-white/50 text-[9px] font-bold tracking-[0.2em] uppercase">Middle Knob Style</span>
              <div className="relative w-full h-11">
                <select value={middleKnobStyle} onChange={e => setMiddleKnobStyle(normalizeMiddleKnobStyle(e.target.value))} className="absolute inset-0 w-full h-full bg-white/5 text-[#edd39a] rounded-xl border border-white/10 px-4 text-[11px] font-bold outline-none cursor-pointer appearance-none">
                  {MIDDLE_KNOB_STYLES.map((style, i) => <option key={i} value={i}>{style.name}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">▼</div>
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-col">
                  <span className="text-white/50 text-[9px] font-bold tracking-[0.2em] uppercase">Original Copper Tuning</span>
                  <span className="text-[9px] text-white/35 font-bold">Live controls for the true default copper knob.</span>
                </div>
                <button
                  onClick={resetOriginalCopperTuning}
                  className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-white/45 transition-all hover:text-white/70"
                >
                  Reset
                </button>
              </div>
              {[
                { key: 'ringInset', label: 'Outer Ring', min: 6, max: 10, step: 0.1, value: originalCopperTuning.ringInset, formatter: value => `${value.toFixed(1)}px` },
                { key: 'baseOuterShadowOpacity', label: 'Outer Shadow', min: 0, max: 1, step: 0.01, value: originalCopperTuning.baseOuterShadowOpacity, formatter: value => value.toFixed(2) },
                { key: 'baseInnerHighlightOpacity', label: 'Base Highlight', min: 0, max: 1, step: 0.01, value: originalCopperTuning.baseInnerHighlightOpacity, formatter: value => value.toFixed(2) },
                { key: 'baseInnerShadowOpacity', label: 'Base Inner Shadow', min: 0, max: 1, step: 0.01, value: originalCopperTuning.baseInnerShadowOpacity, formatter: value => value.toFixed(2) },
                { key: 'overlayDarkOpacity', label: 'Overlay Dark', min: 0, max: 1, step: 0.01, value: originalCopperTuning.overlayDarkOpacity, formatter: value => value.toFixed(2) },
                { key: 'overlayLightOpacity', label: 'Overlay Light', min: 0, max: 1, step: 0.01, value: originalCopperTuning.overlayLightOpacity, formatter: value => value.toFixed(2) },
                { key: 'overlayInnerShadowOpacity', label: 'Lip Shadow', min: 0, max: 1, step: 0.01, value: originalCopperTuning.overlayInnerShadowOpacity, formatter: value => value.toFixed(2) },
                { key: 'overlayOuterHighlightOpacity', label: 'Lip Highlight', min: 0, max: 1, step: 0.01, value: originalCopperTuning.overlayOuterHighlightOpacity, formatter: value => value.toFixed(2) }
              ].map(control => (
                <label key={control.key} className="grid grid-cols-[82px_1fr_46px] items-center gap-3">
                  <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/70">{control.label}</span>
                  <input
                    type="range"
                    min={control.min}
                    max={control.max}
                    step={control.step}
                    value={control.value}
                    onChange={e => updateOriginalCopperTuning({ [control.key]: Number(e.target.value) })}
                    className="w-full accent-[#edd39a]"
                  />
                  <span className="text-right text-[9px] font-bold tabular-nums text-[#edd39a]">{control.formatter(control.value)}</span>
                </label>
              ))}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[8px] text-white/40 uppercase font-black tracking-widest">Colors</span>
                  <button
                    onClick={resetOriginalCopperTuningColors}
                    className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-white/45 transition-all hover:text-white/70"
                  >
                    Reset Colors
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ['darkMetalColor', 'Dark Tone'],
                    ['lightMetalColor', 'Light Tone']
                  ].map(([key, label]) => (
                    <div key={key} className="flex flex-col gap-1.5">
                      <span className="text-[8px] text-white/40 uppercase font-black tracking-widest">{label}</span>
                      <div className="relative h-9 overflow-hidden rounded-lg border border-white/10 bg-white/5">
                        <input
                          type="color"
                          value={originalCopperTuning[key]}
                          onChange={e => updateOriginalCopperTuning({ [key]: e.target.value })}
                          className="absolute -inset-2 h-[calc(100%+16px)] w-[calc(100%+16px)] cursor-pointer border-none bg-transparent"
                          aria-label={`Original Copper ${label}`}
                        />
                      </div>
                      <span className="text-[8px] font-bold uppercase tracking-widest text-white/30">{originalCopperTuning[key]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-col">
                  <span className="text-white/50 text-[9px] font-bold tracking-[0.2em] uppercase">Aged Champagne Brass Tuning</span>
                  <span className="text-[9px] text-white/35 font-bold">Only affects the `Aged Champagne Brass` knob.</span>
                </div>
                <button
                  onClick={resetAgedChampagneBrassTuning}
                  className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-white/45 transition-all hover:text-white/70"
                >
                  Reset
                </button>
              </div>
              {[
                { key: 'ringInset', label: 'Outer Ring', min: 6, max: 10, step: 0.1, value: agedChampagneBrassTuning.ringInset, formatter: value => `${value.toFixed(1)}px` },
                { key: 'faceHighlightOpacity', label: 'Face Highlight', min: 0, max: 1, step: 0.01, value: agedChampagneBrassTuning.faceHighlightOpacity, formatter: value => value.toFixed(2) },
                { key: 'faceShadowOpacity', label: 'Face Shadow', min: 0, max: 1, step: 0.01, value: agedChampagneBrassTuning.faceShadowOpacity, formatter: value => value.toFixed(2) },
                { key: 'baseOuterShadowOpacity', label: 'Outer Shadow', min: 0, max: 1, step: 0.01, value: agedChampagneBrassTuning.baseOuterShadowOpacity, formatter: value => value.toFixed(2) },
                { key: 'baseInnerHighlightOpacity', label: 'Base Highlight', min: 0, max: 1, step: 0.01, value: agedChampagneBrassTuning.baseInnerHighlightOpacity, formatter: value => value.toFixed(2) },
                { key: 'baseInnerShadowOpacity', label: 'Base Inner Shadow', min: 0, max: 1, step: 0.01, value: agedChampagneBrassTuning.baseInnerShadowOpacity, formatter: value => value.toFixed(2) },
                { key: 'ringBorderOpacity', label: 'Ring Border', min: 0, max: 1, step: 0.01, value: agedChampagneBrassTuning.ringBorderOpacity, formatter: value => value.toFixed(2) },
                { key: 'ringHighlightOpacity', label: 'Ring Highlight', min: 0, max: 1, step: 0.01, value: agedChampagneBrassTuning.ringHighlightOpacity, formatter: value => value.toFixed(2) },
                { key: 'ringShadowOpacity', label: 'Ring Shadow', min: 0, max: 1, step: 0.01, value: agedChampagneBrassTuning.ringShadowOpacity, formatter: value => value.toFixed(2) },
                { key: 'sheenOpacity', label: 'Sheen', min: 0, max: 1, step: 0.01, value: agedChampagneBrassTuning.sheenOpacity, formatter: value => value.toFixed(2) }
              ].map(control => (
                <label key={control.key} className="grid grid-cols-[82px_1fr_46px] items-center gap-3">
                  <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/70">{control.label}</span>
                  <input
                    type="range"
                    min={control.min}
                    max={control.max}
                    step={control.step}
                    value={control.value}
                    onChange={e => updateAgedChampagneBrassTuning({ [control.key]: Number(e.target.value) })}
                    className="w-full accent-[#edd39a]"
                  />
                  <span className="text-right text-[9px] font-bold tabular-nums text-[#edd39a]">{control.formatter(control.value)}</span>
                </label>
              ))}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[8px] text-white/40 uppercase font-black tracking-widest">Colors</span>
                  <button
                    onClick={resetAgedChampagneBrassTuningColors}
                    className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-white/45 transition-all hover:text-white/70"
                  >
                    Reset Colors
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    ['darkMetalColor', 'Dark Tone'],
                    ['midMetalColor', 'Mid Tone'],
                    ['lightMetalColor', 'Light Tone']
                  ].map(([key, label]) => (
                    <div key={key} className="flex flex-col gap-1.5">
                      <span className="text-[8px] text-white/40 uppercase font-black tracking-widest">{label}</span>
                      <div className="relative h-9 overflow-hidden rounded-lg border border-white/10 bg-white/5">
                        <input
                          type="color"
                          value={agedChampagneBrassTuning[key]}
                          onChange={e => updateAgedChampagneBrassTuning({ [key]: e.target.value })}
                          className="absolute -inset-2 h-[calc(100%+16px)] w-[calc(100%+16px)] cursor-pointer border-none bg-transparent"
                          aria-label={`Aged Champagne Brass ${label}`}
                        />
                      </div>
                      <span className="text-[8px] font-bold uppercase tracking-widest text-white/30">{agedChampagneBrassTuning[key]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-col">
                  <span className="text-white/50 text-[9px] font-bold tracking-[0.2em] uppercase">Smoked Champagne Bold Clean Tuning</span>
                  <span className="text-[9px] text-white/35 font-bold">Only affects the `Smoked Champagne Bold Clean` knob.</span>
                </div>
                <button
                  onClick={resetSmokedChampagneBoldCleanTuning}
                  className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-white/45 transition-all hover:text-white/70"
                >
                  Reset
                </button>
              </div>
              {[
                { key: 'ringInset', label: 'Outer Ring', min: 6, max: 10, step: 0.1, value: smokedChampagneBoldCleanTuning.ringInset, formatter: value => `${value.toFixed(1)}px` },
                { key: 'faceHighlightOpacity', label: 'Face Highlight', min: 0, max: 1, step: 0.01, value: smokedChampagneBoldCleanTuning.faceHighlightOpacity, formatter: value => value.toFixed(2) },
                { key: 'faceShadowOpacity', label: 'Face Shadow', min: 0, max: 1, step: 0.01, value: smokedChampagneBoldCleanTuning.faceShadowOpacity, formatter: value => value.toFixed(2) },
                { key: 'baseOuterShadowOpacity', label: 'Outer Shadow', min: 0, max: 1, step: 0.01, value: smokedChampagneBoldCleanTuning.baseOuterShadowOpacity, formatter: value => value.toFixed(2) },
                { key: 'baseInnerHighlightOpacity', label: 'Base Highlight', min: 0, max: 1, step: 0.01, value: smokedChampagneBoldCleanTuning.baseInnerHighlightOpacity, formatter: value => value.toFixed(2) },
                { key: 'baseInnerShadowOpacity', label: 'Base Inner Shadow', min: 0, max: 1, step: 0.01, value: smokedChampagneBoldCleanTuning.baseInnerShadowOpacity, formatter: value => value.toFixed(2) },
                { key: 'ringBorderOpacity', label: 'Ring Border', min: 0, max: 1, step: 0.01, value: smokedChampagneBoldCleanTuning.ringBorderOpacity, formatter: value => value.toFixed(2) },
                { key: 'ringHighlightOpacity', label: 'Ring Highlight', min: 0, max: 1, step: 0.01, value: smokedChampagneBoldCleanTuning.ringHighlightOpacity, formatter: value => value.toFixed(2) },
                { key: 'ringShadowOpacity', label: 'Ring Shadow', min: 0, max: 1, step: 0.01, value: smokedChampagneBoldCleanTuning.ringShadowOpacity, formatter: value => value.toFixed(2) },
                { key: 'sheenOpacity', label: 'Sheen', min: 0, max: 1, step: 0.01, value: smokedChampagneBoldCleanTuning.sheenOpacity, formatter: value => value.toFixed(2) }
              ].map(control => (
                <label key={control.key} className="grid grid-cols-[82px_1fr_46px] items-center gap-3">
                  <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/70">{control.label}</span>
                  <input
                    type="range"
                    min={control.min}
                    max={control.max}
                    step={control.step}
                    value={control.value}
                    onChange={e => updateSmokedChampagneBoldCleanTuning({ [control.key]: Number(e.target.value) })}
                    className="w-full accent-[#edd39a]"
                  />
                  <span className="text-right text-[9px] font-bold tabular-nums text-[#edd39a]">{control.formatter(control.value)}</span>
                </label>
              ))}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[8px] text-white/40 uppercase font-black tracking-widest">Colors</span>
                  <button
                    onClick={resetSmokedChampagneBoldCleanTuningColors}
                    className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-white/45 transition-all hover:text-white/70"
                  >
                    Reset Colors
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    ['darkMetalColor', 'Dark Tone'],
                    ['midMetalColor', 'Mid Tone'],
                    ['lightMetalColor', 'Light Tone']
                  ].map(([key, label]) => (
                    <div key={key} className="flex flex-col gap-1.5">
                      <span className="text-[8px] text-white/40 uppercase font-black tracking-widest">{label}</span>
                      <div className="relative h-9 overflow-hidden rounded-lg border border-white/10 bg-white/5">
                        <input
                          type="color"
                          value={smokedChampagneBoldCleanTuning[key]}
                          onChange={e => updateSmokedChampagneBoldCleanTuning({ [key]: e.target.value })}
                          className="absolute -inset-2 h-[calc(100%+16px)] w-[calc(100%+16px)] cursor-pointer border-none bg-transparent"
                          aria-label={`Smoked Champagne Bold Clean ${label}`}
                        />
                      </div>
                      <span className="text-[8px] font-bold uppercase tracking-widest text-white/30">{smokedChampagneBoldCleanTuning[key]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-col">
                  <span className="text-white/50 text-[9px] font-bold tracking-[0.2em] uppercase">Power Switch Tuning</span>
                  <span className="text-[9px] text-white/35 font-bold">Adjust the black switch body and the center insert.</span>
                </div>
                <button
                  onClick={resetPowerSwitchTuning}
                  className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-white/45 transition-all hover:text-white/70"
                >
                  Reset
                </button>
              </div>
              <label className="grid grid-cols-[82px_1fr_46px] items-center gap-3">
                <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/70">Roundness</span>
                <input
                  type="range"
                  min={2}
                  max={16}
                  step={0.1}
                  value={powerSwitchTuning.bodyRadius}
                  onChange={e => updatePowerSwitchTuning({ bodyRadius: Number(e.target.value) })}
                  className="w-full accent-[#edd39a]"
                />
                <span className="text-right text-[9px] font-bold tabular-nums text-[#edd39a]">{powerSwitchTuning.bodyRadius.toFixed(1)}px</span>
              </label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[8px] text-white/40 uppercase font-black tracking-widest">Colors</span>
                  <button
                    onClick={resetPowerSwitchTuningColors}
                    className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-white/45 transition-all hover:text-white/70"
                  >
                    Reset Colors
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ['insertTopColor', 'Top Tone'],
                    ['insertBottomColor', 'Bottom Tone']
                  ].map(([key, label]) => (
                    <div key={key} className="flex flex-col gap-1.5">
                      <span className="text-[8px] text-white/40 uppercase font-black tracking-widest">{label}</span>
                      <div className="relative h-9 overflow-hidden rounded-lg border border-white/10 bg-white/5">
                        <input
                          type="color"
                          value={powerSwitchTuning[key]}
                          onChange={e => updatePowerSwitchTuning({ [key]: e.target.value })}
                          className="absolute -inset-2 h-[calc(100%+16px)] w-[calc(100%+16px)] cursor-pointer border-none bg-transparent"
                          aria-label={`Power Switch ${label}`}
                        />
                      </div>
                      <span className="text-[8px] font-bold uppercase tracking-widest text-white/30">{powerSwitchTuning[key]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-white/50 text-[9px] font-bold tracking-[0.2em] uppercase">Filled Flutter Colors</span>
                <button
                  onClick={() => setKnobFlutterFilledColors(DEFAULT_KNOB_FLUTTER_FILLED_COLORS)}
                  className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-white/45 transition-all hover:text-white/70"
                >
                  Reset
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  ['highlight', 'High'],
                  ['mid', 'Main'],
                  ['tail', 'Tail']
                ].map(([key, label]) => (
                  <div key={key} className="flex flex-col gap-1.5">
                    <span className="text-[8px] text-white/40 uppercase font-black tracking-widest">{label}</span>
                    <div className="relative h-9 overflow-hidden rounded-lg border border-white/10 bg-white/5">
                      <input
                        type="color"
                        value={knobFlutterFilledColors[key] || DEFAULT_KNOB_FLUTTER_FILLED_COLORS[key]}
                        onChange={e => setKnobFlutterFilledColors(colors => ({ ...colors, [key]: e.target.value }))}
                        className="absolute -inset-2 h-[calc(100%+16px)] w-[calc(100%+16px)] cursor-pointer border-none bg-transparent"
                        aria-label={`Knob flutter ${label} color`}
                      />
                    </div>
                    <span className="text-[8px] font-bold uppercase tracking-widest text-white/30">{knobFlutterFilledColors[key] || DEFAULT_KNOB_FLUTTER_FILLED_COLORS[key]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-white/50 text-[9px] font-bold tracking-[0.2em] uppercase">Center Dial Surface</span>
              <div className="relative w-full h-11">
                <select value={centerDialSurfaceStyle} onChange={e => setCenterDialSurfaceStyle(Number(e.target.value))} className="absolute inset-0 w-full h-full bg-white/5 text-[#edd39a] rounded-xl border border-white/10 px-4 text-[11px] font-bold outline-none cursor-pointer appearance-none">
                  {CENTER_DIAL_SURFACES.map((style, i) => <option key={i} value={i}>{style.name}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">▼</div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-white/50 text-[9px] font-bold tracking-[0.2em] uppercase">Dial Groove Style</span>
              <div className="relative w-full h-11">
                <select value={centerDialGrooveStyle} onChange={e => setCenterDialGrooveStyle(Number(e.target.value))} className="absolute inset-0 w-full h-full bg-white/5 text-[#edd39a] rounded-xl border border-white/10 px-4 text-[11px] font-bold outline-none cursor-pointer appearance-none">
                  {CENTER_DIAL_GROOVES.map((style, i) => <option key={i} value={i}>{style.name}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">▼</div>
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
              <span className="text-white/50 text-[9px] font-bold tracking-[0.2em] uppercase">Subtle Dial Rings</span>
              {[
                { key: 'large', label: 'Large Ring', min: 190, max: 286 },
                { key: 'small', label: 'Small Ring', min: 112, max: 220 }
              ].map(({ key, label, min, max }) => {
                const ring = { ...CENTER_DIAL_GUIDE_RING_DEFAULTS[key], ...(centerDialGuideRings?.[key] || {}) };
                return (
                  <div key={key} className="flex flex-col gap-2 rounded-lg border border-white/10 bg-black/10 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[9px] font-black uppercase tracking-[0.16em] text-[#edd39a]">{label}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateCenterDialGuideRing(key, { enabled: !ring.enabled })}
                          className={`rounded-full border px-2 py-1 text-[8px] font-black uppercase tracking-[0.12em] transition-all ${ring.enabled ? 'border-[#d4af37]/40 bg-[#d4af37]/15 text-[#edd39a]' : 'border-white/15 bg-white/5 text-white/45'}`}
                        >
                          {ring.enabled ? 'On' : 'Off'}
                        </button>
                        <button
                          onClick={() => updateCenterDialGuideRing(key, { locked: !ring.locked })}
                          className={`rounded-full border px-2 py-1 text-[8px] font-black uppercase tracking-[0.12em] transition-all ${ring.locked ? 'border-white/15 bg-white/5 text-white/45' : 'border-[#e66a53]/40 bg-[#e66a53]/15 text-[#e66a53]'}`}
                        >
                          {ring.locked ? 'Locked' : 'Resize'}
                        </button>
                      </div>
                    </div>
                    <label className="grid grid-cols-[34px_1fr_34px] items-center gap-2">
                      <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/70">Size</span>
                      <input
                        type="range"
                        min={min}
                        max={max}
                        step="1"
                        value={ring.size}
                        disabled={ring.locked || !ring.enabled}
                        onChange={e => updateCenterDialGuideRing(key, { size: Number(e.target.value) })}
                        className={`w-full accent-white ${ring.locked || !ring.enabled ? 'opacity-35' : ''}`}
                      />
                      <span className="text-right text-[9px] font-bold tabular-nums text-white/70">{ring.size}</span>
                    </label>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-white/50 text-[9px] font-bold tracking-[0.2em] uppercase">Dial Ring Style</span>
              <div className="relative w-full h-11">
                <select
                  value={centerDialMarkStyle}
                  onChange={e => {
                    const next = Number(e.target.value);
                    setCenterDialMarkStyle(next);
                    if (next > 0) setCenterDialCirclesEnabled(true);
                  }}
                  className="absolute inset-0 w-full h-full bg-white/5 text-[#edd39a] rounded-xl border border-white/10 px-4 text-[11px] font-bold outline-none cursor-pointer appearance-none"
                >
                  {CENTER_DIAL_MARK_STYLES.map((style, i) => <option key={i} value={i}>{style.name}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">▼</div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-white/50 text-[9px] font-bold tracking-[0.2em] uppercase">Dial Number Style</span>
              <div className="relative w-full h-11">
                <select
                  value={centerDialNumberStyle}
                  onChange={e => {
                    const next = Number(e.target.value);
                    setCenterDialNumberStyle(next);
                    if (next > 0) setCenterDialNumbersEnabled(true);
                  }}
                  className="absolute inset-0 w-full h-full bg-white/5 text-[#edd39a] rounded-xl border border-white/10 px-4 text-[11px] font-bold outline-none cursor-pointer appearance-none"
                >
                  {CENTER_DIAL_NUMBER_STYLES.map((style, i) => <option key={i} value={i}>{style.name}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">▼</div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-white/50 text-[9px] font-bold tracking-[0.2em] uppercase">Spread Pointer</span>
              <div className="relative w-full h-11">
                <select
                  value={spreadPointerStyle}
                  onChange={e => setSpreadPointerStyle(normalizeSpreadPointerStyle(e.target.value))}
                  className="absolute inset-0 w-full h-full bg-white/5 text-[#edd39a] rounded-xl border border-white/10 px-4 text-[11px] font-bold outline-none cursor-pointer appearance-none"
                >
                  {SPREAD_POINTER_STYLES.map((style, i) => <option key={i} value={i}>{style.name}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">▼</div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-white/50 text-[9px] font-bold tracking-[0.2em] uppercase">Outer Ring Scale</span>
              <div className="relative w-full h-11">
                <select
                  value={outerRingScaleStyle}
                  onChange={e => setOuterRingScaleStyle(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full bg-white/5 text-[#edd39a] rounded-xl border border-white/10 px-4 text-[11px] font-bold outline-none cursor-pointer appearance-none"
                >
                  {OUTER_RING_SCALES.map((style, i) => <option key={i} value={i}>{style.name}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">▼</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3">
                <span className="text-white/50 text-[9px] font-bold tracking-[0.18em] uppercase">Dial Circles</span>
                <button onClick={() => setCenterDialCirclesEnabled(!centerDialCirclesEnabled)} className={`w-10 h-5 rounded-full border border-white/20 flex items-center px-1 transition-colors ${centerDialCirclesEnabled ? 'bg-[#d4af37]/40' : 'bg-black/20'}`}>
                  <div className={`w-2.5 h-2.5 rounded-full bg-white transition-transform ${centerDialCirclesEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3">
                <span className="text-white/50 text-[9px] font-bold tracking-[0.18em] uppercase">Dial Numbers</span>
                <button onClick={() => setCenterDialNumbersEnabled(!centerDialNumbersEnabled)} className={`w-10 h-5 rounded-full border border-white/20 flex items-center px-1 transition-colors ${centerDialNumbersEnabled ? 'bg-[#d4af37]/40' : 'bg-black/20'}`}>
                  <div className={`w-2.5 h-2.5 rounded-full bg-white transition-transform ${centerDialNumbersEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-white/50 text-[9px] font-bold tracking-[0.2em] uppercase">I/O Meter Scale</span>
              <div className="relative w-full h-11">
                <select value={ioScaleStyle} onChange={e => setIoScaleStyle(Number(e.target.value))} className="absolute inset-0 w-full h-full bg-white/5 text-[#edd39a] rounded-xl border border-white/10 px-4 text-[11px] font-bold outline-none cursor-pointer appearance-none">
                  {IO_SCALE_NAMES.map((name, i) => <option key={i} value={i}>{name}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">▼</div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-white/50 text-[9px] font-bold tracking-[0.2em] uppercase">I/O Link Button</span>
              <div className="relative w-full h-11">
                <select
                  value={ioLinkStyle}
                  onChange={e => handleIOLinkStyleChange(e.target.value)}
                  className="absolute inset-0 w-full h-full bg-white/5 text-[#edd39a] rounded-xl border border-white/10 px-4 text-[11px] font-bold outline-none cursor-pointer appearance-none"
                >
                  {IO_LINK_STYLE_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">▼</div>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* SECTION 3: BOTANICAL ASSETS */}
        <CollapsibleSection title="Botanical Layers">
          <div className="flex flex-col gap-8">
            <SakuraControlGroup
              title="Sakura Top"
              settings={sakuraImageSettings.sakura}
              onToggle={() => updateSakuraImage('sakura', { enabled: !sakuraImageSettings.sakura.enabled })}
              onUpdate={patch => updateSakuraImage('sakura', patch)}
            />
            <SakuraControlGroup
              title="Sakura Left"
              settings={sakuraImageSettings.sakura2}
              onToggle={() => updateSakuraImage('sakura2', { enabled: !sakuraImageSettings.sakura2.enabled })}
              onUpdate={patch => updateSakuraImage('sakura2', patch)}
            />
            <SakuraControlGroup
              title="Sakura Bottom"
              settings={sakuraImageSettings.sakura3}
              onToggle={() => updateSakuraImage('sakura3', { enabled: !sakuraImageSettings.sakura3.enabled })}
              onUpdate={patch => updateSakuraImage('sakura3', patch)}
            />
            
            <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6">
               <div className="flex flex-col items-center gap-2">
                  <button onClick={() => setShowStems(!showStems)} className={`w-10 h-6 rounded-full border-2 border-white/20 flex items-center px-1 transition-colors ${showStems ? 'bg-[#d4af37]/40' : 'bg-black/20'}`}>
                    <div className={`w-3 h-3 rounded-full bg-white transition-transform ${showStems ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                  <span className="text-[8px] text-white/50 uppercase font-black tracking-widest">Stems</span>
               </div>
               <div className="flex flex-col items-center gap-2">
                  <button onClick={() => setShowFerns(!showFerns)} className={`w-10 h-6 rounded-full border-2 border-white/20 flex items-center px-1 transition-colors ${showFerns ? 'bg-[#e66a53]/40' : 'bg-black/20'}`}>
                    <div className={`w-3 h-3 rounded-full bg-white transition-transform ${showFerns ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                  <span className="text-[8px] text-white/50 uppercase font-black tracking-widest">Ferns</span>
               </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* SECTION 4: AURA SHAPES (NEW) */}
        <CollapsibleSection title="Aura Sculptor">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={addAuraShape}
                className="w-full py-3 rounded-xl bg-[#e66a53] text-white text-[10px] font-black tracking-[0.15em] uppercase hover:brightness-110 shadow-lg active:scale-95 transition-all"
              >
                Add Shape
              </button>
              <button 
                onClick={morphAllAuraShapes}
                className="w-full py-3 rounded-xl bg-white/10 border border-white/20 text-[#edd39a] text-[10px] font-black tracking-[0.15em] uppercase hover:bg-white/20 shadow-lg active:scale-95 transition-all"
              >
                Morph All
              </button>
            </div>

            {auraShapes.length > 0 && (
              <div className="flex flex-col gap-4 border-t border-white/5 pt-4">
                {auraShapes.map((shape, index) => (
                  <div key={shape.id} className={`p-4 rounded-2xl border transition-all ${selectedAuraShape === shape.id ? 'bg-white/10 border-white/30' : 'bg-white/5 border-transparent'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <button onClick={() => setSelectedAuraShape(shape.id)} className="text-[10px] font-bold text-white uppercase tracking-widest truncate max-w-[120px]">
                        Layer {index + 1}
                      </button>
                      <div className="flex gap-2">
                        <button onClick={() => updateAuraShape(shape.id, { locked: !shape.locked })} className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] ${shape.locked ? 'bg-red-500/30 text-red-200' : 'bg-white/10 text-white'}`}>
                          {shape.locked ? '🔒' : '🔓'}
                        </button>
                        <button onClick={() => removeAuraShape(shape.id)} className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center text-[10px] text-white/60 hover:bg-red-500/20 hover:text-red-300">✕</button>
                      </div>
                    </div>
                    <div className="mb-3 grid grid-cols-5 gap-1.5">
                      <button onClick={() => moveAuraShape(shape.id, 'back')} disabled={index === 0} className="rounded-md border border-white/10 bg-white/5 py-1.5 text-[7px] font-black uppercase tracking-widest text-white/55 transition-all hover:bg-white/10 disabled:opacity-25">Back</button>
                      <button onClick={() => moveAuraShape(shape.id, 'down')} disabled={index === 0} className="rounded-md border border-white/10 bg-white/5 py-1.5 text-[7px] font-black uppercase tracking-widest text-white/55 transition-all hover:bg-white/10 disabled:opacity-25">Down</button>
                      <button onClick={() => duplicateAuraShape(shape.id)} className="rounded-md border border-[#e66a53]/30 bg-[#e66a53]/12 py-1.5 text-[7px] font-black uppercase tracking-widest text-[#ffc1b3] transition-all hover:bg-[#e66a53]/20">Dup</button>
                      <button onClick={() => moveAuraShape(shape.id, 'up')} disabled={index === auraShapes.length - 1} className="rounded-md border border-white/10 bg-white/5 py-1.5 text-[7px] font-black uppercase tracking-widest text-white/55 transition-all hover:bg-white/10 disabled:opacity-25">Up</button>
                      <button onClick={() => moveAuraShape(shape.id, 'front')} disabled={index === auraShapes.length - 1} className="rounded-md border border-white/10 bg-white/5 py-1.5 text-[7px] font-black uppercase tracking-widest text-white/55 transition-all hover:bg-white/10 disabled:opacity-25">Front</button>
                    </div>
                    
                    {!shape.locked && (
                      <div className="flex flex-col gap-3">
                        <SakuraRange label="size" value={shape.size} min={50} max={AURA_SHAPE_MAX_SIZE} onChange={v => updateAuraShape(shape.id, { size: v })} />
                        <SakuraRange label="blur" value={shape.blur} min={0} max={150} onChange={v => updateAuraShape(shape.id, { blur: v })} />
                        <SakuraRange label="opac" value={Math.round(shape.opacity * 100)} min={0} max={100} onChange={v => updateAuraShape(shape.id, { opacity: v/100 })} />
                        <SakuraRange label="angle" value={shape.gradientAngle || 0} min={0} max={360} onChange={v => updateAuraShape(shape.id, { gradientAngle: v })} />
                        
                        <div className="flex items-center justify-between gap-3 px-1 mt-1">
                          <div className="flex flex-col gap-1.5 flex-1">
                            <span className="text-[8px] text-white/40 uppercase font-black tracking-widest">Color 1</span>
                            <div className="relative w-full h-8 rounded-lg overflow-hidden border border-white/10">
                              <input 
                                type="color" 
                                value={shape.color1 || shape.color} 
                                onChange={e => updateAuraShape(shape.id, { color1: e.target.value })}
                                className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)] cursor-pointer bg-transparent border-none"
                              />
                            </div>
                          </div>
                          <div className="flex flex-col gap-1.5 flex-1">
                            <span className="text-[8px] text-white/40 uppercase font-black tracking-widest">Color 2</span>
                            <div className="relative w-full h-8 rounded-lg overflow-hidden border border-white/10">
                              <input 
                                type="color" 
                                value={shape.color2 || (shape.color1 || shape.color)} 
                                onChange={e => updateAuraShape(shape.id, { color2: e.target.value })}
                                className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)] cursor-pointer bg-transparent border-none"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-black/10 p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[8px] text-white/40 uppercase font-black tracking-widest">Outline</span>
                            <button
                              onClick={() => updateAuraShape(shape.id, { outlineEnabled: !shape.outlineEnabled, outlineWidth: shape.outlineWidth || 8, outlineColor: shape.outlineColor || '#e66a53' })}
                              className={`rounded-full border px-3 py-1 text-[8px] font-black uppercase tracking-widest transition-all ${shape.outlineEnabled ? 'border-[#e66a53]/50 bg-[#e66a53]/20 text-[#ffc1b3]' : 'border-white/15 bg-white/5 text-white/45'}`}
                            >
                              {shape.outlineEnabled ? 'On' : 'Off'}
                            </button>
                          </div>
                          {shape.outlineEnabled && (
                            <>
                              <SakuraRange label="width" value={shape.outlineWidth ?? 8} min={0} max={80} onChange={v => updateAuraShape(shape.id, { outlineWidth: v })} />
                              <SakuraRange label="o opac" value={Math.round((shape.outlineOpacity ?? 1) * 100)} min={0} max={100} onChange={v => updateAuraShape(shape.id, { outlineOpacity: v / 100 })} />
                              <SakuraRange label="o blur" value={shape.outlineBlur ?? 0} min={0} max={80} onChange={v => updateAuraShape(shape.id, { outlineBlur: v })} />
                              <div className="flex flex-col gap-1.5">
                                <span className="text-[8px] text-white/40 uppercase font-black tracking-widest">Outline Color</span>
                                <div className="relative h-8 overflow-hidden rounded-lg border border-white/10">
                                  <input
                                    type="color"
                                    value={shape.outlineColor || '#e66a53'}
                                    onChange={e => updateAuraShape(shape.id, { outlineColor: e.target.value })}
                                    className="absolute -inset-2 h-[calc(100%+16px)] w-[calc(100%+16px)] cursor-pointer border-none bg-transparent"
                                  />
                                </div>
                              </div>
                            </>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-2 mt-2">
                          <button 
                            onClick={() => updateAuraShape(shape.id, { isAnimated: !shape.isAnimated })}
                            className={`flex-1 py-2 rounded-lg text-[8px] font-bold uppercase tracking-widest border transition-all ${shape.isAnimated ? 'bg-[#d4af37]/30 border-[#d4af37]/40 text-[#edd39a]' : 'bg-white/5 border-white/10 text-white/60'}`}
                          >
                            {shape.isAnimated ? 'Animated' : 'Static'}
                          </button>
                          <button 
                            onClick={() => updateAuraShape(shape.id, { blobRadius: generateRandomBlob() })}
                            className="flex-1 py-2 rounded-lg bg-white/10 text-[8px] font-bold text-white/80 uppercase tracking-widest border border-white/10 hover:bg-white/20 transition-all"
                          >
                            Morph Shape
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CollapsibleSection>


        {/* SECTION 6: GLOBAL TOGGLES */}
        <CollapsibleSection title="Workspace">
          <div className="grid grid-cols-3 gap-y-6">
             <div className="flex flex-col items-center gap-2">
                <button onClick={() => setShowOutputs(!showOutputs)} className={`w-11 h-6 rounded-full border-2 border-white/20 flex items-center px-1 transition-colors ${showOutputs ? 'bg-white/20' : 'bg-transparent'}`}>
                  <div className={`w-3 h-3 rounded-full bg-white transition-transform ${showOutputs ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
                <span className="text-[9px] text-white/50 uppercase font-bold tracking-widest">Cables</span>
             </div>
             <div className="flex flex-col items-center gap-2">
                <button onClick={() => setParallelCables(!parallelCables)} className={`w-11 h-6 rounded-full border-2 border-white/20 flex items-center px-1 transition-colors ${parallelCables ? 'bg-white/20' : 'bg-transparent'}`}>
                  <div className={`w-3 h-3 rounded-full bg-white transition-transform ${parallelCables ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
                <span className="text-[9px] text-white/50 uppercase font-bold tracking-widest">Parallel</span>
             </div>
             <div className="flex flex-col items-center gap-2">
                <button onClick={() => setShowWabiSabi(!showWabiSabi)} className={`w-11 h-6 rounded-full border-2 border-white/20 flex items-center px-1 transition-colors ${showWabiSabi ? 'bg-white/20' : 'bg-transparent'}`}>
                  <div className={`w-3 h-3 rounded-full bg-white transition-transform ${showWabiSabi ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
                <span className="text-[9px] text-white/50 uppercase font-bold tracking-widest">JP Text</span>
             </div>
          </div>
        </CollapsibleSection>

      </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes nixie-flicker {
          0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% { opacity: 1; filter: drop-shadow(0 0 5px rgba(255,85,0,0.8)); }
          20%, 22%, 24%, 55% { opacity: 0.5; filter: drop-shadow(0 0 1px rgba(255,85,0,0.3)); }
        }
        .anim-nixie { animation: nixie-flicker 4s infinite alternate; }
        @keyframes unstable-led-flicker {
          0%, 17%, 20%, 23%, 51%, 55%, 100% { opacity: 1; filter: drop-shadow(0 0 5.5px rgba(239,68,68,0.76)); }
          18%, 22%, 53% { opacity: 0.76; filter: drop-shadow(0 0 2.25px rgba(239,68,68,0.34)); }
        }
        .anim-unstable-led-flicker { animation: unstable-led-flicker 4.6s infinite alternate; }
        @keyframes vintage-led-flicker {
          0%, 20%, 23%, 56%, 60%, 100% { opacity: 1; filter: drop-shadow(0 0 5.5px rgba(251,146,60,0.6)); }
          21%, 58% { opacity: 0.9; filter: drop-shadow(0 0 3.25px rgba(251,146,60,0.33)); }
        }
        .anim-vintage-led-flicker { animation: vintage-led-flicker 6.8s infinite alternate; }
        @keyframes lfo-main-glow-in {
          0%, 45% { text-shadow: 0 0 0 rgba(223,111,90,0); }
          100% { text-shadow: 0 0 6px rgba(223,111,90,1); }
        }
        .lfo-main-glow-on {
          text-shadow: 0 0 0 rgba(223,111,90,0);
          animation: lfo-main-glow-in 760ms ease-out 80ms forwards;
        }
        .lfo-main-glow-off {
          text-shadow: none;
          animation: none;
        }
        @keyframes lfo-satellite-glow-in {
          0%, 45% { opacity: 0; }
          100% { opacity: 1; }
        }
        .lfo-satellite-glow-on {
          opacity: 0;
          box-shadow: 0 0 7px var(--lfo-satellite-glow);
          animation: lfo-satellite-glow-in 820ms ease-out 120ms forwards;
        }
        @keyframes sync-button-ember-on {
          0% {
            opacity: 0;
            background: radial-gradient(circle at 32% 24%, rgba(255, 218, 190, 0.04), rgba(255, 136, 104, 0) 58%);
            box-shadow: inset 0 0 0 rgba(255, 178, 145, 0), 0 0 0 rgba(173, 81, 70, 0);
          }
          42% {
            opacity: 0.74;
            background: radial-gradient(circle at 32% 24%, rgba(255, 220, 190, 0.18), rgba(255, 136, 104, 0.03) 62%);
            box-shadow: inset 0 1px 1px rgba(255, 214, 186, 0.14), 0 0 8px rgba(173, 81, 70, 0.22);
          }
          100% {
            opacity: 0.26;
            background: radial-gradient(circle at 32% 24%, rgba(255, 220, 190, 0.08), rgba(255, 136, 104, 0) 64%);
            box-shadow: inset 0 1px 1px rgba(255, 214, 186, 0.08), 0 0 4px rgba(173, 81, 70, 0.1);
          }
        }
        @keyframes sync-button-ember-off {
          0% {
            opacity: 0.22;
            background: radial-gradient(circle at 32% 24%, rgba(255, 220, 190, 0.08), rgba(255, 136, 104, 0) 64%);
            box-shadow: inset 0 1px 1px rgba(255, 214, 186, 0.08), 0 0 4px rgba(173, 81, 70, 0.1);
          }
          100% {
            opacity: 0;
            background: radial-gradient(circle at 32% 24%, rgba(255, 220, 190, 0), rgba(255, 136, 104, 0) 64%);
            box-shadow: inset 0 0 0 rgba(255, 214, 186, 0), 0 0 0 rgba(173, 81, 70, 0);
          }
        }
        .sync-button-ember-on {
          animation: sync-button-ember-on 520ms ease-out forwards;
        }
        .sync-button-ember-off {
          animation: sync-button-ember-off 360ms ease-out forwards;
        }
        @keyframes lfo-button-settle {
          0% { transform: scale(1, 1); }
          26% { transform: scale(1.038, 0.962); }
          58% { transform: scale(0.986, 1.014); }
          100% { transform: scale(1, 1); }
        }
        .lfo-button-settle {
          transform-origin: center;
          animation: lfo-button-settle 520ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        @keyframes option-button-settle {
          0% { transform: scale(1, 1); }
          28% { transform: scale(1.045, 0.955); }
          60% { transform: scale(0.984, 1.016); }
          100% { transform: scale(1, 1); }
        }
        .option-button-settle {
          transform-origin: center;
          animation: option-button-settle 460ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .knob-drift-spin {
          animation-name: spin;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          transform-origin: center;
        }
        .knob-drift-needle {
          transform-origin: center;
          transition: opacity 140ms ease-out, filter 140ms ease-out, box-shadow 140ms ease-out;
        }
        .drift-aurora-sheet {
          transform: translate(-50%, -50%);
          transform-origin: center;
          animation-name: drift-aurora-fold;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        @keyframes drift-aurora-fold {
          0%, 100% { transform: translate(-50%, -50%) rotate(-14deg) scale(0.92, 1.04); border-radius: 44% 56% 42% 58% / 62% 38% 58% 42%; }
          45% { transform: translate(calc(-50% + 16px), calc(-50% - 10px)) rotate(12deg) scale(1.08, 0.96); border-radius: 60% 40% 58% 42% / 38% 62% 44% 56%; }
          72% { transform: translate(calc(-50% - 10px), calc(-50% + 8px)) rotate(4deg) scale(1.02, 1.08); border-radius: 52% 48% 38% 62% / 54% 46% 64% 36%; }
        }
        .drift-aurora-liquid-field {
          will-change: filter, transform;
          animation: drift-aurora-liquid-breathe var(--drift-speed-slow) ease-in-out infinite;
        }
        @keyframes drift-aurora-liquid-breathe {
          0%, 100% { opacity: 1; }
          45% { opacity: 0.92; }
          72% { opacity: 0.98; }
        }
        .drift-aurora-core {
          transform: translate(-50%, -50%);
          animation-name: drift-core-pulse;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        @keyframes drift-core-pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(0.82); opacity: 0.18; }
          50% { transform: translate(-50%, -50%) scale(1.22); opacity: 0.42; }
        }
        .center-radar-sweep {
          animation: center-radar-sweep 8s linear infinite;
        }
        @keyframes center-radar-sweep {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes hud-slide-left {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes hud-pulse {
          0%, 100% { transform: scale(0.92); filter: drop-shadow(0 0 2px rgba(230,106,83,0.45)); }
          50% { transform: scale(1.12); filter: drop-shadow(0 0 8px rgba(230,106,83,0.85)); }
        }
        @keyframes hud-static {
          0%, 100% { transform: translate(0,0); opacity: 0.7; }
          50% { transform: translate(1px,1px); opacity: 0.35; }
        }
        @keyframes hud-meter-flicker {
          0%, 100% { transform: scaleX(0.74); }
          45% { transform: scaleX(1); }
          72% { transform: scaleX(0.52); }
        }
        @keyframes hud-audio-in {
          0%, 100% { transform: scaleX(0.42); }
          20% { transform: scaleX(0.92); }
          50% { transform: scaleX(0.58); }
          80% { transform: scaleX(1); }
        }
        @keyframes hud-audio-out {
          0%, 100% { transform: scaleX(0.5); }
          30% { transform: scaleX(0.76); }
          60% { transform: scaleX(1); }
          90% { transform: scaleX(0.48); }
        }
        @keyframes hud-heat-bar {
          0%, 100% { transform: scaleY(0.72); }
          50% { transform: scaleY(1.08); }
        }
        @keyframes hud-heat-shimmer {
          0% { transform: translateX(0) scaleX(0.88); opacity: 0.22; }
          50% { transform: translateX(35%) scaleX(1.06); opacity: 0.75; }
          100% { transform: translateX(78%) scaleX(0.92); opacity: 0.28; }
        }
        @keyframes hud-glow-breathe {
          0%, 100% { opacity: var(--hud-glow-min, 0.24); filter: blur(8px) saturate(1.08); }
          52% { opacity: var(--hud-glow-max, 0.5); filter: blur(10px) saturate(1.22); }
        }
        @keyframes hud-sweeten-bloom {
          0%, 100% { transform: scale(0.94); }
          50% { transform: scale(1.12); }
        }
        @keyframes hud-depth-soft {
          0%, 100% { opacity: 0.72; }
          50% { opacity: 1; }
        }
        @keyframes hud-depth-ring {
          0% { transform: scale(0.86); opacity: 0.12; }
          48% { opacity: 0.44; }
          100% { transform: scale(1.16); opacity: 0.08; }
        }
        @keyframes hud-depth-liquid {
          0%, 100% { transform: translateY(1px) scaleX(1); }
          50% { transform: translateY(-1px) scaleX(1.04); }
        }
        @keyframes hud-phase-soft {
          0%, 100% { opacity: 0.62; filter: drop-shadow(0 0 1px rgba(230,106,83,0.3)); }
          50% { opacity: 0.9; filter: drop-shadow(0 0 4px rgba(230,106,83,0.62)); }
        }
        @keyframes hud-mix-float {
          0%, 100% { transform: translateX(-0.6px) scaleY(0.96); opacity: 0.86; }
          50% { transform: translateX(0.8px) scaleY(1.04); opacity: 1; }
        }
        @keyframes hud-mix-dots {
          0%, 100% { transform: translateY(-0.3px); opacity: 0.62; }
          50% { transform: translateY(0.4px); opacity: 0.9; }
        }
        @keyframes hud-sat-reel {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes hud-sat-tube {
          0%, 100% { opacity: 0.82; filter: drop-shadow(0 0 2px rgba(230,106,83,0.38)); }
          45% { opacity: 1; filter: drop-shadow(0 0 6px rgba(230,106,83,0.72)); }
          62% { opacity: 0.9; filter: drop-shadow(0 0 3px rgba(255,186,131,0.54)); }
        }
        @keyframes knob-flutter-spill {
          0%, 100% { transform: rotate(-0.5deg) scale(0.992); opacity: 0.78; }
          46% { transform: rotate(0.8deg) scale(1.012); opacity: 1; }
          72% { transform: rotate(0.2deg) scale(1.004); opacity: 0.88; }
        }
        @keyframes hud-drift-wave {
          0%, 100% { filter: drop-shadow(0 0 2px rgba(230,106,83,0.5)); opacity: 0.72; }
          36% { filter: drop-shadow(0 0 7px rgba(230,106,83,0.88)); opacity: 0.98; }
          68% { filter: drop-shadow(0 0 4px rgba(230,106,83,0.64)); opacity: 0.82; }
        }
        @keyframes hud-drift-dot {
          0%, 100% { filter: drop-shadow(0 0 2px rgba(230,106,83,0.45)); }
          45% { filter: drop-shadow(0 0 8px rgba(230,106,83,0.92)); }
          70% { filter: drop-shadow(0 0 4px rgba(230,106,83,0.62)); }
        }
        .hud-slide-left { animation: hud-slide-left 3s linear infinite; }
        .hud-pulse { animation: hud-pulse 1.8s ease-in-out infinite; }
        .hud-static { animation: hud-static 0.12s steps(2) infinite; }
        .hud-meter-flicker { transform-origin: left center; animation: hud-meter-flicker 1.25s ease-in-out infinite; }
        .hud-audio-in { transform-origin: left center; animation: hud-audio-in 1.2s ease-in-out infinite; }
        .hud-audio-out { transform-origin: left center; animation: hud-audio-out 1.4s ease-in-out infinite; }
        .hud-heat-bar { transform-origin: center bottom; animation: hud-heat-bar 1.4s ease-in-out infinite; }
        .hud-heat-shimmer { animation: hud-heat-shimmer 1.8s ease-in-out infinite; }
        .hud-glow-breathe { animation: hud-glow-breathe 2.4s ease-in-out infinite; }
        .hud-sweeten-bloom { animation: hud-sweeten-bloom 2.6s ease-in-out infinite; }
        .hud-depth-soft { animation: hud-depth-soft 1.8s ease-in-out infinite; }
        .hud-depth-ring { animation: hud-depth-ring 2.2s ease-in-out infinite; }
        .hud-depth-liquid { animation: hud-depth-liquid 2.1s ease-in-out infinite; }
        .hud-phase-soft { animation: hud-phase-soft 2s ease-in-out infinite; }
        .hud-mix-float { transform-origin: center; animation: hud-mix-float 3.4s ease-in-out infinite; }
        .hud-mix-dots { transform-origin: center; animation: hud-mix-dots 3.1s ease-in-out infinite; }
        .hud-sat-reel { animation: hud-sat-reel 2.4s linear infinite; }
        .hud-sat-tube { transform-origin: center; animation: hud-sat-tube 2.6s ease-in-out infinite; }
        .knob-flutter-spill { transform-origin: center; animation: knob-flutter-spill var(--spill-speed, 2.4s) ease-in-out infinite; }
        .hud-drift-wave { animation-name: hud-drift-wave; animation-timing-function: ease-in-out; animation-iteration-count: infinite; }
        .hud-drift-dot { animation-name: hud-drift-dot; animation-timing-function: ease-in-out; animation-iteration-count: infinite; }
        .hud-screen-soft {
          filter: saturate(0.93) contrast(0.91) drop-shadow(0 0 2px rgba(230,106,83,0.16));
          opacity: 0.95;
          text-shadow: 0 0 3px rgba(230,106,83,0.21);
        }
        ${websiteMode ? '.plugin-wrapper *' : '*'} { -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; }
        ${websiteMode ? '' : 'body { overflow: hidden; touch-action: none; }'}
        input[type="range"] { -webkit-user-select: auto; user-select: auto; }
        .top-preset-option:hover {
          background: var(--preset-option-hover-bg) !important;
          color: var(--preset-option-hover-text) !important;
        }
        .top-preset-option-active {
          color: var(--preset-option-selected-text) !important;
        }
        .lfo-scrollbar::-webkit-scrollbar { width: 3px; }
        .lfo-scrollbar::-webkit-scrollbar-track { background: transparent; margin-block: 14px; }
        .lfo-scrollbar::-webkit-scrollbar-thumb { background: var(--scrollbar-thumb-color, rgba(223,111,90,0.4)); border-radius: 4px; }
        .lfo-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--scrollbar-thumb-hover-color, rgba(223,111,90,0.8)); }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.35); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}} />
    </div>
  );
}
