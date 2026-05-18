import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import sakuraSrc from './Images/Sakura.png';
import sakura2Src from './Images/Sakura2.png';
import lfoSrc from './Images/LFO.png';

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
  'Knob Flutter Coral Filled'
];

const SAT_MODES = ['Tape Saturation', 'Tube Saturation'];
const FLUTTER_ANIMATION_EPOCH = Date.now();

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
  "autoGain": true,
  "lfoEnabled": true,
  "lfoSync": false,
  "lfoShape": 0,
  "lfoSyncDiv": 6,
  "currentPreset": 9,
  "frameStyle": 8,
  "modeStyle": 13,
  "knobStyle": 0,
  "mixKnobStyle": 0,
  "smallKnobRingEnabled": true,
  "centerDialStyle": 1,
  "middleKnobStyle": 0,
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
  "autoGain": true,
  "lfoEnabled": true,
  "lfoSync": false,
  "lfoShape": 0,
  "lfoSyncDiv": 6,
  "currentPreset": 9,
  "frameStyle": 13,
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
  "drift": 30.259375000000006,
  "spread": 0,
  "character": 100,
  "sweeten": 0,
  "biasHF": 0,
  "noise": 0,
  "mix": 70.35,
  "rate": 28.29374999999999,
  "depth": 100,
  "stereoPhase": 100,
  "mode": "vintage",
  "lfoEnabled": true,
  "lfoSync": false,
  "lfoShape": 0,
  "lfoSyncDiv": 6,
  "currentPreset": 9,
  "frameStyle": 13,
  "modeStyle": 13,
  "knobStyle": 7,
  "mixKnobStyle": 1,
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
  "driftAnimation": 13,
  "bgIndex": 3,
  "showOutputs": true,
  "parallelCables": true,
  "showStems": false,
  "showFerns": false,
  "showWabiSabi": false,
  "faceTextureEnabled": true,
  "faceTextureStyle": 0,
  "faceTextureOpacity": 30,
  "panelFaceColor": "#935748",
  "useDefaultPanelFaceColor": true,
  "brandTextStyle": 1,
  "vintageLogoColor": "#7f3629",
  "polarisLogoColor": "#7f362e",
  "knobFlutterFilledColors": {
    "highlight": "#e9af96",
    "mid": "#9a5242",
    "tail": "#782a21"
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
      "x": 683,
      "y": 723,
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
      "opacity": 0.28,
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
      "opacity": 0.95,
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
      "color1": "#97473b",
      "color2": "#935a4d",
      "gradientAngle": 360,
      "isAnimated": true,
      "blobRadius": "38% 70% 60% 56% / 26% 64% 40% 72%",
      "outlineEnabled": false,
      "outlineWidth": 10,
      "outlineColor": "#d6cdb6",
      "outlineOpacity": 0.26
    },
    {
      "id": "aura-1779079657594",
      "enabled": true,
      "locked": true,
      "x": 634,
      "y": 771,
      "size": 742,
      "rotate": -90,
      "opacity": 1,
      "blur": 0,
      "color1": "#9a493c",
      "color2": "#9b594b",
      "gradientAngle": 360,
      "isAnimated": true,
      "blobRadius": "45% 69% 32% 48% / 72% 74% 61% 66%",
      "outlineEnabled": true,
      "outlineWidth": 12,
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
      "x": 72,
      "y": 464,
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
      "outlineOpacity": 0.3,
      "outlineBlur": 0
    }
  ],
  "ioScaleStyle": 6,
  "bottomSectionStyle": 0,
  "readoutStyleIndex": 5,
  "saturationMode": 0,
  "saturationStyle": 0
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

