import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const geoPath = path.join(root, 'src/assets/geo/china.json')
const outPath = path.join(root, 'src/data/provinces.json')

const g = JSON.parse(fs.readFileSync(geoPath, 'utf8'))

const regionMap = {
  北京市: '华北',
  天津市: '华北',
  河北省: '华北',
  山西省: '华北',
  内蒙古自治区: '华北',
  辽宁省: '东北',
  吉林省: '东北',
  黑龙江省: '东北',
  上海市: '华东',
  江苏省: '华东',
  浙江省: '华东',
  安徽省: '华东',
  福建省: '华东',
  江西省: '华东',
  山东省: '华东',
  河南省: '华中',
  湖北省: '华中',
  湖南省: '华中',
  广东省: '华南',
  广西壮族自治区: '华南',
  海南省: '华南',
  重庆市: '西南',
  四川省: '西南',
  贵州省: '西南',
  云南省: '西南',
  西藏自治区: '西南',
  陕西省: '西北',
  甘肃省: '西北',
  青海省: '西北',
  宁夏回族自治区: '西北',
  新疆维吾尔自治区: '西北',
  台湾省: '港澳台',
  香港特别行政区: '港澳台',
  澳门特别行政区: '港澳台'
}

const cuisineMap = {
  北京市: '京菜',
  天津市: '津菜',
  河北省: '冀菜',
  山西省: '晋菜',
  内蒙古自治区: '蒙餐',
  辽宁省: '辽菜',
  吉林省: '吉菜',
  黑龙江省: '龙江菜',
  上海市: '本帮菜',
  江苏省: '淮扬菜',
  浙江省: '浙菜',
  安徽省: '徽菜',
  福建省: '闽菜',
  江西省: '赣菜',
  山东省: '鲁菜',
  河南省: '豫菜',
  湖北省: '鄂菜',
  湖南省: '湘菜',
  广东省: '粤菜',
  广西壮族自治区: '桂菜',
  海南省: '琼菜',
  重庆市: '渝菜',
  四川省: '川菜',
  贵州省: '黔菜',
  云南省: '滇菜',
  西藏自治区: '藏餐',
  陕西省: '陕菜',
  甘肃省: '陇菜',
  青海省: '青藏风味',
  宁夏回族自治区: '清真风味',
  新疆维吾尔自治区: '新疆菜',
  台湾省: '台湾菜',
  香港特别行政区: '港式粤菜',
  澳门特别行政区: '澳葡风味'
}

const capitals = {
  北京市: '北京',
  天津市: '天津',
  河北省: '石家庄',
  山西省: '太原',
  内蒙古自治区: '呼和浩特',
  辽宁省: '沈阳',
  吉林省: '长春',
  黑龙江省: '哈尔滨',
  上海市: '上海',
  江苏省: '南京',
  浙江省: '杭州',
  安徽省: '合肥',
  福建省: '福州',
  江西省: '南昌',
  山东省: '济南',
  河南省: '郑州',
  湖北省: '武汉',
  湖南省: '长沙',
  广东省: '广州',
  广西壮族自治区: '南宁',
  海南省: '海口',
  重庆市: '重庆',
  四川省: '成都',
  贵州省: '贵阳',
  云南省: '昆明',
  西藏自治区: '拉萨',
  陕西省: '西安',
  甘肃省: '兰州',
  青海省: '西宁',
  宁夏回族自治区: '银川',
  新疆维吾尔自治区: '乌鲁木齐',
  台湾省: '台北',
  香港特别行政区: '香港',
  澳门特别行政区: '澳门'
}

function shortName(full) {
  return full
    .replace(/壮族自治区$/, '')
    .replace(/维吾尔自治区$/, '')
    .replace(/回族自治区$/, '')
    .replace(/自治区$/, '')
    .replace(/特别行政区$/, '')
    .replace(/省$/, '')
    .replace(/市$/, '')
}

const arr = []
for (const f of g.features) {
  const name = f.properties?.name
  if (!name || !String(name).trim()) continue
  const c = f.properties.centroid || f.properties.center
  if (!c || c.length < 2) continue
  const cuisine = cuisineMap[name] || '地方菜'
  arr.push({
    name,
    shortName: shortName(name),
    capital: capitals[name] || shortName(name),
    region: regionMap[name] || '其他',
    cuisine,
    description: `${name.replace(/省|市|自治区|特别行政区/g, '')}饮食文化与${cuisine}交融，各具地域特色。`,
    famousFoods: ['地方名菜', '特色小吃', '家常风味'],
    coordinates: [Number(c[0]), Number(c[1])]
  })
}

arr.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
arr.forEach((p, i) => {
  p.id = i + 1
})

fs.writeFileSync(outPath, JSON.stringify(arr, null, 2), 'utf8')
console.log('wrote', arr.length, 'provinces to', outPath)
