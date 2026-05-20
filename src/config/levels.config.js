/**
 * 关卡配置
 * 定义所有关卡的主题、难度和固定初始布局
 * 
 * 初始布局说明：
 * - 每个布局是一个数字数组，表示拼图块的当前位置
 * - 数组索引 = 位置索引(row*size + col)
 * - 数组值 = 拼图块ID (0-based)，-1 表示空白块
 * - makeSolvable() 自动修正奇偶性确保所有布局均可解
 */

function makeSolvable(layout, size) {
  const state = new Array(layout.length);
  for (let i = 0; i < layout.length; i++) {
    state[i] = layout[i] === -1 ? 0 : layout[i] + 1;
  }

  const arr = state.filter(n => n !== 0);
  let inversions = 0;
  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] > arr[j]) inversions++;
    }
  }

  let solvable;
  if (size % 2 === 1) {
    solvable = inversions % 2 === 0;
  } else {
    const emptyRowFromTop = Math.floor(state.indexOf(0) / size);
    const emptyRowFromBottom = size - emptyRowFromTop;
    solvable = (inversions + emptyRowFromBottom) % 2 === 1;
  }

  if (!solvable) {
    const nonEmpty = [];
    for (let i = 0; i < layout.length; i++) {
      if (layout[i] !== -1) nonEmpty.push(i);
    }
    if (nonEmpty.length >= 2) {
      [layout[nonEmpty[0]], layout[nonEmpty[1]]] = [layout[nonEmpty[1]], layout[nonEmpty[0]]];
    }
  }

  return layout;
}

// 3x3 可解布局 (奇数尺寸，逆序数为偶数)
// 从目标状态 [0,1,2,3,4,5,6,7,-1] 通过有效移动生成
const LAYOUTS_3x3 = [
  makeSolvable([0, 1, 2, 3, 4, 5, 6, -1, 7], 3),
  makeSolvable([0, 1, 2, 3, -1, 4, 6, 7, 5], 3),
  makeSolvable([0, 1, 2, -1, 3, 4, 6, 7, 5], 3),
  makeSolvable([1, -1, 2, 0, 3, 4, 6, 7, 5], 3),
  makeSolvable([1, 2, -1, 0, 4, 5, 3, 7, 6], 3),
];

// 4x4 可解布局 (偶数尺寸，(逆序数+空白行从底部数)为奇数)
// 从目标状态 [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,-1] 通过有效移动生成
const LAYOUTS_4x4 = [
  makeSolvable([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, -1, 14], 4),
  makeSolvable([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, -1, 13, 14], 4),
  makeSolvable([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, -1, 12, 13, 14, 11], 4),
  makeSolvable([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 11, -1, 10, 12, 13, 14], 4),
  makeSolvable([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, -1, 10, 12, 13, 14, 11], 4),
];

// 5x5 可解布局 (奇数尺寸)
// 从目标状态 [0,1,...,23,-1] 通过有效移动生成
const LAYOUTS_5x5 = [
  makeSolvable([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, -1, 23], 5),
  makeSolvable([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, -1, 22, 23], 5),
  makeSolvable([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, -1, 21, 22, 23], 5),
  makeSolvable([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, -1, 19, 20, 21, 22, 23], 5),
  makeSolvable([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, -1, 16, 17, 18, 19, 20, 21, 22, 23], 5),
];

// 6x6 可解布局 (偶数尺寸)
// 从目标状态 [0,1,...,34,-1] 通过有效移动生成
const LAYOUTS_6x6 = [
  makeSolvable([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, -1, 34], 6),
  makeSolvable([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, -1, 33, 34], 6),
  makeSolvable([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, -1, 33, 34], 6),
  makeSolvable([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, -1, 31, 32, 33, 34], 6),
  makeSolvable([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, -1, 29, 30, 31, 32, 33, 34], 6),
];

