# 数据目录说明

本目录按“运行时数据”和“原始拆分数据”混合维护，采用保守整理策略：不改现有代码引用路径。

## 运行时主数据（被前端直接加载）

- `provinces.json`：省份基础数据
- `dishes.json`：主菜品数据（会被 store 加载）
- `solarTerms.json`：24 节气基础数据
- `solar_terms_dishes_complete.json`：节气菜品扩展数据（与 `dishes.json` 合并使用）
- `prefectureCities.json`：地级市与相关映射
- `seasons.json`、`cuisines.json`：专题页面数据

## 原始拆分数据（用于构建/合并）

- `hubei-dishes/`：湖北菜逐条拆分文件（`dish-001.json` ...）

对应合并脚本：`scripts/merge-hubei-dishes.mjs`

## 维护约定

1. 新增“运行时主数据”文件时，优先保持语义化命名（如 `moduleName.json`）。
2. 新增“拆分数据”时，统一放在拆分目录内，避免散落到根层级。
3. 如果调整文件路径，需同步修改：
   - `src/stores/data.js`
   - `scripts/merge-hubei-dishes.mjs`