const KnobDriftExperiment = ({ drift, spread, active, rate, variant }) => {
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
  const stageClass = `absolute left-1/2 top-1/2 z-30 w-[236px] h-[236px] -translate-x-1/2 -translate-y-1/2 pointer-events-none overflow-hidden rounded-full transition-all duration-500 ease-out ${active ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`;
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
    if (variant === 'dualSmoothOuterRibbon' || variant === 'dualSmoothOuterRibbonClean') {
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
      return (
        <div className={stageClass} style={{ ...stageStyle, width: outerStageSize, height: outerStageSize }}>
          <svg className="absolute inset-0 h-full w-full mix-blend-screen" viewBox={`0 0 ${outerStageSize} ${outerStageSize}`} aria-hidden="true">
            <defs>
              <linearGradient id={outerGradientId} x1="14%" y1="12%" x2="86%" y2="88%">
                <stop offset="0%" stopColor="#ffb09e" stopOpacity="0.95" />
                <stop offset="52%" stopColor="#e66a53" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#7e2a24" stopOpacity="0.64" />
              </linearGradient>
            </defs>
            {variant !== 'dualSmoothOuterRibbonClean' && (
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
              opacity={0.34 + spreadIntensity * 0.5}
              transform={`rotate(135 ${outerCenter} ${outerCenter})`}
              vectorEffect="non-scaling-stroke"
              style={{
                filter: `drop-shadow(0 0 ${4 + spreadIntensity * 8}px rgba(230,106,83,0.62))`,
                transition: 'stroke-dasharray 150ms ease-out, opacity 150ms ease-out, filter 150ms ease-out'
              }}
            />
          </svg>
          <div className="absolute left-1/2 top-1/2 h-[236px] w-[236px] -translate-x-1/2 -translate-y-1/2">
            {renderFineDriftNeedles()}
          </div>
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
    const svgTransition = 'stroke-dasharray 150ms ease-out, stroke-dashoffset 150ms ease-out, opacity 150ms ease-out, filter 150ms ease-out';
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
          opacity: 0.9,
          filter: 'brightness(0.95)',
          mixBlendMode: 'luminosity'
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
      return <div className={`${stableReadoutClass} text-[11px] font-mono text-red-500 drop-shadow-[0_0_4px_rgba(239,68,68,0.8)] bg-black/80 px-1.5 py-0.5 rounded border border-red-900/50 whitespace-nowrap`}>{val}</div>;
    case 'glass':
      return <div className={`${stableReadoutClass} text-[10px] text-black/80 backdrop-blur-md bg-white/10 px-2 py-0.5 rounded-full border border-white/20 shadow-lg whitespace-nowrap font-bold tracking-wider`}>{val}</div>;
    case 'coral-glass':
      return <div className={`${stableReadoutClass} text-[10px] text-[#e66a53] backdrop-blur-md bg-white/15 px-2 py-0.5 rounded-full border border-[#e66a53]/30 shadow-lg whitespace-nowrap font-bold tracking-wider`}>{val}</div>;
    case 'obsidian-coral':
      return <div className={`${stableReadoutClass} text-[10px] text-[#e66a53] backdrop-blur-lg bg-black/40 px-2.5 py-0.5 rounded-lg border border-white/10 shadow-xl whitespace-nowrap font-bold tracking-widest uppercase`}>{val}</div>;
    case 'minimal-coral':
      return <div className={`${stableReadoutClass} text-[11px] font-bold text-[#e66a53] drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] whitespace-nowrap tracking-widest`} style={{ fontFamily: "'Figtree', sans-serif" }}>{val}</div>;
    case 'stealth-modern':
      return <div className={`${stableReadoutClass} text-[10px] text-[#fff8ee]/90 backdrop-blur-md bg-black/60 px-2.5 py-0.5 rounded border border-white/10 shadow-xl whitespace-nowrap font-bold tracking-wider`}>{val}</div>;
    case 'rounded-stealth-ivory':
      return <div className={`${stableReadoutClass} text-[11px] text-[#edd39a] backdrop-blur-md bg-black/60 px-2.5 py-0.5 rounded-full border border-[#edd39a]/20 shadow-xl whitespace-nowrap font-bold tracking-[0.18em] uppercase`} style={{ fontFamily: "'Figtree', sans-serif" }}>{val}</div>;
    case 'hardware-label':
      return <div className={`${stableReadoutClass} text-[10px] font-black text-black bg-[#e66a53] px-2 py-0.5 rounded shadow-[0_2px_4px_rgba(0,0,0,0.3)] whitespace-nowrap uppercase tracking-widest`}>{val}</div>;
    case 'stealth-ghost':
      return <div className={`${stableReadoutClass} text-[11px] text-white backdrop-blur-md bg-black/60 px-2 py-0.5 rounded border border-white/10 shadow-xl whitespace-nowrap font-bold tracking-[0.18em] uppercase`} style={{ fontFamily: "'Figtree', sans-serif" }}>{val}</div>;
    case 'stealth-coral':
      return <div className={`${stableReadoutClass} text-[11px] text-[#e66a53] backdrop-blur-md bg-black/60 px-2 py-0.5 rounded border border-[#e66a53]/20 shadow-xl whitespace-nowrap font-bold tracking-[0.18em] uppercase`} style={{ fontFamily: "'Figtree', sans-serif" }}>{val}</div>;
    case 'stealth-ivory':
      return <div className={`${stableReadoutClass} text-[11px] text-[#edd39a] backdrop-blur-md bg-black/60 px-2 py-0.5 rounded border border-[#edd39a]/20 shadow-xl whitespace-nowrap font-bold tracking-[0.18em] uppercase`} style={{ fontFamily: "'Figtree', sans-serif" }}>{val}</div>;
    default:
      return null;
  }
};

const DISPLAY_ACCENT = '#e66a53';
const DISPLAY_FONT_STACK = "'Chakra Petch', 'DIN Condensed', 'Avenir Next Condensed', 'Helvetica Neue', Arial, sans-serif";

const DISPLAY_PARAMETER_CONFIG = {
  input: { name: 'INPUT', label: 'INPUT', anim: 'bars' },
  output: { name: 'OUTPUT', label: 'OUTPUT', anim: 'bars' },
  noise: { name: 'NOISE', label: 'NOISE', anim: 'static' },
  sweeten: { name: 'SWEETEN', label: 'SWEETEN', anim: 'sparkle' },
  sat: { name: 'SAT', label: 'SAT', anim: 'heat' },
  filter: { name: 'FILTER', label: 'FILTER', anim: 'curve' },
  drift: { name: 'DRIFT', label: 'DRIFT', anim: 'drift' },
  spread: { name: 'SPREAD', label: 'SPREAD', anim: 'width' },
  rate: { name: 'RATE', label: 'RATE', anim: 'rateWave' },
  depth: { name: 'DEPTH', label: 'DEPTH ◍', anim: 'pulse' },
  phase: { name: 'PHASE', label: 'PHASE ◐', anim: 'circle' },
  mix: { name: 'MIX', label: 'MIX', anim: 'mixBlend' }
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
  return {
    ...config,
    id,
    ...split,
    level: Math.max(0.04, Math.min(1, (Number(value) || 0) / 100)),
    signalIn: Math.max(0.12, Math.min(1, (Number(options.input) || 0) / 100)),
    signalOut: Math.max(0.12, Math.min(1, (Number(options.output) || 0) / 100)),
    mode: options.mode,
    rate: options.rate,
    waveShape: options.waveShape,
    driftAnimation: options.driftAnimation
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
  const buttonClass = 'w-6 h-6 rounded-full bg-gradient-to-b from-[#3A2D25] to-[#1A1410] border border-[#5A4535]/40 shadow-[0_2px_4px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.1)] flex items-center justify-center text-[#8D7B68] hover:text-[#FF6B4A] hover:border-[#FF6B4A]/50 active:scale-95 transition-all outline-none';

  return (
    <>
      <button type="button" onClick={onPrev} className={buttonClass} aria-label="Previous option">
        <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M10 14L4 8l6-6v12z" />
        </svg>
      </button>
      <button type="button" onClick={onNext} className={buttonClass} aria-label="Next option">
        <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M6 2l6 6-6 6V2z" />
        </svg>
      </button>
    </>
  );
};

const DisplayFeatureAnimation = ({ parameter }) => {
  const level = parameter.level ?? 0.5;
  const accent = DISPLAY_ACCENT;
  const speed = `${Math.max(0.85, 3.4 - level * 2.1)}s`;

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
      return (
        <div className="flex h-full w-full items-center justify-center p-2">
          <div
            className="h-full w-full rounded-sm"
            style={{
              opacity: 0.16 + level * 0.56,
              backgroundImage: `radial-gradient(${accent} 1px, transparent 1px)`,
              backgroundSize: `${Math.max(2, 5 - level * 2)}px ${Math.max(2, 5 - level * 2)}px`
            }}
          />
        </div>
      );
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
        const cutoffX = 8 + level * 45;
        const highTail = 29 - level * 5;
        const lowTail = 9 + level * 1.5;
        return (
          <svg viewBox="0 0 58 34" className="h-full w-full p-1" style={{ color: accent }}>
            <path d="M3,10 H48 C53,10 55,14 55,25" fill="none" stroke="#2b1712" strokeWidth="2" strokeLinecap="round" opacity="0.68" />
            <path
              d={`M3,${lowTail.toFixed(1)} H${cutoffX.toFixed(1)} C${(cutoffX + 4.5).toFixed(1)},${lowTail.toFixed(1)} ${(cutoffX + 7.5).toFixed(1)},${highTail - 8} 55,${highTail}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              className="transition-all duration-200 drop-shadow-[0_0_3px_rgba(230,106,83,0.85)]"
            />
            <line x1={cutoffX} y1="7" x2={cutoffX} y2="28" stroke="currentColor" strokeWidth="0.8" opacity="0.38" className="transition-all duration-200" />
          </svg>
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
      return (
        <div className="relative flex h-full w-full items-center justify-center">
          <div className="absolute h-px rounded-full transition-all duration-200" style={{ width: `${18 + level * 76}%`, backgroundColor: accent, opacity: 0.7 }} />
          <div className="absolute flex items-center justify-between transition-all duration-200" style={{ width: `${22 + level * 68}%` }}>
            <span className="h-3 w-[3px] rounded-sm" style={{ backgroundColor: accent }} />
            <span className="h-3 w-[3px] rounded-sm" style={{ backgroundColor: accent }} />
          </div>
          <div className="relative h-1.5 w-1.5 rounded-full shadow-[0_0_7px_rgba(230,106,83,0.9)]" style={{ backgroundColor: accent }} />
        </div>
      );
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
                  rx={5 + wet * 17}
                  ry={3 + wet * 12}
                  fill="url(#hudMixWet)"
                  opacity={0.16 + wetPresence * 0.84}
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
      return (
        <div className="relative flex h-full w-full items-center justify-center">
          <div className="absolute h-[3px] w-[62%] overflow-hidden rounded-full bg-[#2b1712]">
            <div
              className="hud-depth-soft h-full rounded-full"
              style={{
                width: `${18 + level * 76}%`,
                backgroundColor: accent,
                boxShadow: '0 0 5px rgba(230,106,83,0.62)'
              }}
            />
          </div>
          <div
            className="absolute rounded-full border"
            style={{
              width: 11 + level * 12,
              height: 11 + level * 12,
              borderColor: accent,
              opacity: 0.18 + level * 0.36
            }}
          />
        </div>
      );
    case 'circle':
      return (
        <div className="flex h-full w-full items-center justify-center">
          <svg viewBox="0 0 58 34" className="h-full w-full p-1" style={{ color: accent }}>
            <path d="M8,17 H50" stroke="#2b1712" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
            <path d={`M8,17 C18,${17 - level * 8} 27,${17 + level * 8} 50,17`} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.78" className="hud-phase-soft" />
            <circle cx={8 + level * 42} cy="17" r="1.8" fill="currentColor" opacity="0.82" />
          </svg>
        </div>
      );
    default:
      return null;
  }
};

const ParameterDataDisplay = ({ parameter, power = true }) => {
  const level = parameter.level ?? 0.5;
  const inWidth = `${Math.round((parameter.signalIn ?? level) * 82 + 10)}%`;
  const outWidth = `${Math.round((parameter.signalOut ?? level) * 82 + 10)}%`;

  return (
    <div
      className={`relative p-[5px] rounded-full border transition-opacity duration-300 ${power ? 'opacity-95' : 'opacity-50'}`}
      style={{
        background: '#1b1917',
        borderColor: 'rgba(70,67,62,0.34)',
        boxShadow: '2px 4px 6px rgba(19,15,13,0.24), inset 0 1px 0 rgba(255,255,245,0.055), inset 0 -1px 2px rgba(0,0,0,0.36)'
      }}
    >
      <div
        className="relative flex h-[58px] w-44 overflow-hidden rounded-full"
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
        <div className="hud-screen-soft relative flex h-full w-[50%] items-center overflow-hidden pl-2">
          <DisplayFeatureAnimation parameter={parameter} />
        </div>
        <div className="hud-screen-soft relative z-10 flex h-full w-[50%] flex-col justify-center px-4">
          <div className="mb-0.5 text-[8px] font-bold uppercase tracking-[0.2em]" style={{ color: 'rgba(230,106,83,0.86)', textShadow: '0 0 4px rgba(230,106,83,0.35)' }}>{parameter.name}</div>
          <div className="mb-1 flex items-baseline leading-none tracking-wider" style={{ color: '#f0ece1', textShadow: '0 0 3px rgba(230,106,83,0.32)' }}>
            <span className={parameter.val.length > 5 ? 'text-[10px]' : 'text-[14px]'} style={{ color: '#f0ece1' }}>{parameter.val}</span>
            {parameter.unit && <span className="ml-1 text-[8px]" style={{ color: 'rgba(230,106,83,0.78)' }}>{parameter.unit}</span>}
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
      <div className="pointer-events-auto absolute left-1/2 top-[calc(100%+7px)] flex -translate-x-1/2 items-center gap-2">
        <SideDisplayButtons onPrev={() => {}} onNext={() => {}} />
        <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#fff8eb] drop-shadow-sm">OPTIONS</span>
      </div>
    </div>
  );
};

const MatteKnob = ({ label, value, onChange, onDoubleClick, min = 0, max = 100, size = 60, color = 'charcoal', labelColorOverride, shadingStyle, labelOffsetY = 0, readoutOffsetY = 0, steadyReadout = false, indicatorActive = true, forceSnappy = false, onDraggingChange, onDisplayFocus, readoutStyleIndex = 0, outerRingEnabled = false }) => {
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
        className={`mt-4 text-[10px] font-black tracking-[0.2em] uppercase relative ${labelColorOverride || (isCoral ? 'text-[#fff] drop-shadow-md' : 'text-[#7a7465]')}`}
        style={{ transform: labelOffsetY ? `translateY(${labelOffsetY}px)` : undefined }}
      >
        {label}
        <div
          className={`absolute top-full left-1/2 mt-1 pointer-events-none ${steadyReadout ? '' : 'transition-opacity duration-300'} ${isDragging ? 'opacity-100' : 'opacity-0'} z-50`}
          style={{
            transform: `translate3d(-50%, ${readoutOffsetY}px, 0)`,
            backfaceVisibility: 'hidden',
            contain: 'layout paint',
            willChange: 'opacity'
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
  <FiberOpticLink {...props} accent="#e66a53" accentLight="#ffb29f" />
);

const FiberOpticCoralGreyRingLink = ({ active, onToggle }) => (
  <button onClick={onToggle} className="relative flex h-10 w-16 items-center justify-center outline-none group" aria-pressed={active} aria-label="Toggle I/O link">
    <span className="relative h-[3px] w-full overflow-hidden rounded-full border-b border-[#333] bg-[#111] shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]">
      <span
        className={`absolute left-1/2 top-0 h-full -translate-x-1/2 bg-[#e66a53] transition-all duration-500 ease-out ${active ? 'w-full opacity-100' : 'w-0 opacity-0'}`}
        style={{ boxShadow: active ? '0 0 10px #e66a53' : undefined }}
      />
    </span>
    <span className={`absolute flex h-3 w-3 items-center justify-center rounded-full border-[1.5px] transition-all duration-300 ${active ? 'border-[#444] bg-[#1a1a1a] shadow-[0_0_10px_#e66a53]' : 'border-[#444] bg-[#1a1a1a] shadow-[0_2px_4px_rgba(0,0,0,0.5)] group-hover:border-[#666]'}`}>
      <span className={`h-[9px] w-[9px] rounded-full transition-all duration-300 ${active ? 'bg-[#e66a53] shadow-[0_0_8px_#e66a53]' : 'bg-transparent'}`} />
    </span>
  </button>
);

const FiberOpticCoralCenterLink = ({ active, onToggle }) => (
  <button onClick={onToggle} className="relative flex h-10 w-16 items-center justify-center outline-none group" aria-pressed={active} aria-label="Toggle I/O link">
    <span className="relative h-[3px] w-full overflow-hidden rounded-full border-b border-[#333] bg-[#111] shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]">
      <span
        className={`absolute left-1/2 top-0 h-full -translate-x-1/2 bg-[#e66a53] transition-all duration-500 ease-out ${active ? 'w-full opacity-100' : 'w-0 opacity-0'}`}
        style={{ boxShadow: active ? '0 0 10px #e66a53' : undefined }}
      />
    </span>
    <span
      className={`absolute h-3 w-3 rounded-full border-[1.5px] transition-all duration-300 ${active ? '' : 'border-[#444] bg-[#1a1a1a] shadow-[0_2px_4px_rgba(0,0,0,0.5)] group-hover:border-[#666]'}`}
      style={active ? { backgroundColor: '#e66a53', borderColor: '#ffb29f', boxShadow: '0 0 10px #e66a53' } : undefined}
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
  const HiddenRange = ({ value, onChange }) => (
    <input
      type="range"
      min="0"
      max="100"
      value={value}
      onChange={event => onChange(Number(event.target.value))}
      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      style={{ WebkitAppearance: 'none' }}
    />
  );

  const DragSurface = ({ onChange, onDragStart, onDragEnd }) => {
    const surfaceRef = useRef(null);
    const updateFromPointer = (clientX, rect) => {
      if (!rect) return;
      const next = Math.round(Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)) * 100);
      onChange(next);
    };
    return (
      <div
        ref={surfaceRef}
        className="absolute inset-0 cursor-pointer touch-none"
        onPointerDown={event => {
          event.preventDefault();
          onDragStart?.();
          const rect = surfaceRef.current?.getBoundingClientRect();
          updateFromPointer(event.clientX, rect);
          const handleMove = (moveEvent) => {
            moveEvent.preventDefault();
            updateFromPointer(moveEvent.clientX, rect);
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
          <HiddenRange value={value} onChange={onChange} />
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
    const [isDragging, setIsDragging] = useState(false);
    const thumbLeft = `calc(8px + ${value} * (100% - 16px) / 100)`;
    return (
    <div className="relative z-10 flex w-[88px] flex-col gap-1">
	      <div className="flex h-2 items-center pl-[8px] pr-0 text-[9px] font-black uppercase leading-[8px] tracking-[0.18em] text-[#aaa39a] drop-shadow-md relative">
          {label === 'Phase ◐' ? <>Phase <span className="ml-[2px] text-[10px] leading-none">◐</span></> : label === 'Depth ◍' ? <>Depth <span className="relative -top-[1px] ml-[2px] text-[12px] leading-none">◍</span></> : label}
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
          <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none transition-opacity duration-300 z-50 ${isDragging ? 'opacity-100' : 'opacity-0'}`}>
            {renderReadout((KNOB_READOUT_STYLES[readoutStyleIndex] || KNOB_READOUT_STYLES[0]).type, formatKnobValue(label, value))}
          </div>
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
          <DragSurface onChange={onChange} onDragStart={() => setIsDragging(true)} onDragEnd={() => setIsDragging(false)} />
        </div>
      </div>
    </div>
  );
  };

  switch (styleIndex) {
    case 0:
      return (
        <div className="absolute bottom-[12%] left-[50%] z-10 -translate-x-1/2 translate-y-[1px]">
          <div className="mb-1.5 translate-y-[-1px] text-center text-[10px] font-bold uppercase tracking-[0.32em] text-[#fff8eb] drop-shadow-sm">LFO INTENSITY</div>
          <div className="relative flex w-[248px] justify-center gap-4 overflow-hidden rounded-full border border-[#181818] bg-[#222222] px-5 py-3 shadow-[0_8px_14px_rgba(0,0,0,0.232),0_2px_4px_rgba(0,0,0,0.192),inset_0_1px_2px_rgba(255,255,255,0.062),inset_0_-1px_2px_rgba(0,0,0,0.242)]">
            <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-80 scale-75">
              <ScrewHead styleIndex={screwStyle} size={12} />
            </div>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-80 scale-75">
              <ScrewHead styleIndex={screwStyle} size={12} />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-[#ffffff08] to-transparent pointer-events-none" />
            <div className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none" style={{ backgroundImage: RUBBER_MATTE_NOISE }} />
            <IlluminatedRubberFader label="Depth ◍" value={depth} onChange={setDepth} active={lfoActive} />
            <IlluminatedRubberFader label="Phase ◐" value={stereoPhase} onChange={setStereoPhase} active={lfoActive} />
          </div>
        </div>
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
  const wave = SHAPES[waveIndex] || SHAPES[0];
  const waveSymbol = SHAPE_BUTTON_SYMBOLS[waveIndex] || SHAPE_BUTTON_SYMBOLS[0];
  const waveSymbolStyle = SHAPE_BUTTON_SYMBOL_STYLES[waveIndex] || SHAPE_BUTTON_SYMBOL_STYLES[0];
  const rate = SYNC_DIVS[rateIndex] || SYNC_DIVS[0];
  const textActiveClass = active ? 'text-[#edcf88]' : 'text-[#666]';
  const rateActiveClass = active && sync ? 'text-[#e8d19e]' : 'text-[#666]';
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
            className={`${isRate ? 'py-2' : 'px-3 py-2.5'} cursor-pointer text-center text-[10px] font-bold transition-colors hover:bg-[#df6f5a] hover:text-[#111] ${selected ? 'text-[#edcf88]' : 'text-[#888]'}`}
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
        <div className="absolute h-[50px] w-[50px] rounded-full bg-[#1a1a1a]" />
        <div className="absolute h-[37px] w-[37px] rounded-full bg-[#1a1a1a] transition-all duration-700 ease-[cubic-bezier(0.68,-0.55,0.26,1.55)]" style={{ transform: active ? `translate(${positions.sync.x}px, ${positions.sync.y}px)` : 'translate(0px, 0px)' }} />
        <div className="absolute h-[37px] w-[37px] rounded-full bg-[#1a1a1a] transition-all duration-700 ease-[cubic-bezier(0.68,-0.55,0.26,1.55)]" style={{ transform: active ? `translate(${positions.wave.x}px, ${positions.wave.y}px)` : 'translate(0px, 0px)' }} />
        <div className="absolute h-[37px] w-[37px] rounded-full bg-[#1a1a1a] transition-all duration-700 ease-[cubic-bezier(0.68,-0.55,0.26,1.55)]" style={{ transform: active ? `translate(${positions.rate.x}px, ${positions.rate.y}px)` : 'translate(0px, 0px)' }} />
      </div>

      <button
        onPointerDown={stopControlDrag}
        onClick={() => setActive(!active)}
        className={`relative z-30 flex h-[46px] w-[46px] items-center justify-center rounded-full border-b border-r border-[#111] border-l border-t border-[#444] bg-[#2c2c2c] outline-none transition-all duration-300 ${active ? 'shadow-[2px_4px_8px_rgba(0,0,0,0.46),inset_0_-5px_10px_rgba(0,0,0,0.8)]' : 'shadow-[3px_5px_9px_rgba(0,0,0,0.42),0_1px_0_#111,inset_1px_2px_2px_rgba(255,255,255,0.1),inset_-2px_-3px_5px_rgba(0,0,0,0.22)]'}`}
      >
        <div className={`flex h-[31px] w-[31px] items-center justify-center rounded-full transition-all duration-500 ${active ? 'bg-[#111] shadow-[inset_0_0_15px_rgba(0,0,0,1)]' : 'bg-[#222] shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]'}`}>
          <span className={`text-[9px] font-bold tracking-widest transition-colors duration-500 ${active ? 'text-[#df6f5a] drop-shadow-[0_0_6px_rgba(223,111,90,1)]' : 'text-[#666]'}`}>LFO</span>
        </div>
      </button>

      <div className={`absolute z-20 transition-all duration-700 ease-[cubic-bezier(0.68,-0.55,0.26,1.55)] ${active ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} style={{ transform: active ? `translate(${positions.sync.x}px, ${positions.sync.y}px)` : 'translate(0px, 0px)' }}>
        <button
          onPointerDown={stopControlDrag}
          onClick={() => setSync(!sync)}
          className={`flex h-[37px] w-[37px] items-center justify-center rounded-full outline-none transition-colors shadow-[2px_3px_6px_rgba(0,0,0,0.26),inset_0_2px_2px_rgba(255,255,255,0.16)] ${sync ? 'bg-[#e86b5d]' : 'bg-[#2a2622]'}`}
        >
          <span className={`text-[9px] font-black tracking-wider ${sync ? 'text-white drop-shadow-sm' : 'text-[#a4998e]'}`}>SYNC</span>
        </button>
      </div>

      <div className={`absolute z-20 transition-all duration-700 ease-[cubic-bezier(0.68,-0.55,0.26,1.55)] ${active ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} style={{ transform: active ? `translate(${positions.wave.x}px, ${positions.wave.y}px)` : 'translate(0px, 0px)' }}>
        <div className="relative">
          <button
            ref={waveButtonRef}
            onPointerDown={stopControlDrag}
            onClick={() => setOpenDropdown(openDropdown === 'wave' ? null : 'wave')}
            className="flex h-[37px] w-[37px] items-center justify-center rounded-full border border-[#333] bg-[#1a1a1a] outline-none shadow-[2px_3px_6px_rgba(0,0,0,0.28),inset_0_1px_2px_rgba(255,255,255,0.05)] transition-colors hover:bg-[#222]"
          >
            <span
              className={`absolute inset-0 flex items-center justify-center leading-none transition-colors duration-300 ${textActiveClass}`}
              style={waveSymbolStyle}
            >
              {waveSymbol}
            </span>
          </button>
        </div>
      </div>

      <div className={`absolute z-20 transition-all duration-700 ease-[cubic-bezier(0.68,-0.55,0.26,1.55)] ${active ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} style={{ transform: active ? `translate(${positions.rate.x}px, ${positions.rate.y}px)` : 'translate(0px, 0px)' }}>
        <div className="relative">
          <button
            ref={rateButtonRef}
            onPointerDown={stopControlDrag}
            onClick={() => setOpenDropdown(openDropdown === 'rate' ? null : 'rate')}
            className="flex h-[37px] w-[37px] items-center justify-center rounded-full border border-[#333] bg-[#1a1a1a] outline-none shadow-[2px_3px_6px_rgba(0,0,0,0.28),inset_0_1px_2px_rgba(255,255,255,0.05)] transition-colors hover:bg-[#222]"
          >
            <span className={`text-[9px] font-bold tracking-wide transition-colors duration-300 ${rateActiveClass}`}>{rate}</span>
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
    name: 'Original Copper Soft',
    shadow: '14px 16px 30px rgba(0,0,0,0.48), inset 2px 2px 6px rgba(255,255,255,0.6), inset -5px -7px 13px rgba(0,0,0,0.5), 0 0 0 1.2px rgba(33,24,11,0.4)',
    edgeInset: 5,
    edgeBorder: '1px solid rgba(255,255,255,0.15)',
    edgeShadow: 'inset 0 2px 4px rgba(255,255,255,0.15), inset 0 -5px 9px rgba(0,0,0,0.25)',
  },
  {
    name: 'Original Graphite Grip',
    background: 'radial-gradient(circle at 31% 29%, rgba(255,255,255,0.13), transparent 28%), radial-gradient(circle at 50% 50%, transparent 0 58%, rgba(255,255,255,0.08) 62%, rgba(0,0,0,0.34) 82%, transparent 88%), radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.8) 100%), conic-gradient(from 180deg at 50% 50%, #0a0a0a 0deg, #252525 45deg, #0a0a0a 90deg, #252525 135deg, #0a0a0a 180deg, #252525 225deg, #0a0a0a 270deg, #252525 315deg, #0a0a0a 360deg)',
    shadow: '6px 12px 20px rgba(0,0,0,0.45), 3px 4px 6px rgba(0,0,0,0.35), inset 1px 1px 3px rgba(255,255,255,0.16), inset -3px -4px 8px rgba(0,0,0,0.86)',
    edgeInset: 8,
    edgeBorder: '1px solid rgba(210,225,225,0.18)',
    edgeShadow: 'inset 0 2px 4px rgba(255,255,255,0.11), inset 0 -5px 10px rgba(0,0,0,0.58), 0 0 0 1px rgba(0,0,0,0.46)',
    edgeTexture: 'repeating-conic-gradient(from 0deg, rgba(220,230,230,0.16) 0deg 0.75deg, rgba(0,0,0,0.26) 0.75deg 2.5deg)',
    edgeMask: 'radial-gradient(circle, transparent 0 67%, #000 69% 100%)',
    edgeOpacity: 0.42,
    edgeBlendMode: 'screen',
    innerInset: 17,
    innerOpacity: 0.2,
    sheenOpacity: 0.22
  },
  {
    name: 'Original Graphite Grip Coral Pointer',
    background: 'radial-gradient(circle at 31% 29%, rgba(255,255,255,0.13), transparent 28%), radial-gradient(circle at 50% 50%, transparent 0 58%, rgba(255,255,255,0.08) 62%, rgba(0,0,0,0.34) 82%, transparent 88%), radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.8) 100%), conic-gradient(from 180deg at 50% 50%, #0a0a0a 0deg, #252525 45deg, #0a0a0a 90deg, #252525 135deg, #0a0a0a 180deg, #252525 225deg, #0a0a0a 270deg, #252525 315deg, #0a0a0a 360deg)',
    shadow: '6px 12px 20px rgba(0,0,0,0.45), 3px 4px 6px rgba(0,0,0,0.35), inset 1px 1px 3px rgba(255,255,255,0.16), inset -3px -4px 8px rgba(0,0,0,0.86)',
    edgeInset: 8,
    edgeBorder: '1px solid rgba(210,225,225,0.18)',
    edgeShadow: 'inset 0 2px 4px rgba(255,255,255,0.11), inset 0 -5px 10px rgba(0,0,0,0.58), 0 0 0 1px rgba(0,0,0,0.46)',
    edgeTexture: 'repeating-conic-gradient(from 0deg, rgba(220,230,230,0.16) 0deg 0.75deg, rgba(0,0,0,0.26) 0.75deg 2.5deg)',
    edgeMask: 'radial-gradient(circle, transparent 0 67%, #000 69% 100%)',
    edgeOpacity: 0.42,
    edgeBlendMode: 'screen',
    innerInset: 17,
    innerOpacity: 0.2,
    sheenOpacity: 0.22,
    pointerStyle: {
      background: 'linear-gradient(to bottom, #e9725d, #b84c39)',
      boxShadow: '0 0 5px rgba(255,107,74,0.18), 0 2px 4px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,196,181,0.36)'
    }
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
    name: 'Original Copper Grip Coral Pointer',
    background: 'radial-gradient(circle at 31% 29%, rgba(255,255,255,0.13), transparent 28%), radial-gradient(circle at 50% 50%, transparent 0 58%, rgba(255,255,255,0.08) 62%, rgba(0,0,0,0.34) 82%, transparent 88%), radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.8) 100%), conic-gradient(from 180deg at 50% 50%, #0a0a0a 0deg, #252525 45deg, #0a0a0a 90deg, #252525 135deg, #0a0a0a 180deg, #252525 225deg, #0a0a0a 270deg, #252525 315deg, #0a0a0a 360deg)',
    shadow: '6px 12px 20px rgba(0,0,0,0.45), 3px 4px 6px rgba(0,0,0,0.35), inset 1px 1px 3px rgba(255,255,255,0.16), inset -3px -4px 8px rgba(0,0,0,0.86)',
    outerBackground: 'radial-gradient(circle at 34% 28%, rgba(255,202,153,0.2), transparent 38%), conic-gradient(from 180deg at 50% 50%, #6b2e18 0deg, #aa6030 45deg, #643018 90deg, #bd7040 135deg, #6b2e18 180deg, #9e552a 225deg, #5c2815 270deg, #b26634 315deg, #6b2e18 360deg)',
    outerMask: 'radial-gradient(circle, transparent 0 67%, #000 69% 100%)',
    edgeInset: 8,
    edgeBorder: '1px solid rgba(167,91,45,0.26)',
    edgeShadow: 'inset 0 2px 4px rgba(255,190,138,0.1), inset 0 -4px 8px rgba(47,21,12,0.46), 0 0 0 1px rgba(0,0,0,0.44)',
    sheenOpacity: 0.12,
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
    name: 'Original Graphite Grip Yellow Pointer',
    background: 'radial-gradient(circle at 31% 29%, rgba(255,255,255,0.13), transparent 28%), radial-gradient(circle at 50% 50%, transparent 0 58%, rgba(255,255,255,0.08) 62%, rgba(0,0,0,0.34) 82%, transparent 88%), radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.8) 100%), conic-gradient(from 180deg at 50% 50%, #0a0a0a 0deg, #252525 45deg, #0a0a0a 90deg, #252525 135deg, #0a0a0a 180deg, #252525 225deg, #0a0a0a 270deg, #252525 315deg, #0a0a0a 360deg)',
    shadow: '6px 12px 20px rgba(0,0,0,0.45), 3px 4px 6px rgba(0,0,0,0.35), inset 1px 1px 3px rgba(255,255,255,0.16), inset -3px -4px 8px rgba(0,0,0,0.86)',
    edgeInset: 8,
    edgeBorder: '1px solid rgba(210,225,225,0.18)',
    edgeShadow: 'inset 0 2px 4px rgba(255,255,255,0.11), inset 0 -5px 10px rgba(0,0,0,0.58), 0 0 0 1px rgba(0,0,0,0.46)',
    edgeTexture: 'repeating-conic-gradient(from 0deg, rgba(220,230,230,0.16) 0deg 0.75deg, rgba(0,0,0,0.26) 0.75deg 2.5deg)',
    edgeMask: 'radial-gradient(circle, transparent 0 67%, #000 69% 100%)',
    edgeOpacity: 0.42,
    edgeBlendMode: 'screen',
    innerInset: 17,
    innerOpacity: 0.2,
    sheenOpacity: 0.22,
    pointerStyle: {
      background: 'linear-gradient(to bottom, #f3dcae, #c79f59)',
      boxShadow: '0 0 8px rgba(243,220,174,0.34), 0 2px 4px rgba(0,0,0,0.48), inset 0 1px 1px rgba(255,246,224,0.78)'
    }
  },
  {
    name: 'Original Graphite Grip Thick',
    background: 'radial-gradient(circle at 31% 29%, rgba(255,255,255,0.13), transparent 28%), radial-gradient(circle at 50% 50%, transparent 0 58%, rgba(255,255,255,0.08) 62%, rgba(0,0,0,0.34) 82%, transparent 88%), radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.8) 100%), conic-gradient(from 180deg at 50% 50%, #0a0a0a 0deg, #252525 45deg, #0a0a0a 90deg, #252525 135deg, #0a0a0a 180deg, #252525 225deg, #0a0a0a 270deg, #252525 315deg, #0a0a0a 360deg)',
    shadow: '6px 12px 20px rgba(0,0,0,0.45), 3px 4px 6px rgba(0,0,0,0.35), inset 1px 1px 3px rgba(255,255,255,0.16), inset -3px -4px 8px rgba(0,0,0,0.86)',
    edgeInset: 6,
    edgeBorder: '1px solid rgba(210,225,225,0.18)',
    edgeShadow: 'inset 0 2px 4px rgba(255,255,255,0.11), inset 0 -5px 10px rgba(0,0,0,0.58), 0 0 0 1px rgba(0,0,0,0.46)',
    edgeTexture: 'repeating-conic-gradient(from 0deg, rgba(220,230,230,0.16) 0deg 0.75deg, rgba(0,0,0,0.26) 0.75deg 2.5deg)',
    edgeMask: 'radial-gradient(circle, transparent 0 62%, #000 64% 100%)',
    edgeOpacity: 0.42,
    edgeBlendMode: 'screen',
    innerInset: 17,
    innerOpacity: 0.2,
    sheenOpacity: 0.22
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
    name: 'Soft Copper Dome',
    background: 'radial-gradient(circle at 32% 30%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.12) 19%, transparent 35%), radial-gradient(circle at 50% 50%, transparent 0 66%, rgba(180,163,119,0.16) 74%, rgba(70,56,36,0.42) 89%, rgba(18,13,7,0.58) 100%), conic-gradient(from 180deg at 50% 50%, #91764a 0deg, #c5b07b 45deg, #91764a 90deg, #cbb783 135deg, #8d7247 180deg, #c2ac75 225deg, #8c7045 270deg, #c8b27e 315deg, #91764a 360deg)',
    shadow: '13px 15px 28px rgba(0,0,0,0.46), inset 3px 3px 7px rgba(255,255,255,0.58), inset -5px -7px 13px rgba(0,0,0,0.48), 0 0 0 1px rgba(33,24,11,0.44)',
    edgeInset: 5,
    edgeBorder: '1px solid rgba(201,185,139,0.3)',
    edgeShadow: 'inset 0 3px 4px rgba(255,255,255,0.22), inset 0 -5px 8px rgba(64,43,17,0.34), 0 1px 2px rgba(0,0,0,0.45)',
    sheenOpacity: 0.42
  },
  {
    name: 'Brushed Brass Bevel',
    background: 'radial-gradient(circle at 33% 29%, rgba(255,255,255,0.52), transparent 31%), radial-gradient(circle at 50% 50%, transparent 0 62%, rgba(235,218,166,0.22) 72%, rgba(58,42,20,0.5) 94%), repeating-conic-gradient(from 180deg at 50% 50%, #a18345 0deg 8deg, #d8c07d 10deg 18deg, #96763a 20deg 29deg)',
    shadow: '13px 15px 28px rgba(0,0,0,0.48), inset 3px 3px 8px rgba(255,255,255,0.58), inset -5px -7px 12px rgba(0,0,0,0.5), 0 0 0 1px rgba(31,23,12,0.48)',
    edgeInset: 4,
    edgeBorder: '1px solid rgba(236,214,156,0.34)',
    edgeShadow: 'inset 0 2px 5px rgba(255,255,255,0.22), inset 0 -6px 9px rgba(50,35,16,0.38), 0 1px 2px rgba(0,0,0,0.5)',
    sheenOpacity: 0.38
  },
  {
    name: 'Classic Soft Lip',
    background: 'radial-gradient(circle at 34% 32%, rgba(255,255,255,0.52), rgba(255,255,255,0.1) 20%, transparent 37%), radial-gradient(circle at 50% 50%, transparent 0 58%, rgba(188,169,121,0.15) 70%, rgba(75,58,34,0.5) 93%), conic-gradient(from 180deg at 50% 50%, #8d7146, #c1ab77, #8b6f44, #cab684, #8d7146, #bfa772, #876b41, #c5af7c, #8d7146)',
    shadow: '14px 16px 30px rgba(0,0,0,0.48), inset 2px 2px 6px rgba(255,255,255,0.62), inset -5px -6px 12px rgba(0,0,0,0.5)',
    edgeInset: 7,
    edgeBorder: '1px solid rgba(203,188,143,0.24)',
    edgeShadow: 'inset 0 2px 3px rgba(255,255,255,0.2), inset 0 -4px 8px rgba(43,31,14,0.32)',
    sheenOpacity: 0.34
  },
  {
    name: 'Smoked Champagne',
    background: 'radial-gradient(circle at 34% 30%, rgba(255,255,255,0.48), transparent 32%), radial-gradient(circle at 50% 50%, transparent 0 64%, rgba(224,210,174,0.16) 75%, rgba(35,31,25,0.42) 96%), conic-gradient(from 180deg at 50% 50%, #74684d, #c2b58a, #776b50, #d1c195, #74684d, #b9aa7d, #6e6249, #c8ba8e, #74684d)',
    shadow: '13px 15px 27px rgba(0,0,0,0.5), inset 3px 3px 7px rgba(255,255,255,0.42), inset -5px -7px 12px rgba(0,0,0,0.45), 0 0 0 1px rgba(20,18,14,0.5)',
    edgeInset: 5,
    edgeBorder: '1px solid rgba(225,214,180,0.26)',
    edgeShadow: 'inset 0 3px 5px rgba(255,255,255,0.16), inset 0 -5px 9px rgba(27,23,18,0.34)',
    sheenOpacity: 0.3
  },
  {
    name: 'Smoked Champagne Bold',
    background: 'radial-gradient(circle at 34% 30%, rgba(255,255,255,0.48), transparent 32%), radial-gradient(circle at 50% 50%, transparent 0 64%, rgba(224,210,174,0.16) 75%, rgba(35,31,25,0.42) 96%), conic-gradient(from 180deg at 50% 50%, #74684d, #c2b58a, #776b50, #d1c195, #74684d, #b9aa7d, #6e6249, #c8ba8e, #74684d)',
    shadow: '13px 15px 27px rgba(0,0,0,0.5), inset 3px 3px 7px rgba(255,255,255,0.42), inset -5px -7px 12px rgba(0,0,0,0.45), 0 0 0 1px rgba(20,18,14,0.5)',
    edgeInset: 8,
    edgeBorder: '1.2px solid rgba(225,214,180,0.34)',
    edgeShadow: 'inset 0 4px 6px rgba(255,255,255,0.18), inset 0 -6px 10px rgba(27,23,18,0.38)',
    sheenOpacity: 0.3
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
    name: 'Modern Satin Brass',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.14), transparent 38%, rgba(0,0,0,0.2)), radial-gradient(circle at 50% 50%, transparent 0 65%, rgba(184,166,118,0.14) 76%, rgba(35,28,17,0.5) 98%), conic-gradient(from 198deg at 50% 50%, #876f49, #bca775, #92784f, #c5b17e, #876f49, #b5a06f, #8a7149, #c0aa78, #876f49)',
    shadow: '12px 14px 26px rgba(0,0,0,0.48), inset 2px 2px 5px rgba(255,255,255,0.5), inset -6px -7px 12px rgba(0,0,0,0.48)',
    edgeInset: 6,
    edgeBorder: '1px solid rgba(197,180,134,0.24)',
    edgeShadow: 'inset 0 1px 4px rgba(255,255,255,0.18), inset 0 -5px 8px rgba(48,35,16,0.33)',
    sheenOpacity: 0.26
  },
  {
    name: 'Dark Aged Brass',
    background: 'radial-gradient(circle at 32% 31%, rgba(255,255,255,0.34), transparent 31%), radial-gradient(circle at 50% 50%, transparent 0 63%, rgba(128,110,76,0.18) 75%, rgba(18,13,8,0.6) 98%), conic-gradient(from 180deg at 50% 50%, #675235, #93805c, #59472c, #a08c67, #675235, #897650, #534126, #97845f, #675235)',
    shadow: '14px 16px 30px rgba(0,0,0,0.54), inset 3px 3px 6px rgba(255,255,255,0.34), inset -5px -7px 13px rgba(0,0,0,0.58), 0 0 0 1px rgba(16,11,6,0.55)',
    edgeInset: 5,
    edgeBorder: '1px solid rgba(151,130,94,0.28)',
    edgeShadow: 'inset 0 3px 5px rgba(255,255,255,0.12), inset 0 -6px 9px rgba(18,12,5,0.42)',
    sheenOpacity: 0.28
  },
  {
    name: 'Ivory Brass Cap',
    background: 'radial-gradient(circle at 34% 30%, rgba(255,255,255,0.58), transparent 33%), radial-gradient(circle at 50% 50%, transparent 0 61%, rgba(225,202,139,0.18) 74%, rgba(55,39,18,0.45) 98%), conic-gradient(from 180deg at 50% 50%, #a48a55, #d8c796, #a98f58, #e0cf9d, #a48a55, #d4c18f, #9f844e, #ddcb9a, #a48a55)',
    shadow: '13px 15px 28px rgba(0,0,0,0.46), inset 3px 3px 8px rgba(255,255,255,0.52), inset -5px -6px 12px rgba(0,0,0,0.42)',
    edgeInset: 4,
    edgeBorder: '1px solid rgba(240,226,186,0.36)',
    edgeShadow: 'inset 0 2px 5px rgba(255,255,255,0.2), inset 0 -5px 8px rgba(53,38,18,0.3)',
    sheenOpacity: 0.32
  },
  {
    name: 'Copper Pewter Blend',
    background: 'radial-gradient(circle at 33% 30%, rgba(255,255,255,0.46), transparent 31%), radial-gradient(circle at 50% 50%, transparent 0 63%, rgba(201,174,126,0.18) 75%, rgba(45,36,29,0.48) 98%), conic-gradient(from 180deg at 50% 50%, #806d55, #c0aa7e, #887259, #cab486, #806d55, #b8a174, #76634d, #c4ae83, #806d55)',
    shadow: '13px 15px 27px rgba(0,0,0,0.5), inset 3px 3px 7px rgba(255,255,255,0.38), inset -5px -7px 13px rgba(0,0,0,0.5)',
    edgeInset: 6,
    edgeBorder: '1px solid rgba(210,192,155,0.28)',
    edgeShadow: 'inset 0 3px 5px rgba(255,255,255,0.14), inset 0 -5px 9px rgba(37,29,22,0.34)',
    sheenOpacity: 0.28
  },
  {
    name: 'Copper Pewter Bold',
    background: 'radial-gradient(circle at 33% 30%, rgba(255,255,255,0.46), transparent 31%), radial-gradient(circle at 50% 50%, transparent 0 63%, rgba(201,174,126,0.18) 75%, rgba(45,36,29,0.48) 98%), conic-gradient(from 180deg at 50% 50%, #806d55, #c0aa7e, #887259, #cab486, #806d55, #b8a174, #76634d, #c4ae83, #806d55)',
    shadow: '13px 15px 27px rgba(0,0,0,0.5), inset 3px 3px 7px rgba(255,255,255,0.38), inset -5px -7px 13px rgba(0,0,0,0.5)',
    edgeInset: 7,
    edgeBorder: '1.1px solid rgba(210,192,155,0.32)',
    edgeShadow: 'inset 0 3px 5px rgba(255,255,255,0.14), inset 0 -5px 9px rgba(37,29,22,0.34)',
    sheenOpacity: 0.28
  },
  {
    name: 'Inset Soft Bezel',
    background: 'radial-gradient(circle at 34% 31%, rgba(255,255,255,0.44), transparent 31%), radial-gradient(circle at 50% 50%, transparent 0 55%, rgba(50,40,23,0.16) 58%, transparent 63%, rgba(185,168,120,0.14) 74%, rgba(47,37,21,0.52) 98%), conic-gradient(from 180deg at 50% 50%, #8e7247, #bfa977, #907449, #c8b582, #8e7247, #baa371, #896d43, #c3ad7a, #8e7247)',
    shadow: '14px 16px 30px rgba(0,0,0,0.5), inset 3px 3px 7px rgba(255,255,255,0.48), inset -5px -7px 13px rgba(0,0,0,0.5)',
    edgeInset: 4,
    edgeBorder: '1px solid rgba(199,181,134,0.24)',
    edgeShadow: 'inset 0 2px 5px rgba(255,255,255,0.16), inset 0 -5px 10px rgba(44,31,13,0.36)',
    innerInset: 15,
    innerOpacity: 0.26,
    sheenOpacity: 0.3
  },
  {
    name: 'Clean Studio Brass',
    background: 'radial-gradient(circle at 35% 31%, rgba(255,255,255,0.38), transparent 32%), radial-gradient(circle at 50% 50%, transparent 0 66%, rgba(183,168,126,0.12) 76%, rgba(39,31,18,0.48) 98%), conic-gradient(from 180deg at 50% 50%, #8f744b, #baa575, #91764d, #c3af7e, #8f744b, #b39d6d, #8b7047, #bea978, #8f744b)',
    shadow: '12px 14px 26px rgba(0,0,0,0.46), inset 2px 2px 5px rgba(255,255,255,0.44), inset -5px -6px 11px rgba(0,0,0,0.46), 0 0 0 1px rgba(27,20,10,0.42)',
    edgeInset: 8,
    edgeBorder: '1px solid rgba(194,178,136,0.18)',
    edgeShadow: 'inset 0 2px 4px rgba(255,255,255,0.12), inset 0 -4px 7px rgba(44,32,15,0.26)',
    sheenOpacity: 0.24
  },
  {
    name: 'Vintage Nickel Brass',
    background: 'radial-gradient(circle at 34% 30%, rgba(255,255,255,0.5), transparent 32%), radial-gradient(circle at 50% 50%, transparent 0 64%, rgba(214,202,169,0.16) 76%, rgba(34,32,27,0.46) 98%), conic-gradient(from 180deg at 50% 50%, #77715e, #bfb48e, #7b735f, #c9bd95, #77715e, #b5aa83, #706955, #c2b790, #77715e)',
    shadow: '13px 15px 28px rgba(0,0,0,0.48), inset 3px 3px 7px rgba(255,255,255,0.4), inset -5px -7px 12px rgba(0,0,0,0.44)',
    edgeInset: 5,
    edgeBorder: '1px solid rgba(221,213,186,0.24)',
    edgeShadow: 'inset 0 3px 5px rgba(255,255,255,0.14), inset 0 -5px 8px rgba(31,29,24,0.3)',
    sheenOpacity: 0.26
  },
  {
    name: 'Vintage Nickel Brass Bold',
    background: 'radial-gradient(circle at 34% 30%, rgba(255,255,255,0.5), transparent 32%), radial-gradient(circle at 50% 50%, transparent 0 64%, rgba(214,202,169,0.16) 75%, rgba(34,32,27,0.46) 98%), conic-gradient(from 180deg at 50% 50%, #77715e, #bfb48e, #7b735f, #c9bd95, #77715e, #b5aa83, #706955, #c2b790, #77715e)',
    shadow: '13px 15px 28px rgba(0,0,0,0.48), inset 3px 3px 7px rgba(255,255,255,0.4), inset -5px -7px 12px rgba(0,0,0,0.44)',
    edgeInset: 7,
    edgeBorder: '1.1px solid rgba(221,213,186,0.32)',
    edgeShadow: 'inset 0 4px 6px rgba(255,255,255,0.16), inset 0 -6px 10px rgba(31,29,24,0.36)',
    sheenOpacity: 0.26
  },
  {
    name: 'Vintage Nickel Brass Bold Heavy',
    background: 'radial-gradient(circle at 34% 30%, rgba(255,255,255,0.42), transparent 32%), radial-gradient(circle at 50% 50%, transparent 0 64%, rgba(198,187,156,0.13) 75%, rgba(34,32,27,0.5) 98%), conic-gradient(from 180deg at 50% 50%, #706a59, #b4aa86, #746d5b, #bdb28d, #706a59, #aca17e, #6a6352, #b7ad88, #706a59)',
    shadow: '13px 15px 28px rgba(0,0,0,0.48), inset 3px 3px 7px rgba(255,255,255,0.34), inset -5px -7px 12px rgba(0,0,0,0.47)',
    edgeInset: 8,
    edgeBorder: '1.2px solid rgba(211,203,178,0.3)',
    edgeShadow: 'inset 0 4px 6px rgba(255,255,255,0.13), inset 0 -6px 10px rgba(31,29,24,0.4)',
    sheenOpacity: 0.21
  }
];

const normalizeMiddleKnobStyle = (value) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return 0;
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
  { name: 'Inner Minimal Dots', type: 'dots', count: 11, radius: 1, color: '#d3ba8c', position: 'inside', glow: true },
  { name: 'Inner Fine Needles', type: 'lines', count: 31, length: 3, width: 0.6, color: '#bca06f', position: 'inside' },
  { name: 'Inner Brass Studs', type: 'studs', count: 11, radius: 1.5, color: '#d3ba8c', position: 'inside', glow: true },
  { name: 'Inner Diamond Studs', type: 'diamonds', count: 11, radius: 1.5, color: '#d3ba8c', position: 'inside', glow: true },
  { name: 'Inner Hairline Dashes', type: 'dashes', count: 31, length: 3, width: 0.5, color: '#d3ba8c', position: 'inside', glow: true },
  { name: 'Inner Double Orbits', type: 'double-dots', count: 11, radius: 0.8, color: '#d3ba8c', position: 'inside', glow: true },
  { name: 'Inner Golden Wedges', type: 'wedges', count: 11, radius: 2, color: '#d3ba8c', position: 'inside', glow: true },
  { name: 'Inner Sub-Dial Arc', type: 'sub-dial-arc', count: 11, radius: 1, color: '#d3ba8c', position: 'inside', glow: true },
  
  // New "Inner" Drifty / Creative Styles
  { name: 'Drifter Flutter Arcs', type: 'flutter-arcs', count: 21, width: 1, color: '#d3ba8c', position: 'inside', glow: true },
  { name: 'Wabi-Sabi Flow', type: 'wabi-sabi-flow', count: 15, radius: 1.5, color: '#d3ba8c', position: 'inside', glow: true },
  { name: 'Unstable Clusters', type: 'unstable-clusters', count: 11, radius: 0.6, color: '#d3ba8c', position: 'inside', glow: true },
  { name: 'Cinematic Embers', type: 'cinematic-embers', count: 21, radius: 1.2, color: '#d3ba8c', position: 'inside', glow: true },
  { name: 'Magnetic Tape Bleed', type: 'magnetic-bleed', count: 11, width: 2, color: '#d3ba8c', position: 'inside', glow: true },

  // Inner Scales (Permanent)
  { name: 'Inner Graduated Scale', type: 'graduated', count: 25, color: '#d3ba8c', position: 'inside', glow: true },
  
  // Faceplate Styles
  { name: 'Faceplate Vintage Gauge', type: 'graduated', count: 25, color: '#7a5d49', position: 'outside' }
];

const BotanicalCenterDial = ({ drift, setDrift, spread, setSpread, rate, mode, shadowStyle, surfaceStyle, grooveStyle, markStyleIndex = 0, numberStyleIndex = 0, circlesEnabled = true, numbersEnabled = true, guideRings = CENTER_DIAL_GUIDE_RING_DEFAULTS, middleKnobStyle = 0, spreadPointerStyle = 0, animationStyle = 0, outerRingScaleStyle = 0, knobFlutterFilledColors = DEFAULT_KNOB_FLUTTER_FILLED_COLORS, onDoubleClickDrift, onDoubleClickSpread, readoutStyleIndex = 0 }) => {
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
  const indicatorPosition = spreadIndicator.bottom ? { bottom: spreadIndicator.bottom } : { top: spreadIndicator.top || '8%' };
  const guideRingSettings = {
    large: { ...CENTER_DIAL_GUIDE_RING_DEFAULTS.large, ...(guideRings?.large || {}) },
    small: { ...CENTER_DIAL_GUIDE_RING_DEFAULTS.small, ...(guideRings?.small || {}) }
  };
  const activeSpreadPointerStyle = normalizeSpreadPointerStyle(spreadPointerStyle);
  const activeMiddleKnobStyle = MIDDLE_KNOB_STYLES[normalizeMiddleKnobStyle(middleKnobStyle)] || MIDDLE_KNOB_STYLES[0];
  const insetPointerTop = surface.outerRim ? rimInnerInset + 4 : Math.round(outerSize * 0.085);
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
            ...indicatorPosition,
            width: spreadIndicator.width,
            height: spreadIndicator.height,
            background: spreadIndicator.background,
            boxShadow: spreadIndicator.boxShadow,
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
              height: 24,
              background: 'linear-gradient(90deg, #bd4536 0%, #f06b55 48%, #8d2d25 100%)',
              border: '1px solid rgba(255,170,150,0.24)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.58), inset 0 1px 1px rgba(255,210,190,0.28), 0 0 7px rgba(230,106,83,0.42)'
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

  const originalMiddleKnobBackground = 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.1) 20%, rgba(0,0,0,0.4) 80%, rgba(0,0,0,0.8) 100%), conic-gradient(from 180deg at 50% 50%, #a88842 0deg, #edd39a 45deg, #a88842 90deg, #edd39a 135deg, #a88842 180deg, #edd39a 225deg, #a88842 270deg, #edd39a 315deg, #a88842 360deg)';
  const originalMiddleKnobShadow = '15px 15px 30px rgba(0,0,0,0.5), inset 2px 2px 5px rgba(255,255,255,0.9), inset -4px -4px 8px rgba(0,0,0,0.6)';
  const middleKnobBackground = activeMiddleKnobStyle.useOriginalBackground ? originalMiddleKnobBackground : activeMiddleKnobStyle.background || originalMiddleKnobBackground;
  const middleKnobShadow = activeMiddleKnobStyle.shadow || originalMiddleKnobShadow;
  const middleKnobIsOriginal = !activeMiddleKnobStyle.background;

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
          style={style.glow ? { paintOrder: 'stroke', stroke: 'rgba(38,22,12,0.26)', strokeWidth: 0.65 } : undefined}
        >
          {marks}
        </g>
      </svg>
    );
  };

  return (
    <div className="relative flex justify-center items-center z-20" style={{ width: 380, height: 380 }}>
      <div className="absolute rounded-full cursor-ns-resize flex justify-center items-center group z-10 overflow-hidden" style={{ width: outerSize, height: outerSize, backgroundColor: surface.outerRim ? (surface.rimBackgroundColor || rimFillColor) : surface.backgroundColor || '#1f1e1d', backgroundImage: surface.outerRim ? (surface.outerRimTexture ? surface.rimBackgroundImage : `radial-gradient(circle, transparent 0 calc(50% - ${rimInnerInset}px), ${rimFillColor} calc(50% - ${rimInnerInset}px) 100%)`) : surface.backgroundImage || CENTER_DIAL_SURFACES[0].backgroundImage, backgroundSize: surface.outerRimTexture ? surface.rimBackgroundSize : undefined, backgroundPosition: surface.outerRimTexture ? 'center' : undefined, backgroundBlendMode: surface.outerRimTexture ? 'normal, normal' : surface.backgroundBlendMode, boxShadow: guardedOuterShadow }}
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
        <WobblyAura drift={drift} spread={spread} active={auraActive} rate={rate} mode={mode} animationStyle={animationStyle} knobFlutterFilledColors={knobFlutterFilledColors} />
        <div className="absolute rounded-full cursor-ns-resize flex justify-center items-center hover:brightness-105 transition-all z-20" style={{ width: 140, height: 140, background: middleKnobBackground, boxShadow: middleKnobShadow }}
          onPointerDown={handleDriftDown} onPointerMove={handleDriftMove} onPointerUp={handleDriftUp} onPointerCancel={handleDriftUp} onDoubleClick={onDoubleClickDrift}>
          {middleKnobIsOriginal && (
            <div className="absolute inset-2 rounded-full pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(255,255,255,0.2) 100%)', boxShadow: 'inset 2px 2px 6px rgba(0,0,0,0.8), 0 1px 1px rgba(255,255,255,0.5)' }} />
          )}
          {!middleKnobIsOriginal && (
            <>
              {activeMiddleKnobStyle.originalCenterOverlay && (
                <div
                  className="absolute inset-2 rounded-full pointer-events-none"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(255,255,255,0.2) 100%)',
                    boxShadow: 'inset 2px 2px 6px rgba(0,0,0,0.8), 0 1px 1px rgba(255,255,255,0.5)',
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
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
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
                className="absolute inset-[13px] rounded-full pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(0,0,0,0.13))',
                  opacity: activeMiddleKnobStyle.sheenOpacity ?? 0.34
                }}
              />
            </>
          )}
          <KnobFlutterSpillLight
            drift={drift}
            rate={rate}
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
      <div className={`absolute bottom-[60px] left-1/2 -translate-x-1/2 pointer-events-none transition-opacity duration-300 z-50 ${isDraggingSpread ? 'opacity-100' : 'opacity-0'}`}>
        {renderReadout((KNOB_READOUT_STYLES[readoutStyleIndex] || KNOB_READOUT_STYLES[0]).type, formatKnobValue('SPREAD', spread))}
      </div>

      {/* Drift Readout */}
      <div className={`absolute top-[65%] left-1/2 -translate-x-1/2 -translate-y-[7px] pointer-events-none transition-opacity duration-300 z-50 ${isDraggingDrift ? 'opacity-100' : 'opacity-0'}`}>
        {renderReadout((KNOB_READOUT_STYLES[readoutStyleIndex] || KNOB_READOUT_STYLES[0]).type, formatKnobValue('DRIFT', drift))}
      </div>
    </div>
  );
};

// --- Preset Browser ---
const PresetBrowser = ({ presets, currentPreset, onPrev, onNext, onLoad, onSave }) => {
  const [showSave, setShowSave] = useState(false);
  const [saveName, setSaveName] = useState('');
  const handleSave = () => { if (saveName.trim()) { onSave(saveName.trim()); setShowSave(false); setSaveName(''); } };
  return (
    <div className="absolute -top-[52px] left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
      <button onClick={onPrev} className="w-7 h-7 rounded-full bg-[#2d2c2b] text-[#edd39a] text-sm font-bold flex items-center justify-center hover:bg-[#3d3c3b] transition-colors shadow-lg border border-white/5">‹</button>
      <div className="relative">
        <select value={currentPreset} onChange={e => onLoad(Number(e.target.value))} className="bg-[#2d2c2b]/90 backdrop-blur-md text-[#edd39a] text-[10px] font-bold tracking-wider rounded-lg px-4 py-2 border border-white/10 outline-none cursor-pointer shadow-lg min-w-[180px] text-center appearance-none">
          <option value={-1} className="bg-[#2d2c2b]">— Init —</option>
          {presets.map((name, i) => <option key={i} value={i} className="bg-[#2d2c2b]">{name}</option>)}
        </select>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[#edd39a] text-[9px] pointer-events-none">▼</div>
      </div>
      <button onClick={onNext} className="w-7 h-7 rounded-full bg-[#2d2c2b] text-[#edd39a] text-sm font-bold flex items-center justify-center hover:bg-[#3d3c3b] transition-colors shadow-lg border border-white/5">›</button>
      <button onClick={() => { setSaveName('My Preset'); setShowSave(true); }} className="ml-1 px-3 py-1.5 rounded-lg bg-[#e66a53] text-white text-[9px] font-bold tracking-wider uppercase hover:brightness-110 transition-all shadow-lg">Save</button>
      {showSave && (
        <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-[#2d2c2b]/95 backdrop-blur-xl rounded-xl p-4 shadow-2xl border border-white/10 z-50 min-w-[220px]">
          <div className="text-[10px] text-[#edd39a] font-bold tracking-wider mb-2 uppercase">Save Preset</div>
          <input value={saveName} onChange={e => setSaveName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSave()} className="w-full bg-black/30 text-[#edd39a] text-[11px] rounded-lg px-3 py-2 border border-white/10 outline-none mb-2" placeholder="Preset name..." autoFocus />
          <div className="flex gap-2">
            <button onClick={handleSave} className="flex-1 py-1.5 rounded-lg bg-[#e66a53] text-white text-[9px] font-bold tracking-wider uppercase">Save</button>
            <button onClick={() => setShowSave(false)} className="flex-1 py-1.5 rounded-lg bg-white/10 text-[#7a7465] text-[9px] font-bold tracking-wider uppercase">Cancel</button>
          </div>
        </div>
      )}
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
  { name: 'Warm Charcoal', color: '#2a2826' },
  { name: 'Deep Espresso', color: '#2d2621' },
  { name: 'Dark Slate', color: '#212326' },
  { name: 'Midnight Ash', color: '#1c1c1a' }
];

const SaturationSelectorEngine = ({ mode, setMode, styleIndex, power }) => {
  const modes = ['Tape', 'Tube'];
  
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
                <span className={`text-[7px] font-black tracking-widest ${mode === 1 && power ? 'text-[#e66a53] shadow-[0_0_8px_#e66a53]' : 'text-[#333]'}`}>TUBE</span>
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
      className="absolute left-[calc(50%+3px)] top-[-28px] -translate-x-1/2 text-[11px] font-black uppercase tracking-[0.14em]"
      style={{
        color: 'rgba(58, 53, 45, 0.58)',
        textShadow: '0 1px 0 rgba(255,255,255,0.24), 0 -1px 0 rgba(0,0,0,0.12)'
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
                    style={power && mode === m ? { backgroundColor: ledColor, boxShadow: `0 0 8px ${ledColor}` } : {}}
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
                    style={power && mode === m ? { backgroundColor: ledColor, boxShadow: `0 0 8px ${ledColor}` } : {}}
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
        <div className="absolute top-[48%] left-[8%] translate-x-[10px] -translate-y-1/2 flex flex-col gap-5 px-[13px] py-4 rounded-[2.4rem] z-10" style={{ 
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
                    style={power && mode === m ? { backgroundColor: ledColor, boxShadow: `0 0 8px ${ledColor}` } : {}}
                  />
                </button>
                <span className="text-[9px] font-bold tracking-[0.25em] uppercase drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]" style={{ color: '#d3ba8c' }}>{m}</span>
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
                    style={power && mode === m ? { backgroundColor: ledColor, boxShadow: `0 0 8px ${ledColor}` } : {}}
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
  { name: 'Naked', style: {} },

  { name: 'Oiled Walnut (Premium)', inset: '-inset-5', radius: '3rem',
    style: { 
      backgroundImage: 'url("/textures/walnut.png")', 
      backgroundSize: '200px', 
      boxShadow: 'inset 2px 2px 6px rgba(255,255,255,0.1), inset -2px -2px 8px rgba(0,0,0,0.8), 10px 15px 35px rgba(0,0,0,0.6)',
      border: '1px solid #111'
    } },

  { name: 'Oiled Walnut - Soft Gasket', inset: '-inset-5', radius: '3rem',
    style: {
      backgroundImage: 'url("/textures/walnut.png")',
      backgroundSize: '200px',
      boxShadow: 'inset 0 6px 12px rgba(255,255,255,0.18), inset 0 -8px 20px rgba(0,0,0,0.38), 10px 15px 35px rgba(0,0,0,0.6)',
      border: '1px solid #111'
    },
    panelStyle: {
      boxShadow: '0 40px 80px rgba(0,0,0,0.4), 0 20px 30px rgba(0,0,0,0.2), 0 0 0 1.5px #6b4524'
    }
  },

  { name: 'Oiled Walnut - Thin Brown Seat', inset: '-inset-5', radius: '3rem',
    style: {
      backgroundImage: 'url("/textures/walnut.png")',
      backgroundSize: '200px',
      boxShadow: 'inset 0 5px 10px rgba(255,255,255,0.14), inset 0 -7px 18px rgba(0,0,0,0.42), 10px 15px 35px rgba(0,0,0,0.6)',
      border: '1px solid #111'
    },
    panelStyle: {
      boxShadow: '0 40px 80px rgba(0,0,0,0.4), 0 20px 30px rgba(0,0,0,0.2), 0 0 0 1px #4a2d17'
    }
  },

  { name: 'Oiled Walnut - Dark Console Seat', inset: '-inset-5', radius: '3rem',
    style: {
      backgroundImage: 'url("/textures/walnut.png")',
      backgroundSize: '200px',
      boxShadow: 'inset 0 5px 11px rgba(255,255,255,0.12), inset 0 -9px 22px rgba(0,0,0,0.48), 10px 15px 35px rgba(0,0,0,0.6)',
      border: '1px solid #0b0704'
    },
    panelStyle: {
      boxShadow: '0 40px 80px rgba(0,0,0,0.4), 0 20px 30px rgba(0,0,0,0.2), 0 0 0 1.5px #241309'
    }
  },

  { name: 'Oiled Walnut - Amber Join Line', inset: '-inset-5', radius: '3rem',
    style: {
      backgroundImage: 'url("/textures/walnut.png")',
      backgroundSize: '200px',
      boxShadow: 'inset 0 6px 12px rgba(255,255,255,0.2), inset 0 -8px 20px rgba(0,0,0,0.36), 10px 15px 35px rgba(0,0,0,0.6)',
      border: '1px solid #111'
    },
    panelStyle: {
      boxShadow: '0 40px 80px rgba(0,0,0,0.4), 0 20px 30px rgba(0,0,0,0.2), 0 0 0 1.5px #8a5a2b'
    }
  },

  { name: 'Oiled Walnut - Fine Black Seat', inset: '-inset-5', radius: '3rem',
    style: {
      backgroundImage: 'url("/textures/walnut.png")',
      backgroundSize: '200px',
      boxShadow: 'inset 0 4px 9px rgba(255,255,255,0.1), inset 0 -8px 20px rgba(0,0,0,0.5), 10px 15px 35px rgba(0,0,0,0.6)',
      border: '1px solid #090604'
    },
    panelStyle: {
      boxShadow: '0 40px 80px rgba(0,0,0,0.4), 0 20px 30px rgba(0,0,0,0.2), 0 0 0 1px #130b06'
    }
  },

  { name: 'Oiled Walnut - Double Join Seat', inset: '-inset-5', radius: '3rem',
    style: {
      backgroundImage: 'url("/textures/walnut.png")',
      backgroundSize: '200px',
      boxShadow: 'inset 0 4px 9px rgba(255,255,255,0.1), inset 0 -8px 20px rgba(0,0,0,0.5), 10px 15px 35px rgba(0,0,0,0.6)',
      border: '1px solid #111'
    },
    panelStyle: {
      boxShadow: '0 40px 80px rgba(0,0,0,0.4), 0 20px 30px rgba(0,0,0,0.2), 0 0 0 1px #2b170b, 0 0 0 2px #78502a'
    }
  },

  { name: 'Oiled Walnut - Double Join Rounded', inset: '-inset-5', radius: '4.5rem',
    style: {
      backgroundImage: 'url("/textures/walnut.png")',
      backgroundSize: '200px',
      boxShadow: 'inset 0 4px 9px rgba(255,255,255,0.1), inset 0 -8px 20px rgba(0,0,0,0.5), 10px 15px 35px rgba(0,0,0,0.6)',
      border: '1px solid #111'
    },
    panelStyle: {
      boxShadow: '0 40px 80px rgba(0,0,0,0.4), 0 20px 30px rgba(0,0,0,0.2), 0 0 0 1px #2b170b, 0 0 0 2px #78502a'
    }
  },

  { name: 'Industrial Hammered Copper', inset: '-inset-6', radius: '4rem',
    style: {
      backgroundImage: 'url("/textures/polished_copper_hammer_frame_1777670608231.png")',
      backgroundSize: 'cover',
      boxShadow: 'inset 2px 2px 10px rgba(255,255,255,0.2), inset -4px -4px 15px rgba(0,0,0,0.8), 0 30px 60px rgba(0,0,0,0.5)',
      border: '2px solid #3d2a20'
    },
    innerStyle: {
      inset: 'inset-2',
      radius: '3.8rem',
      backgroundColor: 'rgba(0,0,0,0.2)',
      boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
    }
  },

  { name: 'Studio Tolex (Charcoal)', inset: '-inset-5', radius: '2.5rem',
    style: {
      backgroundImage: 'url("/textures/studio_tolex_amplifier_frame_1777670497625.png")',
      backgroundSize: '400px',
      boxShadow: 'inset 1px 1px 4px rgba(255,255,255,0.1), inset -2px -2px 6px rgba(0,0,0,0.9), 10px 20px 40px rgba(0,0,0,0.7)',
      border: '3px solid #1a1a1a'
    }
  },

  { name: 'Rosewood Console', inset: '-inset-7', radius: '3.5rem',
    style: {
      backgroundImage: 'url("/textures/rosewood_console_frame_1777670401797.png")',
      backgroundSize: 'cover',
      boxShadow: 'inset 3px 3px 8px rgba(255,255,255,0.15), inset -5px -5px 12px rgba(0,0,0,0.9), 15px 25px 50px rgba(0,0,0,0.6)',
      border: '1px solid #2a1a1a'
    },
    overlayStyle: {
      background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.2) 100%)'
    }
  },

  { name: 'Oiled Walnut Burl', inset: '-inset-6', radius: '4.5rem',
    style: {
      backgroundImage: 'url("/textures/oiled_walnut_burl_frame_1777670349016.png")',
      backgroundSize: 'cover',
      boxShadow: 'inset 2px 2px 6px rgba(255,255,255,0.1), inset -3px -3px 10px rgba(0,0,0,0.85), 12px 20px 45px rgba(0,0,0,0.55)',
      border: '1.5px solid #2a1d15'
    }
  },
  { name: 'Oiled Walnut - Double Join Heavy', inset: '-inset-5', panelInset: 'inset-1', radius: '4.5rem', panelRadius: '3.9rem',
    style: {
      backgroundImage: 'url("/textures/walnut.png")',
      backgroundSize: '200px',
      boxShadow: 'inset 0 4px 9px rgba(255,255,255,0.1), inset 0 -8px 20px rgba(0,0,0,0.5), 10px 15px 35px rgba(0,0,0,0.6)',
      border: '1px solid #111'
    },
    panelStyle: {
      boxShadow: '0 40px 80px rgba(0,0,0,0.4), 0 20px 30px rgba(0,0,0,0.2), 0 0 0 1px #2b170b, 0 0 0 2px #78502a'
    }
  }
];

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

export default function App({ websiteMode = false, showCables = true }) {
  const pluginStageRef = useRef(null);
  const savedDesignDefaults = useRef(loadSavedDesignDefaults()).current;
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
  const [activeDisplayParam, setActiveDisplayParam] = useState('filter');
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
  const [mode, setMode] = useState(() => initial('mode', CODE_DEFAULT_DESIGN.mode));
  const [mix, setMix] = useState(() => initial('mix', CODE_DEFAULT_DESIGN.mix ?? 50));
  const [lfoEnabled, setLfoEnabled] = useState(() => initial('lfoEnabled', CODE_DEFAULT_DESIGN.lfoEnabled));
  const [lfoSync, setLfoSync] = useState(() => initial('lfoSync', CODE_DEFAULT_DESIGN.lfoSync));
  const [lfoShape, setLfoShape] = useState(() => initial('lfoShape', CODE_DEFAULT_DESIGN.lfoShape));
  const [lfoSyncDiv, setLfoSyncDiv] = useState(() => initial('lfoSyncDiv', CODE_DEFAULT_DESIGN.lfoSyncDiv));
  const [saturationMode, setSaturationMode] = useState(() => initial('saturationMode', CODE_DEFAULT_DESIGN.saturationMode));
  const [saturationStyle, setSaturationStyle] = useState(() => normalizeSaturationStyle(initial('saturationStyle', CODE_DEFAULT_DESIGN.saturationStyle)));
  const [currentPreset, setCurrentPreset] = useState(() => initial('currentPreset', CODE_DEFAULT_DESIGN.currentPreset));
  const [frameStyle, setFrameStyle] = useState(() => initial('frameStyle', CODE_DEFAULT_DESIGN.frameStyle));
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
  const [showOutputs, setShowOutputs] = useState(() => initial('showOutputs', CODE_DEFAULT_DESIGN.showOutputs));
  const [parallelCables, setParallelCables] = useState(() => initial('parallelCables', CODE_DEFAULT_DESIGN.parallelCables));
  const [showStems, setShowStems] = useState(() => initial('showStems', CODE_DEFAULT_DESIGN.showStems));
  const [showFerns, setShowFerns] = useState(() => initial('showFerns', CODE_DEFAULT_DESIGN.showFerns));
  const [faceTextureEnabled, setFaceTextureEnabled] = useState(() => initial('faceTextureEnabled', CODE_DEFAULT_DESIGN.faceTextureEnabled));
  const [faceTextureStyle, setFaceTextureStyle] = useState(() => initial('faceTextureStyle', CODE_DEFAULT_DESIGN.faceTextureStyle));
  const [faceTextureOpacity, setFaceTextureOpacity] = useState(() => initial('faceTextureOpacity', CODE_DEFAULT_DESIGN.faceTextureOpacity));
  const [panelFaceColor, setPanelFaceColor] = useState(() => initial('panelFaceColor', CODE_DEFAULT_DESIGN.panelFaceColor));
  const [useDefaultPanelFaceColor, setUseDefaultPanelFaceColor] = useState(() => initial('useDefaultPanelFaceColor', CODE_DEFAULT_DESIGN.useDefaultPanelFaceColor));
  const [brandTextStyle, setBrandTextStyle] = useState(() => normalizeBrandTextStyle(initial('brandTextStyle', CODE_DEFAULT_DESIGN.brandTextStyle)));
  const [vintageLogoColor, setVintageLogoColor] = useState(() => initial('vintageLogoColor', CODE_DEFAULT_DESIGN.vintageLogoColor || DEFAULT_VINTAGE_LOGO_COLOR));
  const [polarisLogoColor, setPolarisLogoColor] = useState(() => initial('polarisLogoColor', CODE_DEFAULT_DESIGN.polarisLogoColor || DEFAULT_POLARIS_LOGO_COLOR));
  const [knobFlutterFilledColors, setKnobFlutterFilledColors] = useState(() => ({
    ...DEFAULT_KNOB_FLUTTER_FILLED_COLORS,
    ...(initial('knobFlutterFilledColors', CODE_DEFAULT_DESIGN.knobFlutterFilledColors || DEFAULT_KNOB_FLUTTER_FILLED_COLORS) || {})
  }));
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
  const activePanelFaceColor = useDefaultPanelFaceColor ? DEFAULT_PANEL_FACE_COLOR : panelFaceColor;
  const activeBrandTextStyle = BRAND_TEXT_STYLES[normalizeBrandTextStyle(brandTextStyle)] || BRAND_TEXT_STYLES[0];
  const lfoImageSettings = { ...LFO_IMAGE_PRESET, ...lfoImageState };
  const displaySignal = { input, output, mode, rate, waveShape: lfoShape, driftAnimation };
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
  const handleMixChange = (nextValue) => { markDisplayParam('mix'); setMix(nextValue); };
  const handleIOLinkStyleChange = (nextStyle) => {
    setIoLinkStyle(nextStyle);
    if (nextStyle === 'none') setIoLinked(false);
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

  const handleSaveCurrentAsDefault = () => {
    const saved = saveDesignDefaults({
      power,
      input,
      output,
      ioLinkStyle,
      ioLinked,
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
      mode,
      lfoEnabled,
      lfoSync,
      lfoShape,
      lfoSyncDiv,
      currentPreset,
      frameStyle,
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
      showOutputs,
      parallelCables,
      showStems,
      showFerns,
      faceTextureEnabled,
      faceTextureStyle,
      faceTextureOpacity,
      panelFaceColor,
      useDefaultPanelFaceColor,
      brandTextStyle,
      vintageLogoColor,
      polarisLogoColor,
      knobFlutterFilledColors,
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
      saturationMode,
      saturationStyle
    });
    setDefaultSaveMessage(saved ? 'Saved as default' : 'Could not save');
    window.setTimeout(() => setDefaultSaveMessage(''), 2200);
  };


  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) setScale(entries[0].contentRect.width / 850);
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 font-sans overflow-hidden gap-16 xl:gap-24 flex-col lg:flex-row" style={{ backgroundColor: BACKGROUNDS[bgIndex].color, transition: 'background-color 0.5s ease' }}>
      
      {/* Plugin Area */}
      <div ref={containerRef} className="relative w-full max-w-[680px] aspect-square flex items-center justify-center flex-shrink-0">
        <div ref={pluginStageRef} className="absolute" style={{ width: 850, height: 850, transform: `scale(${scale})`, transformOrigin: 'center center' }}>
          
          {/* Frame Wrapper */}
          <div 
            className={`absolute ${FRAMES[frameStyle]?.inset || '-inset-6'} transition-all duration-500 pointer-events-none`} 
            style={{ borderRadius: FRAMES[frameStyle]?.radius || '4.5rem', zIndex: -1, transform: `scale(${OUTER_PLUGIN_SCALE})`, transformOrigin: 'center center', ...FRAMES[frameStyle]?.style }}
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

          {showCables && (
            <div className="absolute inset-0 pointer-events-none" style={{ transform: `scale(${OUTER_PLUGIN_SCALE})`, transformOrigin: 'center center', zIndex: -2 }}>
              <AnalogCables position="left" parallel={parallelCables} />
              {showOutputs && <AnalogCables position="right" parallel={parallelCables} />}
            </div>
          )}

          {!websiteMode && (
            <PresetBrowser presets={DEMO_PRESETS} currentPreset={currentPreset}
              onPrev={() => setCurrentPreset(p => (p - 1 + DEMO_PRESETS.length) % DEMO_PRESETS.length)}
              onNext={() => setCurrentPreset(p => (p + 1) % DEMO_PRESETS.length)}
              onLoad={setCurrentPreset} onSave={(name) => console.log('Save preset:', name)} />
          )}

          {!websiteMode && (
            <div className="absolute -top-[52px] right-[40px] z-30 flex items-center gap-2 group flex-row-reverse">
              <div className="relative h-9 rounded-lg bg-[#2d2c2b]/85 border border-white/10 shadow-xl backdrop-blur-md flex items-center min-w-[130px]">
                <select
                  value={driftAnimation}
                  onChange={e => setDriftAnimation(normalizeDriftAnimationStyle(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                >
                  {DRIFT_ANIMATION_STYLES.map((name, i) => <option key={i} value={i} className="bg-[#2d2c2b] text-[#edd39a]">{name}</option>)}
                </select>
                <div className="w-full flex items-center justify-between px-3 pointer-events-none">
                  <span className="text-[#edd39a] text-[8px] font-black tracking-[0.14em] uppercase truncate max-w-[90px]">{DRIFT_ANIMATION_STYLES[driftAnimation]}</span>
                  <span className="text-[#e66a53] text-[9px] ml-1">▼</span>
                </div>
              </div>
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#edd39a]/30 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Drift Visual</span>
            </div>
          )}

          <div
            className={`absolute ${FRAMES[frameStyle]?.panelInset || 'inset-0'} shadow-[0_40px_80px_rgba(0,0,0,0.4),0_20px_30px_rgba(0,0,0,0.2)] overflow-hidden transition-all duration-500`}
            style={{ 
              backgroundColor: activePanelFaceColor, 
              zIndex: 8, 
              transform: `scale(${OUTER_PLUGIN_SCALE})`, 
              transformOrigin: 'center center', 
              borderRadius: FRAMES[frameStyle]?.panelRadius || '4rem',
              ...FRAMES[frameStyle]?.panelStyle 
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none z-[5] transition-all duration-300"
              style={{
                opacity: faceTextureEnabled ? faceTextureOpacity / 100 : 0,
                backgroundImage: selectedFaceTexture.backgroundImage,
                backgroundSize: selectedFaceTexture.backgroundSize,
                backgroundRepeat: 'repeat',
                mixBlendMode: selectedFaceTexture.mixBlendMode
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

            <div className={`absolute inset-0 bg-[#3a352d]/50 backdrop-grayscale transition-all duration-700 z-40 pointer-events-none ${power ? 'opacity-0' : 'opacity-100'}`} />

            <div className="absolute top-[6%] left-[10.2%] z-10 flex flex-col items-start">
              <h1 className="text-[34px] leading-none font-black tracking-tighter drop-shadow-sm flex gap-3" style={{ color: vintageLogoColor }}><span>VINTAGE</span> <span>DRIFTER</span></h1>
              <p className="text-[11px] tracking-[0.2em] font-bold text-[#8b7b65] mt-1">MOTION / TONE / INSTABILITY</p>
            </div>

            <div className="absolute top-[calc(6%-2px)] right-[10%] z-10 flex flex-col items-center">
              <div className="text-[12px] font-black tracking-[0.2em] mb-4 drop-shadow-sm" style={{ color: polarisLogoColor || activeBrandTextStyle.polarisColor }}>POLARIS DSP</div>
              <div className="relative top-[5px] flex flex-col items-center">
                <button onClick={() => setPower(!power)} className="relative w-8 h-14 bg-[#111] rounded-md border border-white/10 shadow-[inset_0_2px_5px_rgba(0,0,0,0.8),10px_10px_20px_rgba(0,0,0,0.4)] flex justify-center items-center">
                  <div className="w-3 h-8 rounded-full bg-gradient-to-b from-[hsl(41,68%,76%)] to-[hsl(42,41%,46%)] shadow-[0_5px_10px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.9)] transition-transform duration-200" style={{ transform: power ? 'translateY(-8px)' : 'translateY(8px)' }} />
                </button>
                <div className="mt-[10px] text-[10px] font-black tracking-[0.24em]" style={{ color: activeBrandTextStyle.powerColor, textShadow: activeBrandTextStyle.powerShadow }}>POWER</div>
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
                  <MatteKnob label="Input" value={input} onChange={handleInputChange} onDoubleClick={handleInputReset} size={55} shadingStyle={activeKnobStyle} outerRingEnabled={smallKnobRingEnabled} onDraggingChange={(dragging) => { setIsInputDragging(dragging); if (dragging) markDisplayParam('input'); }} onDisplayFocus={() => markDisplayParam('input')} forceSnappy={isIoDragging} readoutStyleIndex={readoutStyleIndex} />
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
                  <MatteKnob label="Output" value={output} onChange={handleOutputChange} onDoubleClick={handleOutputReset} size={55} shadingStyle={activeKnobStyle} outerRingEnabled={smallKnobRingEnabled} onDraggingChange={(dragging) => { setIsOutputDragging(dragging); if (dragging) markDisplayParam('output'); }} onDisplayFocus={() => markDisplayParam('output')} forceSnappy={isIoDragging} readoutStyleIndex={readoutStyleIndex} />
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

            <div className="absolute top-[38%] right-[10%] z-30 grid grid-cols-2 gap-x-6 gap-y-10 justify-items-center translate-y-[-10px]">
              <MatteKnob label="Noise" value={noise} onChange={handleNoiseChange} onDoubleClick={() => handleNoiseChange(0)} size={50} shadingStyle={activeKnobStyle} outerRingEnabled={smallKnobRingEnabled} labelOffsetY={-4} onDisplayFocus={() => markDisplayParam('noise')} readoutStyleIndex={readoutStyleIndex} />
              <MatteKnob label="Sweeten" value={sweeten} onChange={handleSweetenChange} onDoubleClick={() => handleSweetenChange(0)} size={50} shadingStyle={activeKnobStyle} outerRingEnabled={smallKnobRingEnabled} labelOffsetY={-4} onDisplayFocus={() => markDisplayParam('sweeten')} readoutStyleIndex={readoutStyleIndex} />
              <div className="relative">
                <MatteKnob label="Sat" value={biasHF} onChange={handleSatChange} onDoubleClick={() => handleSatChange(0)} size={50} shadingStyle={activeKnobStyle} outerRingEnabled={smallKnobRingEnabled} labelOffsetY={-4} labelColorOverride="text-white/90 drop-shadow-md" onDisplayFocus={() => markDisplayParam('sat')} readoutStyleIndex={readoutStyleIndex} />
              </div>
              <div className="relative">
                <MatteKnob label="Filter" value={character} onChange={handleFilterChange} onDoubleClick={() => handleFilterChange(100)} size={50} shadingStyle={activeKnobStyle} outerRingEnabled={smallKnobRingEnabled} labelOffsetY={-4} labelColorOverride="text-white/90 drop-shadow-md" onDisplayFocus={() => markDisplayParam('filter')} readoutStyleIndex={readoutStyleIndex} />
              </div>
            </div>

            <div className="absolute right-[8.2%] top-[calc(64%+2px)] z-30 pointer-events-none">
              <ParameterDataDisplay parameter={activeDisplayData} power={power} />
            </div>

            {saturationStyle !== 0 && (
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
                <MatteKnob label="Rate" value={rate} onChange={handleRateChange} size={70} shadingStyle={activeKnobStyle} outerRingEnabled={smallKnobRingEnabled} labelOffsetY={5} readoutOffsetY={-2} steadyReadout indicatorActive={lfoEnabled && !lfoSync} onDisplayFocus={() => markDisplayParam('rate')} readoutStyleIndex={readoutStyleIndex} />
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
                setSync={setLfoSync}
                waveIndex={lfoShape}
                setWaveIndex={handleLfoShapeChange}
                rateIndex={lfoSyncDiv}
                setRateIndex={setLfoSyncDiv}
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
                size={64}
                shadingStyle={activeMixKnobStyle}
                outerRingEnabled={smallKnobRingEnabled}
                labelOffsetY={-4}
                labelColorOverride="text-white/90 drop-shadow-md"
                onDisplayFocus={() => markDisplayParam('mix')}
                readoutStyleIndex={readoutStyleIndex}
              />
            </EditableHardwareWrapper>

            <DesignGridOverlay mode={designGridMode} />

            <div
              className="absolute z-30 text-center text-[10px] font-black uppercase tracking-[0.24em]"
              style={{
                bottom: 'calc(3.4% + 1px)',
                left: 'calc(22% - 7px)',
                transform: 'translateX(-50%)',
                color: 'rgba(58, 53, 45, 0.58)',
                textShadow: '0 1px 0 rgba(255,255,255,0.24), 0 -1px 0 rgba(0,0,0,0.12)'
              }}
            >
              IMPERFECT BY DESIGN
            </div>

          </div>
        </div>
      </div>
      </div>

      {/* Sidebar Panel - Redesigned Sidebar */}
      {!websiteMode && (
      <div className="hidden lg:flex flex-col items-stretch gap-0 w-[300px] max-h-[calc(100vh-4rem)] overflow-y-auto rounded-[3rem] bg-black/30 backdrop-blur-3xl border border-white/10 shrink-0 shadow-2xl custom-scrollbar pb-12">
        
        {/* SECTION 1: GLOBAL STYLE */}
        <CollapsibleSection title="Master Design" defaultOpen={true}>
          <div className="grid grid-cols-1 gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-white/50 text-[9px] font-bold tracking-[0.2em] uppercase">Frame Surface</span>
              <div className="relative w-full h-11">
                <select value={frameStyle} onChange={e => setFrameStyle(Number(e.target.value))} className="absolute inset-0 w-full h-full bg-white/5 text-[#edd39a] rounded-xl border border-white/10 px-4 text-[12px] font-bold outline-none cursor-pointer appearance-none">
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
                      backgroundSize: selectedFaceTexture.backgroundSize,
                      backgroundRepeat: 'repeat',
                      mixBlendMode: selectedFaceTexture.mixBlendMode
                    }}
                  />
                </div>
                <div className="relative w-full h-11">
                  <select value={faceTextureStyle} onChange={e => setFaceTextureStyle(Number(e.target.value))} className="absolute inset-0 w-full h-full bg-white/5 text-[#edd39a] rounded-xl border border-white/10 px-4 text-[11px] font-bold outline-none cursor-pointer appearance-none">
                    {FACE_TEXTURES.map((texture, i) => <option key={i} value={i}>{texture.name}</option>)}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">▼</div>
                </div>
              </div>

              <SakuraRange label="opac" value={faceTextureOpacity} min={0} max={70} onChange={setFaceTextureOpacity} />
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
          0%, 17%, 20%, 23%, 51%, 55%, 100% { opacity: 1; filter: drop-shadow(0 0 5px rgba(239,68,68,0.74)); }
          18%, 22%, 53% { opacity: 0.76; filter: drop-shadow(0 0 2px rgba(239,68,68,0.32)); }
        }
        .anim-unstable-led-flicker { animation: unstable-led-flicker 4.6s infinite alternate; }
        @keyframes vintage-led-flicker {
          0%, 20%, 23%, 56%, 60%, 100% { opacity: 1; filter: drop-shadow(0 0 5px rgba(251,146,60,0.57)); }
          21%, 58% { opacity: 0.9; filter: drop-shadow(0 0 3px rgba(251,146,60,0.31)); }
        }
        .anim-vintage-led-flicker { animation: vintage-led-flicker 6.8s infinite alternate; }
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
        .hud-phase-soft { animation: hud-phase-soft 2s ease-in-out infinite; }
        .hud-mix-float { transform-origin: center; animation: hud-mix-float 3.4s ease-in-out infinite; }
        .hud-mix-dots { transform-origin: center; animation: hud-mix-dots 3.1s ease-in-out infinite; }
        .knob-flutter-spill { transform-origin: center; animation: knob-flutter-spill var(--spill-speed, 2.4s) ease-in-out infinite; }
        .hud-drift-wave { animation-name: hud-drift-wave; animation-timing-function: ease-in-out; animation-iteration-count: infinite; }
        .hud-drift-dot { animation-name: hud-drift-dot; animation-timing-function: ease-in-out; animation-iteration-count: infinite; }
        .hud-screen-soft {
          filter: saturate(0.93) contrast(0.91) drop-shadow(0 0 2px rgba(230,106,83,0.16));
          opacity: 0.95;
          text-shadow: 0 0 3px rgba(230,106,83,0.21);
        }
        * { -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; }
        body { overflow: hidden; touch-action: none; }
        input[type="range"] { -webkit-user-select: auto; user-select: auto; }
        .lfo-scrollbar::-webkit-scrollbar { width: 3px; }
        .lfo-scrollbar::-webkit-scrollbar-track { background: transparent; margin-block: 14px; }
        .lfo-scrollbar::-webkit-scrollbar-thumb { background: rgba(223,111,90,0.4); border-radius: 4px; }
        .lfo-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(223,111,90,0.8); }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.35); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}} />
    </div>
  );
}