export const LEVELS_CONFIG = {
  chapters: [
    {
      id: 'animals',
      name: '卡通动物',
      description: '可爱的动物朋友们',
      difficulty: 'beginner',
      gridSize: 3,
      color: '#FF9AA2',
      levels: [
        { id: 'a1', name: '小猫咪', image: '/images/themes/animals/cat.jpg', initialLayout: LAYOUTS_3x3[0] },
        { id: 'a2', name: '小狗狗', image: '/images/themes/animals/dog.jpg', initialLayout: LAYOUTS_3x3[1] },
        { id: 'a3', name: '小兔子', image: '/images/themes/animals/rabbit.jpg', initialLayout: LAYOUTS_3x3[2] },
        { id: 'a4', name: '小熊猫', image: '/images/themes/animals/panda.jpg', initialLayout: LAYOUTS_3x3[3] },
        { id: 'a5', name: '小老虎', image: '/images/themes/animals/tiger.jpg', initialLayout: LAYOUTS_3x3[4] },
      ]
    },
    {
      id: 'nature',
      name: '自然风景',
      description: '美丽的自然风光',
      difficulty: 'easy',
      gridSize: 4,
      color: '#B5EAD7',
      levels: [
        { id: 'n1', name: '日出', image: '/images/themes/nature/sunrise.jpg', initialLayout: LAYOUTS_4x4[0] },
        { id: 'n2', name: '森林', image: '/images/themes/nature/forest.jpg', initialLayout: LAYOUTS_4x4[1] },
        { id: 'n3', name: '海滩', image: '/images/themes/nature/beach.jpg', initialLayout: LAYOUTS_4x4[2] },
        { id: 'n4', name: '山脉', image: '/images/themes/nature/mountain.jpg', initialLayout: LAYOUTS_4x4[3] },
        { id: 'n5', name: '湖泊', image: '/images/themes/nature/lake.jpg', initialLayout: LAYOUTS_4x4[4] },
      ]
    },
    {
      id: 'food',
      name: '美食料理',
      description: '诱人的美食',
      difficulty: 'medium',
      gridSize: 5,
      color: '#FFDAC1',
      levels: [
        { id: 'f1', name: '寿司', image: '/images/themes/food/sushi.jpg', initialLayout: LAYOUTS_5x5[0] },
        { id: 'f2', name: '蛋糕', image: '/images/themes/food/cake.jpg', initialLayout: LAYOUTS_5x5[1] },
        { id: 'f3', name: '披萨', image: '/images/themes/food/pizza.jpg', initialLayout: LAYOUTS_5x5[2] },
        { id: 'f4', name: '水果', image: '/images/themes/food/fruits.jpg', initialLayout: LAYOUTS_5x5[3] },
        { id: 'f5', name: '冰淇淋', image: '/images/themes/food/icecream.jpg', initialLayout: LAYOUTS_5x5[4] },
      ]
    },
    {
      id: 'art',
      name: '艺术名画',
      description: '经典艺术作品',
      difficulty: 'hard',
      gridSize: 6,
      color: '#C7CEEA',
      levels: [
        { id: 'ar1', name: '星空', image: '/images/themes/art/starrynight.jpg', initialLayout: LAYOUTS_6x6[0] },
        { id: 'ar2', name: '向日葵', image: '/images/themes/art/sunflowers.jpg', initialLayout: LAYOUTS_6x6[1] },
        { id: 'ar3', name: '蒙娜丽莎', image: '/images/themes/art/monalisa.jpg', initialLayout: LAYOUTS_6x6[2] },
        { id: 'ar4', name: '呐喊', image: '/images/themes/art/scream.jpg', initialLayout: LAYOUTS_6x6[3] },
        { id: 'ar5', name: '睡莲', image: '/images/themes/art/waterlilies.jpg', initialLayout: LAYOUTS_6x6[4] },
      ]
    }
  ],

  placeholderImages: {
    animals: [
      { name: '小猫咪', color: '#FFB6C1', icon: '🐱' },
      { name: '小狗狗', color: '#D2B48C', icon: '🐶' },
      { name: '小兔子', color: '#F0E68C', icon: '🐰' },
      { name: '小熊猫', color: '#D3D3D3', icon: '🐼' },
      { name: '小老虎', color: '#FFA500', icon: '🐯' },
    ],
    nature: [
      { name: '日出', color: '#FFD700', icon: '🌅' },
      { name: '森林', color: '#228B22', icon: '🌲' },
      { name: '海滩', color: '#87CEEB', icon: '🏖️' },
      { name: '山脉', color: '#8B4513', icon: '⛰️' },
      { name: '湖泊', color: '#4682B4', icon: '🏞️' },
    ],
    food: [
      { name: '寿司', color: '#F4A460', icon: '🍣' },
      { name: '蛋糕', color: '#FFB6C1', icon: '🎂' },
      { name: '披萨', color: '#FFD700', icon: '🍕' },
      { name: '水果', color: '#FF6347', icon: '🍎' },
      { name: '冰淇淋', color: '#E6E6FA', icon: '🍦' },
    ],
    art: [
      { name: '星空', color: '#191970', icon: '🌌' },
      { name: '向日葵', color: '#FFD700', icon: '🌻' },
      { name: '蒙娜丽莎', color: '#8B7355', icon: '🖼️' },
      { name: '呐喊', color: '#FF4500', icon: '😱' },
      { name: '睡莲', color: '#E0FFFF', icon: '🪷' },
    ]
  }
};

export function getLevel(chapterId, levelId) {
  const chapter = LEVELS_CONFIG.chapters.find(c => c.id === chapterId);
  if (!chapter) return null;

  const level = chapter.levels.find(l => l.id === levelId);
  if (!level) return null;

  return {
    ...level,
    chapterId,
    chapterName: chapter.name,
    gridSize: chapter.gridSize,
    difficulty: chapter.difficulty,
    color: chapter.color
  };
}

export function getChapterLevels(chapterId) {
  const chapter = LEVELS_CONFIG.chapters.find(c => c.id === chapterId);
  if (!chapter) return [];

  return chapter.levels.map((level, index) => ({
    ...level,
    chapterId,
    chapterName: chapter.name,
    gridSize: chapter.gridSize,
    difficulty: chapter.difficulty,
    color: chapter.color,
    number: index + 1
  }));
}

export function getAllChapters() {
  return LEVELS_CONFIG.chapters.map(chapter => ({
    id: chapter.id,
    name: chapter.name,
    description: chapter.description,
    difficulty: chapter.difficulty,
    gridSize: chapter.gridSize,
    color: chapter.color,
    levelCount: chapter.levels.length
  }));
}

export function getPlaceholderImage(chapterId, index) {
  const placeholders = LEVELS_CONFIG.placeholderImages[chapterId];
  if (!placeholders || !placeholders[index]) {
    return { name: '未知', color: '#CCCCCC', icon: '❓' };
  }
  return placeholders[index];
}

export default LEVELS_CONFIG;