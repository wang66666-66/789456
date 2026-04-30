/**
 * 地级市散点：仅从 JSON 读取；当前仅配置湖北省。其他省份无散点，仅地图放大。
 */
import realPrefectureRows from '@/data/prefectureCities.json'

function walkRing(coord, bb) {
  if (typeof coord[0] === 'number') {
    const [lng, lat] = coord
    bb.minLng = Math.min(bb.minLng, lng)
    bb.maxLng = Math.max(bb.maxLng, lng)
    bb.minLat = Math.min(bb.minLat, lat)
    bb.maxLat = Math.max(bb.maxLat, lat)
  } else {
    for (const c of coord) {
      walkRing(c, bb)
    }
  }
}

export function bboxFromFeature(feature) {
  if (!feature?.geometry?.coordinates) return null
  const bb = {
    minLng: Infinity,
    maxLng: -Infinity,
    minLat: Infinity,
    maxLat: -Infinity
  }
  walkRing(feature.geometry.coordinates, bb)
  if (!Number.isFinite(bb.minLng)) return null
  return {
    minLng: bb.minLng,
    maxLng: bb.maxLng,
    minLat: bb.minLat,
    maxLat: bb.maxLat,
    cx: (bb.minLng + bb.maxLng) / 2,
    cy: (bb.minLat + bb.maxLat) / 2
  }
}

/**
 * @param {object} province - store 中的省份（含 name）
 * @returns {{ name: string, value: [number, number] }[]}
 */
export function getPrefectureScatterData(province) {
  if (!province?.name) return []
  const rows = realPrefectureRows.filter((row) => row.province === province.name)
  return rows.map((c) => ({
    name: c.name,
    value: [c.lng, c.lat]
  }))
}
