/**
 * SVG 图片生成器
 * 用于生成占位图，当没有真实图片时使用
 */

/**
 * 生成占位图 SVG
 * @param {Object} config - 配置对象
 * @param {string} config.text - 显示文字
 * @param {string} config.icon - 图标
 * @param {string} config.bgColor - 背景色
 * @param {number} config.width - 宽度
 * @param {number} config.height - 高度
 * @returns {string} SVG 字符串
 */
export function generatePlaceholderSVG(config) {
  const { text, icon, bgColor, width = 400, height = 400 } = config;

  // 生成渐变背景
  const gradientId = `grad-${Math.random().toString(36).substr(2, 9)}`;
  const lighterColor = lightenColor(bgColor, 20);

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${lighterColor};stop-opacity:1" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.2"/>
        </filter>
      </defs>
      
      <!-- 背景 -->
      <rect width="100%" height="100%" fill="url(#${gradientId})" />
      
      <!-- 装饰图案 -->
      <g opacity="0.1">
        <circle cx="50" cy="50" r="100" fill="white" />
        <circle cx="${width - 50}" cy="${height - 50}" r="150" fill="white" />
        <circle cx="${width / 2}" cy="${height / 2}" r="200" fill="white" />
      </g>
      
      <!-- 图标 -->
      <text x="50%" y="45%" text-anchor="middle" dominant-baseline="middle" 
            font-size="120" filter="url(#shadow)">
        ${icon}
      </text>
      
      <!-- 文字 -->
      <text x="50%" y="70%" text-anchor="middle" dominant-baseline="middle" 
            font-family="Noto Sans SC, sans-serif" font-size="32" font-weight="bold" 
            fill="white" filter="url(#shadow)">
        ${text}
      </text>
      
      <!-- 装饰边框 -->
      <rect x="20" y="20" width="${width - 40}" height="${height - 40}" 
            fill="none" stroke="white" stroke-width="4" stroke-opacity="0.3" rx="20" />
    </svg>
  `.trim();
}

/**
 * 生成 SVG Data URL
 * @param {string} svgString - SVG 字符串
 * @returns {string} Data URL
 */
export function svgToDataURL(svgString) {
  const encoded = encodeURIComponent(svgString);
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}

/**
 * 生成占位图 Data URL
 * @param {Object} config - 配置对象
 * @returns {string} Data URL
 */
export function generatePlaceholderImage(config) {
  const svg = generatePlaceholderSVG(config);
  return svgToDataURL(svg);
}

/**
 * 颜色变亮
 * @param {string} color - 十六进制颜色
 * @param {number} percent - 百分比
 * @returns {string} 变亮后的颜色
 */
function lightenColor(color, percent) {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00FF) + amt;
  const B = (num & 0x00FF) + amt;

  return '#' + (
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1);
}

/**
 * 预生成所有占位图
 * @returns {Object} 占位图映射
 */
export function generateAllPlaceholders() {
  const placeholders = {
    animals: [
      { text: '小猫咪', icon: '🐱', bgColor: '#FFB6C1' },
      { text: '小狗狗', icon: '🐶', bgColor: '#D2B48C' },
      { text: '小兔子', icon: '🐰', bgColor: '#F0E68C' },
      { text: '小熊猫', icon: '🐼', bgColor: '#D3D3D3' },
      { text: '小老虎', icon: '🐯', bgColor: '#FFA500' },
    ],
    nature: [
      { text: '日出', icon: '🌅', bgColor: '#FFD700' },
      { text: '森林', icon: '🌲', bgColor: '#228B22' },
      { text: '海滩', icon: '🏖️', bgColor: '#87CEEB' },
      { text: '山脉', icon: '⛰️', bgColor: '#8B4513' },
      { text: '湖泊', icon: '🏞️', bgColor: '#4682B4' },
    ],
    food: [
      { text: '寿司', icon: '🍣', bgColor: '#F4A460' },
      { text: '蛋糕', icon: '🎂', bgColor: '#FFB6C1' },
      { text: '披萨', icon: '🍕', bgColor: '#FFD700' },
      { text: '水果', icon: '🍎', bgColor: '#FF6347' },
      { text: '冰淇淋', icon: '🍦', bgColor: '#E6E6FA' },
    ],
    art: [
      { text: '星空', icon: '🌌', bgColor: '#191970' },
      { text: '向日葵', icon: '🌻', bgColor: '#FFD700' },
      { text: '蒙娜丽莎', icon: '🖼️', bgColor: '#8B7355' },
      { text: '呐喊', icon: '😱', bgColor: '#FF4500' },
      { text: '睡莲', icon: '🪷', bgColor: '#E0FFFF' },
    ]
  };

  const result = {};

  for (const [chapter, items] of Object.entries(placeholders)) {
    result[chapter] = items.map(item => generatePlaceholderImage(item));
  }

  return result;
}

export default {
  generatePlaceholderSVG,
  svgToDataURL,
  generatePlaceholderImage,
  generateAllPlaceholders
};
