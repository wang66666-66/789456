import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

const embeddedPath = path.join(root, 'src/data/hubei-embedded.json')
const perDishDir = path.join(root, 'src/data/hubei-dishes')
const partsDir = path.join(root, 'src/data/dishes-hubei-parts')
const chunkNames = ['hubei-chunk-a.json', 'hubei-chunk-b.json', 'hubei-chunk-c.json']

let all = []

if (fs.existsSync(embeddedPath)) {
  all = JSON.parse(fs.readFileSync(embeddedPath, 'utf8'))
  if (!Array.isArray(all)) throw new Error('hubei-embedded.json must be a JSON array')
} else {
  const chunkPaths = chunkNames
    .map((n) => path.join(root, 'src/data', n))
    .filter((p) => fs.existsSync(p))
  if (chunkPaths.length > 0) {
    for (const p of chunkPaths) {
      const part = JSON.parse(fs.readFileSync(p, 'utf8'))
      if (!Array.isArray(part)) throw new Error(`${path.basename(p)} must be a JSON array`)
      all = all.concat(part)
    }
  }
}

if (all.length === 0) {
  const dataDir = path.join(root, 'src/data')
  const tempFiles = fs
    .readdirSync(dataDir)
    .filter((f) => /^temp-hubei-\d+\.json$/.test(f))
    .sort((a, b) => {
      const na = parseInt(String(a.match(/\d+/)?.[0] ?? '0'), 10)
      const nb = parseInt(String(b.match(/\d+/)?.[0] ?? '0'), 10)
      return na - nb
    })
  for (const f of tempFiles) {
    const part = JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf8'))
    if (!Array.isArray(part)) throw new Error(`${f} must be a JSON array`)
    all = all.concat(part)
  }
}

if (all.length === 0 && fs.existsSync(perDishDir)) {
  const files = fs
    .readdirSync(perDishDir)
    .filter((f) => f.endsWith('.json'))
    .sort((a, b) => {
      const na = parseInt(String(a.match(/\d+/)?.[0] ?? '0'), 10)
      const nb = parseInt(String(b.match(/\d+/)?.[0] ?? '0'), 10)
      return na - nb
    })
  for (const f of files) {
    const one = JSON.parse(fs.readFileSync(path.join(perDishDir, f), 'utf8'))
    if (Array.isArray(one)) throw new Error(`${f}: expected one object, got array`)
    all.push(one)
  }
}

if (all.length === 0 && fs.existsSync(partsDir)) {
  const files = fs
    .readdirSync(partsDir)
    .filter((f) => f.endsWith('.json'))
    .sort()
  for (const f of files) {
    const chunk = JSON.parse(fs.readFileSync(path.join(partsDir, f), 'utf8'))
    if (!Array.isArray(chunk)) {
      throw new Error(`${f} must be a JSON array`)
    }
    all = all.concat(chunk)
  }
}

if (all.length === 0) {
  throw new Error(
    'Add hubei-embedded.json, hubei-chunk-a/b/c.json, hubei-dishes/*.json, or dishes-hubei-parts/*.json'
  )
}

const HUBEI_PROVINCE_ID = 14

const out = all.map((d) => ({
  ...d,
  provinceId: HUBEI_PROVINCE_ID,
  province: '湖北省',
  description: d.cultural_meaning,
  image: '/images/dishes/default.jpg'
}))

fs.writeFileSync(path.join(root, 'src/data/dishes.json'), JSON.stringify(out, null, 2), 'utf8')
console.log('dishes.json written:', out.length, 'items')
